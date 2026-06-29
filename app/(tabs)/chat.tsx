import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useColors } from "@/hooks/useColors";
import { API_BASE } from "@/constants/apiUrl";

const USER_KEY = "@ddah_user";

interface UserInfo { name: string; phone: string; city: string; }
interface Message {
  id: number;
  customerPhone: string;
  customerName: string;
  message: string | null;
  imageBase64: string | null;
  fromAdmin: boolean;
  isRead: boolean;
  createdAt: string;
}

async function fetchMessages(phone: string): Promise<Message[]> {
  try {
    const r = await fetch(`${API_BASE}/messages/${encodeURIComponent(phone)}`);
    if (!r.ok) return [];
    return r.json();
  } catch { return []; }
}

async function sendMessage(payload: {
  customerName: string;
  customerPhone: string;
  message?: string;
  imageBase64?: string;
}): Promise<boolean> {
  try {
    const r = await fetch(`${API_BASE}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return r.ok;
  } catch { return false; }
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const s = styles(colors);
  const flatRef = useRef<FlatList>(null);

  const [user, setUser] = useState<UserInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // Sign-in form state
  const [loginName, setLoginName] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginCity, setLoginCity] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Load user from storage
  useEffect(() => {
    AsyncStorage.getItem(USER_KEY).then((val) => {
      if (val) setUser(JSON.parse(val));
    });
  }, []);

  // Poll messages every 8 seconds
  const loadMessages = useCallback(async () => {
    if (!user) return;
    const data = await fetchMessages(user.phone);
    setMessages(data);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    loadMessages().finally(() => setLoading(false));
    const interval = setInterval(loadMessages, 8000);
    return () => clearInterval(interval);
  }, [user, loadMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleLogin = async () => {
    if (!loginName.trim()) {
      setLoginError("Please enter your name.");
      return;
    }
    if (!loginPhone.trim() || loginPhone.trim().length < 10) {
      setLoginError("Please enter a valid 10-digit phone number.");
      return;
    }
    setLoginLoading(true);
    const info: UserInfo = {
      name: loginName.trim(),
      phone: loginPhone.trim(),
      city: loginCity.trim() || "Delhi",
    };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(info));
    setUser(info);
    setLoginName("");
    setLoginPhone("");
    setLoginCity("");
    setLoginError("");
    setLoginLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo access to send images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.5,
      base64: true,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]?.base64) {
      setSelectedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSend = async () => {
    if (!user) return;
    if (!text.trim() && !selectedImage) return;
    setSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const ok = await sendMessage({
      customerName: user.name,
      customerPhone: user.phone,
      message: text.trim() || undefined,
      imageBase64: selectedImage || undefined,
    });
    if (ok) {
      setText("");
      setSelectedImage(null);
      await loadMessages();
    } else {
      Alert.alert("Error", "Message send failed. Check your internet.");
    }
    setSending(false);
  };

  // ─── Not logged in → show inline sign-in form ───────────────────────────
  if (!user) {
    return (
      <KeyboardAvoidingView
        style={[s.container, { paddingTop: topPad }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={[s.avatarSmall, { backgroundColor: colors.red + "22" }]}>
              <Feather name="message-circle" size={18} color={colors.red} />
            </View>
            <View>
              <Text style={s.headerTitle}>Chat with Us</Text>
              <Text style={s.headerSub}>Direct Delhi Auto Hub</Text>
            </View>
          </View>
        </View>

        <View style={s.loginContainer}>
          <View style={[s.iconCircle, { backgroundColor: colors.red + "22" }]}>
            <Feather name="user" size={36} color={colors.red} />
          </View>
          <Text style={s.loginTitle}>Enter Your Details</Text>
          <Text style={s.loginSub}>to start chatting with us</Text>

          <View style={s.formBox}>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Full Name *</Text>
              <TextInput
                style={[s.input, loginError && loginName.trim() === "" ? { borderColor: "#ef4444" } : {}]}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor={colors.mutedForeground}
                value={loginName}
                onChangeText={(t) => { setLoginName(t); setLoginError(""); }}
                autoCapitalize="words"
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Mobile Number *</Text>
              <TextInput
                style={[s.input, loginError && loginPhone.trim().length < 10 ? { borderColor: "#ef4444" } : {}]}
                placeholder="10-digit mobile number"
                placeholderTextColor={colors.mutedForeground}
                value={loginPhone}
                onChangeText={(t) => { setLoginPhone(t.replace(/\D/g, "")); setLoginError(""); }}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>City</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Delhi"
                placeholderTextColor={colors.mutedForeground}
                value={loginCity}
                onChangeText={setLoginCity}
                autoCapitalize="words"
              />
            </View>

            {loginError ? <Text style={s.errorText}>{loginError}</Text> : null}

            <Pressable
              style={[s.loginBtn, loginLoading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={loginLoading}
            >
              {loginLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Feather name="message-circle" size={18} color="#fff" />
                  <Text style={s.loginBtnText}>Start Chatting</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ─── Logged in → show chat ───────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={[s.container, { paddingTop: topPad }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={topPad}
    >
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={[s.avatarSmall, { backgroundColor: colors.red + "22" }]}>
            <Feather name="truck" size={18} color={colors.red} />
          </View>
          <View>
            <Text style={s.headerTitle}>Direct Delhi Auto Hub</Text>
            <Text style={s.headerSub}>Hi {user.name}!</Text>
          </View>
        </View>
        <Pressable onPress={loadMessages} style={{ padding: 6 }}>
          <Feather name="refresh-cw" size={18} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {/* Messages */}
      {loading && messages.length === 0 ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.red} />
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 8, gap: 10 }}
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <Feather name="message-circle" size={40} color={colors.mutedForeground} />
              <Text style={s.emptyText}>No messages yet</Text>
              <Text style={s.emptySub}>Send a message or photo to get started!</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMine = !item.fromAdmin;
            return (
              <View style={[s.msgRow, isMine ? s.msgRowRight : s.msgRowLeft]}>
                {!isMine && (
                  <View style={[s.msgAvatar, { backgroundColor: colors.red + "22" }]}>
                    <Feather name="truck" size={14} color={colors.red} />
                  </View>
                )}
                <View style={[s.bubble, isMine ? s.bubbleMine : s.bubbleAdmin]}>
                  {item.imageBase64 && (
                    <Image
                      source={{ uri: item.imageBase64 }}
                      style={s.msgImage}
                      resizeMode="cover"
                    />
                  )}
                  {item.message ? (
                    <Text style={[s.bubbleText, isMine ? s.bubbleTextMine : s.bubbleTextAdmin]}>
                      {item.message}
                    </Text>
                  ) : null}
                  <Text style={[s.msgTime, { color: isMine ? "rgba(255,255,255,0.6)" : colors.mutedForeground }]}>
                    {new Date(item.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Selected image preview */}
      {selectedImage && (
        <View style={s.imagePreview}>
          <Image source={{ uri: selectedImage }} style={s.previewImg} resizeMode="cover" />
          <Pressable onPress={() => setSelectedImage(null)} style={s.removeImg}>
            <Feather name="x" size={14} color="#fff" />
          </Pressable>
        </View>
      )}

      {/* Input bar */}
      <View style={[s.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable onPress={pickImage} style={s.photoBtn}>
          <Feather name="image" size={22} color={colors.mutedForeground} />
        </Pressable>
        <TextInput
          style={s.chatInput}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={handleSend}
          disabled={sending || (!text.trim() && !selectedImage)}
          style={[s.sendBtn, { opacity: sending || (!text.trim() && !selectedImage) ? 0.4 : 1 }]}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Feather name="send" size={18} color="#fff" />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    avatarSmall: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    headerTitle: { color: colors.foreground, fontSize: 15, fontWeight: "700" },
    headerSub: { color: colors.mutedForeground, fontSize: 12 },

    // Sign-in form
    loginContainer: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: 32,
    },
    iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
    loginTitle: { color: colors.foreground, fontSize: 22, fontWeight: "800", marginTop: 16 },
    loginSub: { color: colors.mutedForeground, fontSize: 15, marginTop: 4, marginBottom: 24 },
    formBox: { width: "100%", gap: 14 },
    inputGroup: { gap: 6 },
    inputLabel: {
      color: colors.mutedForeground,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: colors.secondary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 13,
      color: colors.foreground,
      fontSize: 15,
    },
    errorText: { color: "#ef4444", fontSize: 13, textAlign: "center" },
    loginBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.red,
      borderRadius: 14,
      paddingVertical: 16,
      marginTop: 4,
    },
    loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

    // Chat UI
    emptyBox: { alignItems: "center", gap: 8, paddingTop: 80 },
    emptyText: { color: colors.foreground, fontSize: 16, fontWeight: "700" },
    emptySub: { color: colors.mutedForeground, fontSize: 14, textAlign: "center" },
    msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 6, maxWidth: "85%" },
    msgRowRight: { alignSelf: "flex-end" },
    msgRowLeft: { alignSelf: "flex-start" },
    msgAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 4 },
    bubble: { borderRadius: 16, padding: 10, maxWidth: "100%", gap: 4 },
    bubbleMine: { backgroundColor: colors.red, borderBottomRightRadius: 4 },
    bubbleAdmin: { backgroundColor: colors.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
    bubbleText: { fontSize: 15, lineHeight: 20 },
    bubbleTextMine: { color: "#fff" },
    bubbleTextAdmin: { color: colors.foreground },
    msgTime: { fontSize: 10, textAlign: "right" },
    msgImage: { width: 200, height: 150, borderRadius: 10, marginBottom: 4 },
    imagePreview: { margin: 12, alignSelf: "flex-start" },
    previewImg: { width: 80, height: 60, borderRadius: 8 },
    removeImg: {
      position: "absolute", top: -6, right: -6,
      backgroundColor: "#333", borderRadius: 10, width: 20, height: 20,
      alignItems: "center", justifyContent: "center",
    },
    inputBar: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
      gap: 8,
    },
    photoBtn: { padding: 8, marginBottom: 2 },
    chatInput: {
      flex: 1,
      backgroundColor: colors.secondary,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 10,
      color: colors.foreground,
      fontSize: 15,
      maxHeight: 100,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sendBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.red,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 2,
    },
  });

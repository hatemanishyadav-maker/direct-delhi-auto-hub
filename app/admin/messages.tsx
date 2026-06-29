import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { API_BASE } from "@/constants/apiUrl";

interface Conversation {
  customerName: string;
  customerPhone: string;
  lastMessage: string | null;
  lastImage: boolean;
  lastAt: string;
  unread: number;
}

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

export default function AdminMessages() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const s = styles(colors);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const flatRef = useRef<FlatList>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/messages`);
      if (r.ok) setConversations(await r.json());
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  const loadMessages = useCallback(async (phone: string) => {
    try {
      const r = await fetch(`${API_BASE}/messages/${encodeURIComponent(phone)}`);
      if (r.ok) {
        const data = await r.json();
        setMessages(data);
        setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
      }
      await fetch(`${API_BASE}/messages/read/${encodeURIComponent(phone)}`, { method: "PUT" });
      setConversations(prev => prev.map(c => c.customerPhone === phone ? { ...c, unread: 0 } : c));
    } catch {}
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (!selected) return;
    loadMessages(selected.customerPhone);
    const interval = setInterval(() => loadMessages(selected.customerPhone), 8000);
    return () => clearInterval(interval);
  }, [selected, loadMessages]);

  const handleSend = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const r = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: selected.customerName,
          customerPhone: selected.customerPhone,
          message: reply.trim(),
          fromAdmin: true,
        }),
      });
      if (r.ok) {
        setReply("");
        await loadMessages(selected.customerPhone);
        await loadConversations();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert("Error", "Failed to send reply.");
      }
    } catch {
      Alert.alert("Error", "Network error. Check connection.");
    }
    setSending(false);
  };

  if (selected) {
    return (
      <KeyboardAvoidingView
        style={[s.container, { paddingTop: topPad }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? topPad : 0}
      >
        <View style={s.header}>
          <Pressable onPress={() => { setSelected(null); setMessages([]); }} style={s.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <View style={s.headerInfo}>
            <Text style={s.headerName}>{selected.customerName}</Text>
            <Text style={s.headerPhone}>+91 {selected.customerPhone}</Text>
          </View>
          <Pressable onPress={() => loadMessages(selected.customerPhone)} style={{ padding: 6 }}>
            <Feather name="refresh-cw" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ padding: 14, paddingBottom: 8, gap: 8 }}
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <Feather name="message-circle" size={36} color={colors.mutedForeground} />
              <Text style={s.emptyText}>No messages yet</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isAdmin = item.fromAdmin;
            return (
              <View style={[s.msgRow, isAdmin ? s.msgRowRight : s.msgRowLeft]}>
                <View style={[s.bubble, isAdmin ? s.bubbleAdmin : s.bubbleCustomer]}>
                  {item.message ? (
                    <Text style={[s.bubbleText, isAdmin ? s.textWhite : s.textFore]}>
                      {item.message}
                    </Text>
                  ) : null}
                  <Text style={[s.msgTime, { color: isAdmin ? "rgba(255,255,255,0.6)" : colors.mutedForeground }]}>
                    {new Date(item.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    {isAdmin ? " · You" : ""}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        <View style={[s.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            style={s.input}
            value={reply}
            onChangeText={setReply}
            placeholder="Type a reply..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
          />
          <Pressable
            onPress={handleSend}
            disabled={sending || !reply.trim()}
            style={[s.sendBtn, { opacity: sending || !reply.trim() ? 0.4 : 1 }]}
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

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={s.headerInfo}>
          <Text style={s.headerName}>Customer Messages</Text>
          <Text style={s.headerPhone}>{conversations.length} conversations</Text>
        </View>
        <Pressable
          onPress={() => { setRefreshing(true); loadConversations(); }}
          style={{ padding: 6 }}
        >
          <Feather name={refreshing ? "loader" : "refresh-cw"} size={18} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {loading ? (
        <View style={s.centerBox}>
          <ActivityIndicator color={colors.red} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={s.centerBox}>
          <Feather name="message-circle" size={48} color={colors.mutedForeground} />
          <Text style={s.emptyText}>No customer messages yet</Text>
          <Text style={[s.emptyText, { fontSize: 13, marginTop: 4 }]}>
            Messages from app users will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.customerPhone}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <Pressable
              style={s.convItem}
              onPress={() => { setSelected(item); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <View style={[s.avatar, { backgroundColor: colors.red + "22" }]}>
                <Feather name="user" size={20} color={colors.red} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.convTop}>
                  <Text style={s.convName}>{item.customerName}</Text>
                  {item.unread > 0 && (
                    <View style={[s.badge, { backgroundColor: colors.red }]}>
                      <Text style={s.badgeText}>{item.unread}</Text>
                    </View>
                  )}
                </View>
                <Text style={s.convPhone}>+91 {item.customerPhone}</Text>
                <Text style={s.convPreview} numberOfLines={1}>
                  {item.lastImage && !item.lastMessage ? "📷 Photo" : item.lastMessage || "…"}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
      gap: 12,
    },
    backBtn: { padding: 4 },
    headerInfo: { flex: 1 },
    headerName: { color: colors.foreground, fontSize: 16, fontWeight: "700" },
    headerPhone: { color: colors.mutedForeground, fontSize: 12 },
    centerBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    emptyBox: { alignItems: "center", gap: 8, paddingTop: 60 },
    emptyText: { color: colors.mutedForeground, fontSize: 15, textAlign: "center" },
    convItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
      backgroundColor: colors.card,
    },
    avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
    convTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    convName: { color: colors.foreground, fontSize: 15, fontWeight: "700" },
    convPhone: { color: colors.mutedForeground, fontSize: 12, marginTop: 1 },
    convPreview: { color: colors.mutedForeground, fontSize: 13, marginTop: 2 },
    badge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
    badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
    msgRow: { flexDirection: "row", maxWidth: "85%" },
    msgRowRight: { alignSelf: "flex-end" },
    msgRowLeft: { alignSelf: "flex-start" },
    bubble: { borderRadius: 16, padding: 10, gap: 4 },
    bubbleAdmin: { backgroundColor: colors.red, borderBottomRightRadius: 4 },
    bubbleCustomer: { backgroundColor: colors.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
    bubbleText: { fontSize: 15, lineHeight: 20 },
    textWhite: { color: "#fff" },
    textFore: { color: colors.foreground },
    msgTime: { fontSize: 10, textAlign: "right" },
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
    input: {
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
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.red,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 2,
    },
  });

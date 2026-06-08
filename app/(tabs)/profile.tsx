import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useWishlist } from "@/contexts/WishlistContext";
import { useColors } from "@/hooks/useColors";

const WHATSAPP_NUMBER = "919753662278";
const PHONE_NUMBER = "9753662278";
const ADMIN_PIN = "1234";
const USER_KEY = "@ddah_user";

interface UserInfo {
  name: string;
  phone: string;
  city: string;
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items: wishlist } = useWishlist();
  const [user, setUser] = useState<UserInfo | null>(null);

  // Admin PIN modal
  const [pinModal, setPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // Login modal
  const [loginModal, setLoginModal] = useState(false);
  const [loginName, setLoginName] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginCity, setLoginCity] = useState("");
  const [loginError, setLoginError] = useState("");

  const s = styles(colors);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  useEffect(() => {
    AsyncStorage.getItem(USER_KEY).then((val) => {
      if (val) setUser(JSON.parse(val));
    });
  }, []);

  const handleLogin = async () => {
    if (!loginName.trim()) {
      setLoginError("Please enter your name.");
      return;
    }
    if (!loginPhone.trim() || loginPhone.trim().length < 10) {
      setLoginError("Please enter a valid 10-digit phone number.");
      return;
    }
    const info: UserInfo = {
      name: loginName.trim(),
      phone: loginPhone.trim(),
      city: loginCity.trim() || "Delhi",
    };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(info));
    setUser(info);
    setLoginModal(false);
    setLoginName("");
    setLoginPhone("");
    setLoginCity("");
    setLoginError("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem(USER_KEY);
          setUser(null);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  const openLoginModal = () => {
    setLoginName(user?.name || "");
    setLoginPhone(user?.phone || "");
    setLoginCity(user?.city || "");
    setLoginError("");
    setLoginModal(true);
  };

  const openWhatsApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I need help with my order.`);
  };

  const callUs = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${PHONE_NUMBER}`);
  };

  const handleAdminPin = () => {
    if (pinInput === ADMIN_PIN) {
      setPinModal(false);
      setPinInput("");
      setPinError("");
      router.push("/admin" as any);
    } else {
      setPinError("Incorrect PIN. Try again.");
      setPinInput("");
    }
  };

  const menuItems = [
    { icon: "heart", label: "Wishlist", subtitle: `${wishlist.length} items saved`, onPress: () => {} },
    { icon: "package", label: "My Orders", subtitle: "Track your orders", onPress: () => {} },
    { icon: "map-pin", label: "Saved Addresses", subtitle: user?.city ? `${user.city}` : "Manage delivery addresses", onPress: () => {} },
  ];

  const supportItems = [
    { icon: "message-circle", label: "WhatsApp Support", subtitle: "Chat with us", onPress: openWhatsApp, accent: true },
    { icon: "phone", label: "Call Us", subtitle: "+91 97536 62278", onPress: callUs },
    { icon: "info", label: "About Us", subtitle: "Direct Delhi Auto Hub", onPress: () => {} },
    { icon: "map", label: "Store Location", subtitle: "Delhi, India", onPress: () => Linking.openURL("https://maps.google.com/?q=Delhi+India") },
  ];

  const renderItem = (item: { icon: string; label: string; subtitle: string; onPress: () => void }, accent?: boolean) => (
    <Pressable key={item.label} style={s.menuItem} onPress={item.onPress}>
      <View style={[s.iconBox, { backgroundColor: accent ? colors.red + "22" : colors.secondary }]}>
        <Feather name={item.icon as any} size={20} color={accent ? colors.red : colors.foreground} />
      </View>
      <View style={s.menuInfo}>
        <Text style={[s.menuLabel, accent && { color: colors.red }]}>{item.label}</Text>
        <Text style={s.menuSub}>{item.subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Text style={s.title}>My Account</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Pressable style={s.profileCard} onPress={openLoginModal}>
          <View style={s.avatar}>
            <Feather name="user" size={32} color={colors.red} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.userName}>{user ? user.name : "Guest User"}</Text>
            <Text style={s.userSub}>
              {user ? `+91 ${user.phone} · ${user.city}` : "Tap to sign in"}
            </Text>
          </View>
          {user ? (
            <Pressable onPress={handleLogout} style={s.logoutBtn}>
              <Feather name="log-out" size={16} color={colors.mutedForeground} />
            </Pressable>
          ) : (
            <View style={s.signInBadge}>
              <Text style={s.signInText}>Sign In</Text>
            </View>
          )}
        </Pressable>

        <Text style={s.sectionLabel}>My Activity</Text>
        <View style={s.card}>
          {menuItems.map((item) => renderItem(item))}
        </View>

        <Text style={s.sectionLabel}>Support & Info</Text>
        <View style={s.card}>
          {supportItems.map((item) => renderItem(item, (item as any).accent))}
        </View>

        <Pressable style={s.adminCard} onPress={() => { setPinInput(""); setPinError(""); setPinModal(true); }}>
          <View style={[s.iconBox, { backgroundColor: colors.red + "22" }]}>
            <Feather name="shield" size={20} color={colors.red} />
          </View>
          <View style={s.menuInfo}>
            <Text style={[s.menuLabel, { color: colors.red }]}>Admin Panel</Text>
            <Text style={s.menuSub}>Manage products, orders & inventory</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.red} />
        </Pressable>

        <View style={s.businessCard}>
          <View style={s.businessHeader}>
            <Feather name="truck" size={20} color={colors.red} />
            <Text style={s.businessTitle}>Direct Delhi Auto Hub</Text>
          </View>
          <Text style={s.businessInfo}>Owner: Manish Yadav</Text>
          <Text style={s.businessInfo}>Phone: +91 97536 62278</Text>
          <Text style={s.businessInfo}>Location: Delhi, India</Text>
          <Text style={s.businessInfo}>Industry: Car Accessories & Auto Parts</Text>
        </View>

        <View style={{ height: Platform.OS === "web" ? 100 : 90 + bottomPad }} />
      </ScrollView>

      {/* Login / Edit Profile Modal */}
      <Modal visible={loginModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <View style={s.modalIconBox}>
                <Feather name="user" size={24} color={colors.red} />
              </View>
              <Text style={s.modalTitle}>{user ? "Edit Profile" : "Sign In"}</Text>
              <Text style={s.modalSub}>Enter your details to continue</Text>
            </View>

            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Full Name *</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Manish Yadav"
                placeholderTextColor={colors.mutedForeground}
                value={loginName}
                onChangeText={(t) => { setLoginName(t); setLoginError(""); }}
                autoCapitalize="words"
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Phone Number *</Text>
              <TextInput
                style={s.input}
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

            {loginError ? <Text style={s.pinError}>{loginError}</Text> : null}

            <View style={s.modalBtns}>
              <Pressable style={s.cancelBtn} onPress={() => setLoginModal(false)}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={s.confirmBtn} onPress={handleLogin}>
                <Text style={s.confirmBtnText}>{user ? "Save" : "Sign In"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Admin PIN Modal */}
      <Modal visible={pinModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <View style={s.modalIconBox}>
                <Feather name="shield" size={24} color={colors.red} />
              </View>
              <Text style={s.modalTitle}>Admin Access</Text>
              <Text style={s.modalSub}>Enter your 4-digit PIN to continue</Text>
            </View>
            <TextInput
              style={[s.pinInput, pinError ? { borderColor: "#ef4444" } : {}]}
              placeholder="Enter PIN"
              placeholderTextColor={colors.mutedForeground}
              value={pinInput}
              onChangeText={(t) => { setPinInput(t); setPinError(""); }}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              autoFocus
            />
            {pinError ? <Text style={s.pinError}>{pinError}</Text> : null}
            <Text style={s.pinHint}>Default PIN: 1234</Text>
            <View style={s.modalBtns}>
              <Pressable style={s.cancelBtn} onPress={() => { setPinModal(false); setPinInput(""); setPinError(""); }}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={s.confirmBtn} onPress={handleAdminPin}>
                <Text style={s.confirmBtnText}>Enter</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: 16,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { color: colors.foreground, fontSize: 22, fontWeight: "800" },
    profileCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      margin: 16,
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.red + "22",
      alignItems: "center",
      justifyContent: "center",
    },
    userName: { color: colors.foreground, fontSize: 18, fontWeight: "700" },
    userSub: { color: colors.mutedForeground, fontSize: 13, marginTop: 2 },
    signInBadge: {
      backgroundColor: colors.red,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    signInText: { color: "#fff", fontSize: 13, fontWeight: "700" },
    logoutBtn: {
      padding: 8,
    },
    sectionLabel: {
      color: colors.mutedForeground,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      paddingHorizontal: 16,
      marginBottom: 8,
      marginTop: 4,
    },
    card: {
      marginHorizontal: 16,
      marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    iconBox: {
      width: 38,
      height: 38,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    menuInfo: { flex: 1 },
    menuLabel: { color: colors.foreground, fontSize: 15, fontWeight: "600" },
    menuSub: { color: colors.mutedForeground, fontSize: 12, marginTop: 1 },
    adminCard: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 16,
      marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.red + "55",
      padding: 16,
      gap: 12,
    },
    businessCard: {
      margin: 16,
      marginTop: 0,
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 3,
      borderLeftColor: colors.red,
      padding: 16,
      gap: 6,
    },
    businessHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    businessTitle: { color: colors.foreground, fontSize: 16, fontWeight: "700" },
    businessInfo: { color: colors.mutedForeground, fontSize: 13 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
    modal: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      gap: 14,
      paddingBottom: Platform.OS === "ios" ? 40 : 24,
    },
    modalHeader: { alignItems: "center", gap: 8 },
    modalIconBox: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.red + "22",
      alignItems: "center",
      justifyContent: "center",
    },
    modalTitle: { color: colors.foreground, fontSize: 20, fontWeight: "800" },
    modalSub: { color: colors.mutedForeground, fontSize: 14, textAlign: "center" },
    inputGroup: { gap: 6 },
    inputLabel: { color: colors.mutedForeground, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
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
    pinInput: {
      backgroundColor: colors.secondary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: colors.foreground,
      fontSize: 24,
      textAlign: "center",
      letterSpacing: 8,
    },
    pinError: { color: "#ef4444", fontSize: 13, textAlign: "center" },
    pinHint: { color: colors.mutedForeground, fontSize: 12, textAlign: "center" },
    modalBtns: { flexDirection: "row", gap: 12 },
    cancelBtn: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelBtnText: { color: colors.mutedForeground, fontSize: 15, fontWeight: "600" },
    confirmBtn: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: colors.red,
    },
    confirmBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  });

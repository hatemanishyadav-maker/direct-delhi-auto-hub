import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "@/contexts/CartContext";
import { useColors } from "@/hooks/useColors";

type PaymentMethod = "cod" | "upi";

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, totalPrice, clearCart } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [upiId, setUpiId] = useState("");
  const [placing, setPlacing] = useState(false);
  const s = styles(colors);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handlePlaceOrder = async () => {
    if (!name.trim() || !phone.trim() || !address.trim() || !pincode.trim()) {
      Alert.alert("Incomplete Details", "Please fill in all required fields.");
      return;
    }
    if (payment === "upi" && !upiId.trim()) {
      Alert.alert("UPI ID Required", "Please enter your UPI ID.");
      return;
    }
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 1500));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    clearCart();
    setPlacing(false);
    Alert.alert(
      "Order Placed!",
      `Thank you, ${name}! Your order of ₹${totalPrice.toLocaleString()} has been placed successfully. We'll call you at ${phone} to confirm.`,
      [{ text: "OK", onPress: () => router.replace("/(tabs)" as any) }]
    );
  };

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={s.title}>Checkout</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.sectionLabel}>Delivery Address</Text>
        <View style={s.card}>
          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>Full Name *</Text>
            <TextInput
              style={s.input}
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
            />
          </View>
          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>Phone Number *</Text>
            <TextInput
              style={s.input}
              placeholder="+91 XXXXXXXXXX"
              placeholderTextColor={colors.mutedForeground}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>Full Address *</Text>
            <TextInput
              style={[s.input, s.multiline]}
              placeholder="House no., Street, Area"
              placeholderTextColor={colors.mutedForeground}
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
            />
          </View>
          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>Pincode *</Text>
            <TextInput
              style={s.input}
              placeholder="6-digit pincode"
              placeholderTextColor={colors.mutedForeground}
              value={pincode}
              onChangeText={setPincode}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
        </View>

        <Text style={s.sectionLabel}>Payment Method</Text>
        <View style={s.card}>
          <Pressable
            style={[s.payOption, payment === "cod" && s.paySelected]}
            onPress={() => setPayment("cod")}
          >
            <View style={[s.radio, payment === "cod" && { borderColor: colors.red }]}>
              {payment === "cod" && <View style={s.radioInner} />}
            </View>
            <Feather name="truck" size={20} color={payment === "cod" ? colors.red : colors.mutedForeground} />
            <View>
              <Text style={[s.payLabel, payment === "cod" && { color: colors.red }]}>Cash on Delivery</Text>
              <Text style={s.paySub}>Pay when your order arrives</Text>
            </View>
          </Pressable>
          <View style={s.separator} />
          <Pressable
            style={[s.payOption, payment === "upi" && s.paySelected]}
            onPress={() => setPayment("upi")}
          >
            <View style={[s.radio, payment === "upi" && { borderColor: colors.red }]}>
              {payment === "upi" && <View style={s.radioInner} />}
            </View>
            <Feather name="smartphone" size={20} color={payment === "upi" ? colors.red : colors.mutedForeground} />
            <View>
              <Text style={[s.payLabel, payment === "upi" && { color: colors.red }]}>UPI Payment</Text>
              <Text style={s.paySub}>PhonePe, GPay, Paytm, BHIM</Text>
            </View>
          </Pressable>
          {payment === "upi" && (
            <View style={s.upiBox}>
              <TextInput
                style={s.input}
                placeholder="Enter UPI ID (e.g. name@upi)"
                placeholderTextColor={colors.mutedForeground}
                value={upiId}
                onChangeText={setUpiId}
                autoCapitalize="none"
              />
            </View>
          )}
        </View>

        <Text style={s.sectionLabel}>Order Summary</Text>
        <View style={s.card}>
          {items.map((item) => (
            <View key={item.product.id} style={s.orderRow}>
              <Text style={s.orderName} numberOfLines={1}>{item.product.name}</Text>
              <Text style={s.orderAmt}>₹{(item.product.price * item.quantity).toLocaleString()}</Text>
            </View>
          ))}
          <View style={[s.orderRow, s.totalRow]}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalAmt}>₹{totalPrice.toLocaleString()}</Text>
          </View>
          <View style={s.freeDelivery}>
            <Feather name="check-circle" size={14} color="#22c55e" />
            <Text style={s.freeText}>FREE Delivery included</Text>
          </View>
        </View>

        <Pressable
          style={[s.placeBtn, placing && { opacity: 0.7 }]}
          onPress={handlePlaceOrder}
          disabled={placing}
        >
          {placing ? (
            <Text style={s.placeBtnText}>Placing Order...</Text>
          ) : (
            <>
              <Feather name="check-circle" size={18} color="#fff" />
              <Text style={s.placeBtnText}>Place Order — ₹{totalPrice.toLocaleString()}</Text>
            </>
          )}
        </Pressable>

        <View style={{ height: Platform.OS === "web" ? 60 : 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { color: colors.foreground, fontSize: 18, fontWeight: "700" },
    scroll: { padding: 16, gap: 12 },
    sectionLabel: {
      color: colors.mutedForeground,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginTop: 8,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      gap: 12,
    },
    inputGroup: { gap: 6 },
    inputLabel: { color: colors.foreground, fontSize: 13, fontWeight: "600" },
    input: {
      backgroundColor: colors.secondary,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.foreground,
      fontSize: 14,
    },
    multiline: { minHeight: 72, textAlignVertical: "top" },
    payOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 8,
      borderRadius: 10,
    },
    paySelected: { backgroundColor: colors.red + "11" },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.red,
    },
    payLabel: { color: colors.foreground, fontSize: 15, fontWeight: "600" },
    paySub: { color: colors.mutedForeground, fontSize: 12 },
    separator: { height: 1, backgroundColor: colors.border },
    upiBox: { marginTop: -4 },
    orderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 4,
    },
    orderName: { color: colors.mutedForeground, fontSize: 13, flex: 1, marginRight: 8 },
    orderAmt: { color: colors.foreground, fontSize: 13, fontWeight: "600" },
    totalRow: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 10,
      marginTop: 4,
    },
    totalLabel: { color: colors.foreground, fontSize: 16, fontWeight: "700" },
    totalAmt: { color: colors.foreground, fontSize: 18, fontWeight: "800" },
    freeDelivery: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    freeText: { color: "#22c55e", fontSize: 13, fontWeight: "600" },
    placeBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.red,
      borderRadius: 14,
      paddingVertical: 16,
      marginTop: 8,
    },
    placeBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  });

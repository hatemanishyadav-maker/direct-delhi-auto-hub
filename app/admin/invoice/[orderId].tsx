import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAdmin } from "@/contexts/AdminContext";
import { useColors } from "@/hooks/useColors";

const GST_NUMBER = "07DDAH00000X1ZY";
const GSTIN_RATE = 0.18;

export default function InvoiceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { orders } = useAdmin();
  const order = orders.find((o) => o.id === orderId);
  const s = styles(colors);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!order) {
    return (
      <View style={[s.container, s.center]}>
        <Text style={{ color: colors.foreground }}>Order not found</Text>
      </View>
    );
  }

  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const gstAmount = Math.round(subtotal * GSTIN_RATE);
  const grandTotal = subtotal + gstAmount;
  const cgst = Math.round(gstAmount / 2);
  const sgst = Math.round(gstAmount / 2);
  const invoiceNum = `DDAH-INV-${order.orderId.split("-")[1]}`;
  const invoiceDate = new Date(order.date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.navBar}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={s.navTitle}>GST Invoice</Text>
        <Pressable style={s.shareBtn}>
          <Feather name="share-2" size={18} color={colors.red} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.invoice}>
          <View style={s.invoiceHeader}>
            <View style={s.logoRow}>
              <View style={s.logoBox}>
                <Feather name="truck" size={24} color="#fff" />
              </View>
              <View>
                <Text style={s.bizName}>DIRECT DELHI AUTO HUB</Text>
                <Text style={s.bizTagline}>Car Accessories & Auto Parts</Text>
              </View>
            </View>
            <Text style={s.taxInvoice}>TAX INVOICE</Text>
          </View>

          <View style={s.divider} />

          <View style={s.bizDetails}>
            <Text style={s.bizDetailText}>Delhi, India</Text>
            <Text style={s.bizDetailText}>Phone: +91 97536 62278</Text>
            <Text style={s.bizDetailText}>GSTIN: {GST_NUMBER}</Text>
          </View>

          <View style={s.divider} />

          <View style={s.infoGrid}>
            <View style={s.infoBlock}>
              <Text style={s.infoLabel}>Invoice Number</Text>
              <Text style={s.infoValue}>{invoiceNum}</Text>
              <Text style={s.infoLabel}>Invoice Date</Text>
              <Text style={s.infoValue}>{invoiceDate}</Text>
              <Text style={s.infoLabel}>Order ID</Text>
              <Text style={s.infoValue}>{order.orderId}</Text>
              <Text style={s.infoLabel}>Payment</Text>
              <Text style={s.infoValue}>{order.paymentMethod.toUpperCase()} · {order.paymentStatus.toUpperCase()}</Text>
            </View>
            <View style={s.infoBlock}>
              <Text style={s.infoLabel}>Bill To</Text>
              <Text style={[s.infoValue, { fontWeight: "700" }]}>{order.customerName}</Text>
              <Text style={s.bizDetailText}>{order.customerPhone}</Text>
              <Text style={s.bizDetailText}>{order.customerAddress}</Text>
            </View>
          </View>

          <View style={s.divider} />

          <View style={s.tableHeader}>
            <Text style={[s.th, { flex: 3 }]}>Product</Text>
            <Text style={[s.th, { flex: 1, textAlign: "center" }]}>Qty</Text>
            <Text style={[s.th, { flex: 1.5, textAlign: "right" }]}>Rate</Text>
            <Text style={[s.th, { flex: 1.5, textAlign: "right" }]}>Amount</Text>
          </View>

          {order.items.map((item, idx) => (
            <View key={idx} style={s.tableRow}>
              <Text style={[s.td, { flex: 3 }]} numberOfLines={2}>{item.productName}</Text>
              <Text style={[s.td, { flex: 1, textAlign: "center" }]}>{item.qty}</Text>
              <Text style={[s.td, { flex: 1.5, textAlign: "right" }]}>₹{item.price.toLocaleString()}</Text>
              <Text style={[s.td, { flex: 1.5, textAlign: "right", fontWeight: "700" }]}>
                ₹{(item.price * item.qty).toLocaleString()}
              </Text>
            </View>
          ))}

          <View style={s.divider} />

          <View style={s.taxBlock}>
            <View style={s.taxRow}>
              <Text style={s.taxLabel}>Subtotal</Text>
              <Text style={s.taxValue}>₹{subtotal.toLocaleString()}</Text>
            </View>
            <View style={s.taxRow}>
              <Text style={s.taxLabel}>CGST (9%)</Text>
              <Text style={s.taxValue}>₹{cgst.toLocaleString()}</Text>
            </View>
            <View style={s.taxRow}>
              <Text style={s.taxLabel}>SGST (9%)</Text>
              <Text style={s.taxValue}>₹{sgst.toLocaleString()}</Text>
            </View>
            <View style={s.taxRow}>
              <Text style={s.taxLabel}>Delivery Charges</Text>
              <Text style={[s.taxValue, { color: "#22c55e" }]}>FREE</Text>
            </View>
            <View style={[s.taxRow, s.grandTotalRow]}>
              <Text style={s.grandLabel}>GRAND TOTAL</Text>
              <Text style={s.grandValue}>₹{grandTotal.toLocaleString()}</Text>
            </View>
          </View>

          <View style={s.divider} />

          <View style={s.footer}>
            <Text style={s.footerTitle}>Terms & Conditions</Text>
            <Text style={s.footerText}>1. Goods once sold will not be taken back.</Text>
            <Text style={s.footerText}>2. Warranty as per manufacturer's policy.</Text>
            <Text style={s.footerText}>3. Subject to Delhi jurisdiction only.</Text>
            <View style={s.signatureBlock}>
              <View style={s.signLine} />
              <Text style={s.signText}>Authorized Signatory</Text>
              <Text style={s.signBiz}>Direct Delhi Auto Hub</Text>
            </View>
          </View>

          <View style={s.thankYou}>
            <Text style={s.thankYouText}>Thank you for your business!</Text>
            <Text style={s.thankYouSub}>+91 97536 62278 | Delhi, India</Text>
          </View>
        </View>

        <View style={{ height: Platform.OS === "web" ? 60 : 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { justifyContent: "center", alignItems: "center" },
    navBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    navTitle: { color: colors.foreground, fontSize: 18, fontWeight: "800" },
    shareBtn: {
      backgroundColor: colors.red + "22",
      borderRadius: 10,
      padding: 8,
      borderWidth: 1,
      borderColor: colors.red,
    },
    scroll: { padding: 16 },
    invoice: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    invoiceHeader: {
      backgroundColor: colors.red,
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    logoBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    bizName: { color: "#fff", fontSize: 14, fontWeight: "900", letterSpacing: 0.3 },
    bizTagline: { color: "rgba(255,255,255,0.8)", fontSize: 11 },
    taxInvoice: { color: "#fff", fontSize: 12, fontWeight: "800", letterSpacing: 1 },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
    bizDetails: { padding: 14, paddingBottom: 12 },
    bizDetailText: { color: colors.mutedForeground, fontSize: 12, lineHeight: 18 },
    infoGrid: { flexDirection: "row", padding: 14, gap: 16 },
    infoBlock: { flex: 1, gap: 3 },
    infoLabel: { color: colors.mutedForeground, fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
    infoValue: { color: colors.foreground, fontSize: 13, marginBottom: 6 },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: colors.secondary,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    th: { color: colors.mutedForeground, fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
    tableRow: {
      flexDirection: "row",
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    td: { color: colors.foreground, fontSize: 12 },
    taxBlock: { padding: 14, gap: 8 },
    taxRow: { flexDirection: "row", justifyContent: "space-between" },
    taxLabel: { color: colors.mutedForeground, fontSize: 13 },
    taxValue: { color: colors.foreground, fontSize: 13, fontWeight: "600" },
    grandTotalRow: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 10,
      marginTop: 4,
    },
    grandLabel: { color: colors.foreground, fontSize: 16, fontWeight: "800" },
    grandValue: { color: colors.red, fontSize: 20, fontWeight: "900" },
    footer: { padding: 14, gap: 4 },
    footerTitle: { color: colors.foreground, fontSize: 13, fontWeight: "700", marginBottom: 4 },
    footerText: { color: colors.mutedForeground, fontSize: 11, lineHeight: 18 },
    signatureBlock: { marginTop: 20, alignItems: "flex-end", gap: 4 },
    signLine: { width: 120, height: 1, backgroundColor: colors.border },
    signText: { color: colors.mutedForeground, fontSize: 11 },
    signBiz: { color: colors.foreground, fontSize: 12, fontWeight: "700" },
    thankYou: {
      backgroundColor: colors.secondary,
      padding: 14,
      alignItems: "center",
      gap: 3,
    },
    thankYouText: { color: colors.foreground, fontSize: 14, fontWeight: "700" },
    thankYouSub: { color: colors.mutedForeground, fontSize: 12 },
  });

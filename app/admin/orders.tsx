import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AdminOrder, useAdmin } from "@/contexts/AdminContext";
import { useColors } from "@/hooks/useColors";

type StatusFilter = "all" | AdminOrder["status"];

const STATUS_FLOW: AdminOrder["status"][] = [
  "pending", "confirmed", "packing", "dispatched", "delivered",
];

const STATUS_CONFIG: Record<AdminOrder["status"], { label: string; color: string; icon: string }> = {
  pending:   { label: "Pending",   color: "#F59E0B", icon: "clock" },
  confirmed: { label: "Confirmed", color: "#1E90FF", icon: "check" },
  packing:   { label: "Packing",   color: "#8B5CF6", icon: "package" },
  dispatched:{ label: "Dispatched",color: "#EC4899", icon: "truck" },
  delivered: { label: "Delivered", color: "#22c55e", icon: "check-circle" },
  cancelled: { label: "Cancelled", color: "#ef4444", icon: "x-circle" },
};

const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Packing", value: "packing" },
  { label: "Dispatched", value: "dispatched" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default function AdminOrders() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { orders, updateOrderStatus } = useAdmin();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const s = styles(colors);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  const getNextStatus = (current: AdminOrder["status"]): AdminOrder["status"] | null => {
    const idx = STATUS_FLOW.indexOf(current);
    if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[idx + 1];
  };

  const renderItem = ({ item }: { item: AdminOrder }) => {
    const cfg = STATUS_CONFIG[item.status];
    const next = getNextStatus(item.status);
    const nextCfg = next ? STATUS_CONFIG[next] : null;

    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View>
            <Text style={s.orderId}>{item.orderId}</Text>
            <Text style={s.date}>{new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: cfg.color + "22" }]}>
            <Feather name={cfg.icon as any} size={12} color={cfg.color} />
            <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <View style={s.customerRow}>
          <Feather name="user" size={14} color={colors.mutedForeground} />
          <Text style={s.customerName}>{item.customerName}</Text>
          <Text style={s.customerPhone}>{item.customerPhone}</Text>
        </View>

        <View style={s.itemsList}>
          {item.items.map((it, idx) => (
            <Text key={idx} style={s.orderItem}>
              {it.productName} x{it.qty} — ₹{(it.price * it.qty).toLocaleString()}
            </Text>
          ))}
        </View>

        <View style={s.cardBottom}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total:</Text>
            <Text style={s.totalAmt}>₹{item.total.toLocaleString()}</Text>
            <View style={[s.payBadge, { backgroundColor: item.paymentStatus === "paid" ? "#22c55e22" : "#F59E0B22" }]}>
              <Text style={[s.payText, { color: item.paymentStatus === "paid" ? "#22c55e" : "#F59E0B" }]}>
                {item.paymentStatus === "paid" ? "PAID" : "COD"} · {item.paymentMethod.toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={s.actionRow}>
            <Pressable style={s.invoiceBtn} onPress={() => router.push(`/admin/invoice/${item.id}` as any)}>
              <Feather name="file-text" size={14} color={colors.red} />
              <Text style={s.invoiceBtnText}>Invoice</Text>
            </Pressable>
            {next && nextCfg && item.status !== "cancelled" && (
              <Pressable
                style={[s.advanceBtn, { backgroundColor: nextCfg.color }]}
                onPress={() => updateOrderStatus(item.id, next)}
              >
                <Feather name={nextCfg.icon as any} size={14} color="#fff" />
                <Text style={s.advanceBtnText}>Mark {nextCfg.label}</Text>
              </Pressable>
            )}
            {item.status !== "delivered" && item.status !== "cancelled" && (
              <Pressable
                style={s.cancelBtn}
                onPress={() => updateOrderStatus(item.id, "cancelled")}
              >
                <Text style={s.cancelBtnText}>Cancel</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={s.title}>Orders ({orders.length})</Text>
      </View>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterList}
        renderItem={({ item: f }) => {
          const count = f.value === "all" ? orders.length : orders.filter((o) => o.status === f.value).length;
          return (
            <Pressable
              style={[s.filterChip, filter === f.value && { backgroundColor: colors.red, borderColor: colors.red }]}
              onPress={() => setFilter(f.value)}
            >
              <Text style={[s.filterText, { color: filter === f.value ? "#fff" : colors.mutedForeground }]}>
                {f.label} ({count})
              </Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={sorted}
        keyExtractor={(o) => o.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Feather name="shopping-bag" size={48} color={colors.mutedForeground} />
            <Text style={s.emptyText}>No orders in this status</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { flex: 1, color: colors.foreground, fontSize: 18, fontWeight: "800" },
    filterList: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    filterChip: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: colors.card,
    },
    filterText: { fontSize: 12, fontWeight: "600" },
    list: { paddingHorizontal: 16, paddingBottom: Platform.OS === "web" ? 60 : 40 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 10,
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    orderId: { color: colors.foreground, fontSize: 15, fontWeight: "800" },
    date: { color: colors.mutedForeground, fontSize: 12, marginTop: 2 },
    statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    statusText: { fontSize: 12, fontWeight: "700" },
    customerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    customerName: { color: colors.foreground, fontSize: 13, fontWeight: "600" },
    customerPhone: { color: colors.mutedForeground, fontSize: 12, marginLeft: 4 },
    itemsList: { gap: 3 },
    orderItem: { color: colors.mutedForeground, fontSize: 12 },
    cardBottom: { gap: 8 },
    totalRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    totalLabel: { color: colors.mutedForeground, fontSize: 13 },
    totalAmt: { color: colors.foreground, fontSize: 16, fontWeight: "800" },
    payBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
    payText: { fontSize: 10, fontWeight: "700" },
    actionRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    invoiceBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderWidth: 1,
      borderColor: colors.red,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    invoiceBtnText: { color: colors.red, fontSize: 12, fontWeight: "700" },
    advanceBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    advanceBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
    cancelBtn: {
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: "#ef4444",
    },
    cancelBtnText: { color: "#ef4444", fontSize: 12, fontWeight: "700" },
    empty: { alignItems: "center", paddingTop: 80, gap: 12 },
    emptyText: { color: colors.mutedForeground, fontSize: 16 },
  });

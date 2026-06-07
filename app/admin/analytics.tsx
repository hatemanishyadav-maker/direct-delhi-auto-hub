import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SimpleBarChart from "@/components/SimpleBarChart";
import { useAdmin } from "@/contexts/AdminContext";
import { useColors } from "@/hooks/useColors";

const MOCK_DAILY = [
  { label: "Mon", value: 8499 },
  { label: "Tue", value: 15998 },
  { label: "Wed", value: 6197 },
  { label: "Thu", value: 3499 },
  { label: "Fri", value: 22450 },
  { label: "Sat", value: 34800 },
  { label: "Sun", value: 10999 },
];

const MOCK_MONTHLY = [
  { label: "Jan", value: 45000 },
  { label: "Feb", value: 62000 },
  { label: "Mar", value: 38000 },
  { label: "Apr", value: 78000 },
  { label: "May", value: 95000 },
  { label: "Jun", value: 34000 },
];

export default function AdminAnalytics() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { orders, products } = useAdmin();
  const [period, setPeriod] = useState<"week" | "month">("week");
  const s = styles(colors);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const totalRevenue = orders.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const deliveredRevenue = orders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.total, 0);

  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
      }
      productSales[item.productId].qty += item.qty;
      productSales[item.productId].revenue += item.price * item.qty;
    });
  });
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  const categorySales: Record<string, number> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        categorySales[prod.categoryId] = (categorySales[prod.categoryId] || 0) + item.price * item.qty;
      }
    });
  });
  const categoryData = Object.entries(categorySales)
    .map(([id, val]) => ({ label: id.charAt(0).toUpperCase() + id.slice(1, 5), value: val }))
    .sort((a, b) => b.value - a.value);

  const chartData = period === "week" ? MOCK_DAILY : MOCK_MONTHLY;

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={s.title}>Sales Analytics</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={s.summaryVal}>₹{(totalRevenue / 1000).toFixed(1)}k</Text>
            <Text style={s.summaryLabel}>Total Revenue</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryVal}>{totalOrders}</Text>
            <Text style={s.summaryLabel}>Total Orders</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryVal}>₹{(avgOrder / 1000).toFixed(1)}k</Text>
            <Text style={s.summaryLabel}>Avg Order</Text>
          </View>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Sales Trend</Text>
            <View style={s.periodToggle}>
              <Pressable
                style={[s.periodBtn, period === "week" && { backgroundColor: colors.red }]}
                onPress={() => setPeriod("week")}
              >
                <Text style={[s.periodText, { color: period === "week" ? "#fff" : colors.mutedForeground }]}>Week</Text>
              </Pressable>
              <Pressable
                style={[s.periodBtn, period === "month" && { backgroundColor: colors.red }]}
                onPress={() => setPeriod("month")}
              >
                <Text style={[s.periodText, { color: period === "month" ? "#fff" : colors.mutedForeground }]}>Month</Text>
              </Pressable>
            </View>
          </View>
          <SimpleBarChart data={chartData} height={160} barColor={colors.red} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Top Products</Text>
          {topProducts.length === 0 ? (
            <Text style={s.emptyText}>No order data yet</Text>
          ) : (
            topProducts.map(([id, data], idx) => (
              <View key={id} style={s.topProductRow}>
                <View style={[s.rank, { backgroundColor: idx === 0 ? "#FFD70022" : colors.secondary }]}>
                  <Text style={[s.rankText, { color: idx === 0 ? "#FFD700" : colors.mutedForeground }]}>#{idx + 1}</Text>
                </View>
                <Text style={s.topProductName} numberOfLines={1}>{data.name}</Text>
                <View style={s.topProductRight}>
                  <Text style={s.topRevenue}>₹{data.revenue.toLocaleString()}</Text>
                  <Text style={s.topQty}>{data.qty} sold</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {categoryData.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Category Revenue</Text>
            <SimpleBarChart data={categoryData} height={150} barColor="#8B5CF6" />
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Order Status Breakdown</Text>
          {(["pending", "confirmed", "packing", "dispatched", "delivered", "cancelled"] as const).map((status) => {
            const count = orders.filter((o) => o.status === status).length;
            const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
            const statusColors: Record<string, string> = {
              pending: "#F59E0B", confirmed: "#1E90FF", packing: "#8B5CF6",
              dispatched: "#EC4899", delivered: "#22c55e", cancelled: "#ef4444",
            };
            return (
              <View key={status} style={s.statusRow}>
                <Text style={[s.statusLabel, { color: statusColors[status] }]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
                <View style={s.barBg}>
                  <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: statusColors[status] }]} />
                </View>
                <Text style={s.statusCount}>{count}</Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: Platform.OS === "web" ? 60 : 40 }} />
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
      gap: 12,
      paddingHorizontal: 16,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { flex: 1, color: colors.foreground, fontSize: 18, fontWeight: "800" },
    scroll: { padding: 16, gap: 16 },
    summaryRow: { flexDirection: "row", gap: 10 },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      alignItems: "center",
      gap: 4,
    },
    summaryVal: { color: colors.foreground, fontSize: 18, fontWeight: "800" },
    summaryLabel: { color: colors.mutedForeground, fontSize: 11, textAlign: "center" },
    section: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      gap: 12,
    },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    sectionTitle: { color: colors.foreground, fontSize: 15, fontWeight: "700" },
    periodToggle: { flexDirection: "row", backgroundColor: colors.secondary, borderRadius: 8, padding: 2 },
    periodBtn: { borderRadius: 6, paddingHorizontal: 12, paddingVertical: 5 },
    periodText: { fontSize: 12, fontWeight: "700" },
    topProductRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rank: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    rankText: { fontSize: 12, fontWeight: "800" },
    topProductName: { flex: 1, color: colors.foreground, fontSize: 13, fontWeight: "600" },
    topProductRight: { alignItems: "flex-end" },
    topRevenue: { color: colors.foreground, fontSize: 14, fontWeight: "700" },
    topQty: { color: colors.mutedForeground, fontSize: 11 },
    emptyText: { color: colors.mutedForeground, fontSize: 14, textAlign: "center" },
    statusRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    statusLabel: { width: 72, fontSize: 12, fontWeight: "600" },
    barBg: { flex: 1, height: 8, backgroundColor: colors.secondary, borderRadius: 4, overflow: "hidden" },
    barFill: { height: "100%", borderRadius: 4 },
    statusCount: { color: colors.foreground, fontSize: 13, fontWeight: "700", width: 24, textAlign: "right" },
  });

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
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

import StatCard from "@/components/StatCard";
import { useAdmin } from "@/contexts/AdminContext";
import { useColors } from "@/hooks/useColors";

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { products, orders, customers } = useAdmin();
  const s = styles(colors);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const confirmedOrders = orders.filter((o) => o.status === "confirmed" || o.status === "packing" || o.status === "dispatched").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const todayOrders = orders.filter((o) => o.date === new Date().toISOString().split("T")[0]);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold);

  const menuItems = [
    { icon: "package", label: "Products", subtitle: `${products.length} products`, onPress: () => router.push("/admin/products" as any), color: "#1E90FF" },
    { icon: "shopping-bag", label: "Orders", subtitle: `${pendingOrders} pending`, onPress: () => router.push("/admin/orders" as any), color: "#F59E0B" },
    { icon: "message-circle", label: "Messages", subtitle: "Customer chat replies", onPress: () => router.push("/admin/messages" as any), color: colors.red },
    { icon: "layers", label: "Inventory", subtitle: `${lowStockProducts.length} low stock`, onPress: () => router.push("/admin/inventory" as any), color: "#8B5CF6" },
    { icon: "bar-chart-2", label: "Analytics", subtitle: "Sales reports", onPress: () => router.push("/admin/analytics" as any), color: "#22c55e" },
    { icon: "users", label: "Customers", subtitle: `${customers.length} total`, onPress: () => router.push("/admin/customers" as any), color: "#EC4899" },
  ];

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View>
          <Text style={s.title}>Admin Dashboard</Text>
          <Text style={s.sub}>Direct Delhi Auto Hub</Text>
        </View>
        <View style={s.adminBadge}>
          <Feather name="shield" size={14} color={colors.red} />
          <Text style={s.adminBadgeText}>ADMIN</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {lowStockProducts.length > 0 && (
          <Pressable style={s.alert} onPress={() => router.push("/admin/inventory" as any)}>
            <Feather name="alert-triangle" size={16} color="#F59E0B" />
            <Text style={s.alertText}>
              {lowStockProducts.length} product{lowStockProducts.length > 1 ? "s" : ""} low on stock
            </Text>
            <Feather name="chevron-right" size={14} color="#F59E0B" />
          </Pressable>
        )}

        <Text style={s.sectionLabel}>Overview</Text>
        <View style={s.statsGrid}>
          <StatCard
            label="Total Revenue"
            value={`₹${(totalRevenue / 1000).toFixed(1)}k`}
            icon="trending-up"
            color="#22c55e"
            sub="Paid orders"
          />
          <StatCard
            label="Today's Sales"
            value={`₹${todayRevenue.toLocaleString()}`}
            icon="dollar-sign"
            color={colors.red}
            sub={`${todayOrders.length} orders`}
          />
        </View>
        <View style={s.statsGrid}>
          <StatCard
            label="Pending Orders"
            value={pendingOrders}
            icon="clock"
            color="#F59E0B"
            sub="Need action"
          />
          <StatCard
            label="In Progress"
            value={confirmedOrders}
            icon="truck"
            color="#1E90FF"
            sub="Processing"
          />
        </View>
        <View style={s.statsGrid}>
          <StatCard
            label="Delivered"
            value={deliveredOrders}
            icon="check-circle"
            color="#22c55e"
          />
          <StatCard
            label="Customers"
            value={customers.length}
            icon="users"
            color="#EC4899"
          />
        </View>
        <View style={s.statsGrid}>
          <StatCard
            label="Total Products"
            value={products.length}
            icon="package"
            color="#8B5CF6"
          />
          <StatCard
            label="Low Stock"
            value={lowStockProducts.length}
            icon="alert-triangle"
            color="#F59E0B"
            sub="Need restock"
          />
        </View>

        <Text style={s.sectionLabel}>Quick Actions</Text>
        <View style={s.menuGrid}>
          {menuItems.map((item) => (
            <Pressable key={item.label} style={s.menuCard} onPress={item.onPress}>
              <View style={[s.menuIcon, { backgroundColor: item.color + "22" }]}>
                <Feather name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text style={s.menuLabel}>{item.label}</Text>
              <Text style={s.menuSub}>{item.subtitle}</Text>
            </Pressable>
          ))}
          <Pressable
            style={s.menuCard}
            onPress={() => router.push("/admin/add-product" as any)}
          >
            <View style={[s.menuIcon, { backgroundColor: colors.red + "22" }]}>
              <Feather name="plus-circle" size={24} color={colors.red} />
            </View>
            <Text style={s.menuLabel}>Add Product</Text>
            <Text style={s.menuSub}>New listing</Text>
          </Pressable>
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
    title: { color: colors.foreground, fontSize: 17, fontWeight: "800" },
    sub: { color: colors.mutedForeground, fontSize: 12 },
    adminBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginLeft: "auto",
      backgroundColor: colors.red + "22",
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    adminBadgeText: { color: colors.red, fontSize: 11, fontWeight: "700" },
    scroll: { padding: 16, gap: 12 },
    alert: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "#F59E0B22",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#F59E0B55",
      padding: 12,
    },
    alertText: { flex: 1, color: "#F59E0B", fontSize: 13, fontWeight: "600" },
    sectionLabel: {
      color: colors.mutedForeground,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginTop: 4,
    },
    statsGrid: { flexDirection: "row", gap: 12 },
    menuGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    menuCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 6,
      width: "47%",
    },
    menuIcon: {
      width: 46,
      height: 46,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 2,
    },
    menuLabel: { color: colors.foreground, fontSize: 14, fontWeight: "700" },
    menuSub: { color: colors.mutedForeground, fontSize: 12 },
  });

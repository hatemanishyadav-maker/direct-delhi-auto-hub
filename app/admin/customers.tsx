import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AdminCustomer, useAdmin } from "@/contexts/AdminContext";
import { useColors } from "@/hooks/useColors";

export default function AdminCustomers() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { customers, orders } = useAdmin();
  const [search, setSearch] = useState("");
  const s = styles(colors);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const getCustomerOrders = (customerId: string) =>
    orders.filter((o) => o.customerId === customerId);

  const renderItem = ({ item }: { item: AdminCustomer }) => {
    const custOrders = getCustomerOrders(item.id);
    const lastOrder = custOrders.sort((a, b) => b.date.localeCompare(a.date))[0];

    return (
      <View style={s.card}>
        <View style={s.cardTop}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={s.info}>
            <Text style={s.name}>{item.name}</Text>
            <Text style={s.phone}>{item.phone}</Text>
            <Text style={s.address} numberOfLines={1}>{item.address}</Text>
          </View>
          <View style={s.actions}>
            <Pressable
              style={[s.actionBtn, { backgroundColor: "#25D36622" }]}
              onPress={() => Linking.openURL(`https://wa.me/91${item.phone}?text=Hi ${item.name}, this is Direct Delhi Auto Hub.`)}
            >
              <Feather name="message-circle" size={16} color="#25D366" />
            </Pressable>
            <Pressable
              style={[s.actionBtn, { backgroundColor: colors.red + "22" }]}
              onPress={() => Linking.openURL(`tel:${item.phone}`)}
            >
              <Feather name="phone" size={16} color={colors.red} />
            </Pressable>
          </View>
        </View>

        <View style={s.statsRow}>
          <View style={s.stat}>
            <Text style={s.statVal}>{item.totalOrders}</Text>
            <Text style={s.statLabel}>Orders</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.stat}>
            <Text style={s.statVal}>₹{item.totalSpent.toLocaleString()}</Text>
            <Text style={s.statLabel}>Total Spent</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.stat}>
            <Text style={s.statVal}>{new Date(item.joinDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</Text>
            <Text style={s.statLabel}>Joined</Text>
          </View>
        </View>

        {lastOrder && (
          <View style={s.lastOrder}>
            <Feather name="clock" size={12} color={colors.mutedForeground} />
            <Text style={s.lastOrderText}>
              Last: {lastOrder.orderId} · ₹{lastOrder.total.toLocaleString()} · {lastOrder.status}
            </Text>
          </View>
        )}

        <View style={s.ordersList}>
          {custOrders.slice(0, 3).map((o) => (
            <Pressable
              key={o.id}
              style={s.orderPill}
              onPress={() => router.push("/admin/orders" as any)}
            >
              <Text style={s.orderPillText}>{o.orderId}</Text>
            </Pressable>
          ))}
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
        <Text style={s.title}>Customers ({customers.length})</Text>
      </View>

      <View style={s.searchBox}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={s.searchInput}
          placeholder="Search by name or phone..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Feather name="users" size={48} color={colors.mutedForeground} />
            <Text style={s.emptyText}>No customers found</Text>
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
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 10,
      marginHorizontal: 16,
      marginVertical: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    searchInput: { flex: 1, color: colors.foreground, fontSize: 14 },
    list: { paddingHorizontal: 16, paddingBottom: Platform.OS === "web" ? 60 : 40 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 10,
    },
    cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    avatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: colors.red + "22",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { color: colors.red, fontSize: 20, fontWeight: "800" },
    info: { flex: 1, gap: 2 },
    name: { color: colors.foreground, fontSize: 15, fontWeight: "700" },
    phone: { color: colors.mutedForeground, fontSize: 13 },
    address: { color: colors.mutedForeground, fontSize: 12 },
    actions: { gap: 8 },
    actionBtn: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    statsRow: {
      flexDirection: "row",
      backgroundColor: colors.secondary,
      borderRadius: 10,
      padding: 12,
    },
    stat: { flex: 1, alignItems: "center", gap: 3 },
    statVal: { color: colors.foreground, fontSize: 14, fontWeight: "700" },
    statLabel: { color: colors.mutedForeground, fontSize: 11 },
    statDivider: { width: 1, backgroundColor: colors.border },
    lastOrder: { flexDirection: "row", alignItems: "center", gap: 5 },
    lastOrderText: { color: colors.mutedForeground, fontSize: 12 },
    ordersList: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    orderPill: {
      backgroundColor: colors.red + "22",
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    orderPillText: { color: colors.red, fontSize: 11, fontWeight: "700" },
    empty: { alignItems: "center", paddingTop: 80, gap: 12 },
    emptyText: { color: colors.mutedForeground, fontSize: 16 },
  });

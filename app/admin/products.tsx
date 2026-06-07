import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AdminProduct, useAdmin } from "@/contexts/AdminContext";
import { useColors } from "@/hooks/useColors";

export default function AdminProducts() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { products, deleteProduct } = useAdmin();
  const [search, setSearch] = useState("");
  const s = styles(colors);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const confirmDelete = (p: AdminProduct) => {
    Alert.alert("Delete Product", `Delete "${p.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteProduct(p.id) },
    ]);
  };

  const renderItem = ({ item }: { item: AdminProduct }) => {
    const isLow = item.stock <= item.lowStockThreshold;
    const profit = item.price - item.purchasePrice;
    const margin = Math.round((profit / item.price) * 100);
    return (
      <View style={s.card}>
        <View style={s.cardTop}>
          <View style={s.cardInfo}>
            <Text style={s.sku}>{item.sku}</Text>
            <Text style={s.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={s.brand}>{item.brand}</Text>
          </View>
          <View style={s.cardActions}>
            <Pressable
              style={[s.actionBtn, { backgroundColor: "#1E90FF22" }]}
              onPress={() => router.push({ pathname: "/admin/add-product" as any, params: { id: item.id } })}
            >
              <Feather name="edit-2" size={14} color="#1E90FF" />
            </Pressable>
            <Pressable
              style={[s.actionBtn, { backgroundColor: colors.red + "22" }]}
              onPress={() => confirmDelete(item)}
            >
              <Feather name="trash-2" size={14} color={colors.red} />
            </Pressable>
          </View>
        </View>
        <View style={s.cardBottom}>
          <View style={s.priceGroup}>
            <Text style={s.priceLabel}>Sell</Text>
            <Text style={s.priceVal}>₹{item.price.toLocaleString()}</Text>
          </View>
          <View style={s.priceGroup}>
            <Text style={s.priceLabel}>Cost</Text>
            <Text style={s.priceValMuted}>₹{item.purchasePrice.toLocaleString()}</Text>
          </View>
          <View style={s.priceGroup}>
            <Text style={s.priceLabel}>Margin</Text>
            <Text style={[s.priceVal, { color: "#22c55e" }]}>{margin}%</Text>
          </View>
          <View style={[s.stockBadge, { backgroundColor: isLow ? "#F59E0B22" : "#22c55e22" }]}>
            <Text style={[s.stockText, { color: isLow ? "#F59E0B" : "#22c55e" }]}>
              {item.stock} units
            </Text>
            {isLow && <Feather name="alert-circle" size={11} color="#F59E0B" />}
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
        <Text style={s.title}>Products ({products.length})</Text>
        <Pressable
          style={s.addBtn}
          onPress={() => router.push("/admin/add-product" as any)}
        >
          <Feather name="plus" size={18} color="#fff" />
        </Pressable>
      </View>

      <View style={s.searchBox}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={s.searchInput}
          placeholder="Search by name or SKU..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Feather name="package" size={48} color={colors.mutedForeground} />
            <Text style={s.emptyText}>No products found</Text>
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
    addBtn: {
      backgroundColor: colors.red,
      borderRadius: 10,
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
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
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 10,
    },
    cardTop: { flexDirection: "row", gap: 10 },
    cardInfo: { flex: 1, gap: 3 },
    sku: { color: colors.red, fontSize: 11, fontWeight: "700" },
    productName: { color: colors.foreground, fontSize: 14, fontWeight: "600", lineHeight: 19 },
    brand: { color: colors.mutedForeground, fontSize: 12 },
    cardActions: { gap: 8 },
    actionBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    cardBottom: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
    priceGroup: { gap: 2 },
    priceLabel: { color: colors.mutedForeground, fontSize: 10 },
    priceVal: { color: colors.foreground, fontSize: 14, fontWeight: "700" },
    priceValMuted: { color: colors.mutedForeground, fontSize: 14, fontWeight: "600" },
    stockBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginLeft: "auto",
    },
    stockText: { fontSize: 12, fontWeight: "700" },
    empty: { alignItems: "center", paddingTop: 80, gap: 12 },
    emptyText: { color: colors.mutedForeground, fontSize: 16 },
  });

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "@/contexts/CartContext";
import { useColors } from "@/hooks/useColors";
import { CartItem } from "@/types";

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const s = styles(colors);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const savings = items.reduce(
    (sum, i) => sum + (i.product.mrp - i.product.price) * i.quantity,
    0
  );

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={s.cartItem}>
      <Image source={item.product.image} style={s.itemImage} resizeMode="cover" />
      <View style={s.itemInfo}>
        <Text style={s.itemName} numberOfLines={2}>{item.product.name}</Text>
        <Text style={s.itemPrice}>₹{item.product.price.toLocaleString()}</Text>
        <Text style={s.itemMrp}>MRP ₹{item.product.mrp.toLocaleString()}</Text>
        <View style={s.qtyRow}>
          <Pressable
            style={s.qtyBtn}
            onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
          >
            <Feather name="minus" size={14} color={colors.foreground} />
          </Pressable>
          <Text style={s.qtyNum}>{item.quantity}</Text>
          <Pressable
            style={s.qtyBtn}
            onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
          >
            <Feather name="plus" size={14} color={colors.foreground} />
          </Pressable>
          <Pressable
            style={s.removeBtn}
            onPress={() => removeFromCart(item.product.id)}
          >
            <Feather name="trash-2" size={14} color={colors.red} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  if (items.length === 0) {
    return (
      <View style={[s.container, { paddingTop: topPad }]}>
        <View style={s.header}>
          <Text style={s.title}>Cart</Text>
        </View>
        <View style={s.empty}>
          <Feather name="shopping-cart" size={64} color={colors.mutedForeground} />
          <Text style={s.emptyTitle}>Your cart is empty</Text>
          <Text style={s.emptySubtitle}>Add products from the shop to get started</Text>
          <Pressable style={s.shopBtn} onPress={() => router.push("/(tabs)/shop" as any)}>
            <Text style={s.shopBtnText}>Browse Products</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Text style={s.title}>Cart ({totalItems})</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={s.separator} />}
        ListFooterComponent={
          <View style={s.summary}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Subtotal</Text>
              <Text style={s.summaryValue}>₹{totalPrice.toLocaleString()}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Delivery</Text>
              <Text style={[s.summaryValue, { color: "#22c55e" }]}>FREE</Text>
            </View>
            {savings > 0 && (
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>You Save</Text>
                <Text style={[s.summaryValue, { color: "#22c55e" }]}>₹{savings.toLocaleString()}</Text>
              </View>
            )}
            <View style={[s.summaryRow, s.totalRow]}>
              <Text style={s.totalLabel}>Total</Text>
              <Text style={s.totalValue}>₹{totalPrice.toLocaleString()}</Text>
            </View>
            <Pressable
              style={s.checkoutBtn}
              onPress={() => router.push("/checkout" as any)}
            >
              <Feather name="lock" size={16} color="#fff" />
              <Text style={s.checkoutText}>Proceed to Checkout</Text>
            </Pressable>
          </View>
        }
      />
      <View style={{ height: bottomPad }} />
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
    list: { padding: 16 },
    cartItem: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemImage: { width: 100, height: 110 },
    itemInfo: { flex: 1, padding: 12, gap: 4 },
    itemName: { color: colors.foreground, fontSize: 13, fontWeight: "600", lineHeight: 18 },
    itemPrice: { color: colors.foreground, fontSize: 16, fontWeight: "700" },
    itemMrp: { color: colors.mutedForeground, fontSize: 12, textDecorationLine: "line-through" },
    qtyRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
    qtyBtn: {
      backgroundColor: colors.secondary,
      borderRadius: 6,
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    qtyNum: { color: colors.foreground, fontSize: 15, fontWeight: "700", width: 24, textAlign: "center" },
    removeBtn: { marginLeft: "auto" },
    separator: { height: 10 },
    summary: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginTop: 16,
      gap: 10,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    summaryLabel: { color: colors.mutedForeground, fontSize: 14 },
    summaryValue: { color: colors.foreground, fontSize: 14, fontWeight: "600" },
    totalRow: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 10,
      marginTop: 0,
    },
    totalLabel: { color: colors.foreground, fontSize: 16, fontWeight: "700" },
    totalValue: { color: colors.foreground, fontSize: 18, fontWeight: "800" },
    checkoutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.red,
      borderRadius: 12,
      paddingVertical: 14,
      marginTop: 4,
    },
    checkoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    emptyTitle: { color: colors.foreground, fontSize: 20, fontWeight: "700" },
    emptySubtitle: { color: colors.mutedForeground, fontSize: 14 },
    shopBtn: {
      backgroundColor: colors.red,
      borderRadius: 10,
      paddingHorizontal: 24,
      paddingVertical: 12,
      marginTop: 8,
    },
    shopBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  });

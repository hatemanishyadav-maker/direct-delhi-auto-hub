import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useColors } from "@/hooks/useColors";
import { useProductById } from "@/hooks/useProducts";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const WHATSAPP = "919753662278";

export default function ProductDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { product, loading } = useProductById(id ?? "");
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const s = styles(colors);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={colors.red} size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.foreground }}>Product not found</Text>
      </View>
    );
  }

  const wished = isInWishlist(product.id);
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const images = product.images?.length
    ? product.images
    : product.imageUrl
    ? [{ uri: product.imageUrl }]
    : [product.image];

  const handleAddToCart = () => {
    if (!product.inStock) return;
    for (let i = 0; i < qty; i++) addToCart(product);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product.inStock) return;
    for (let i = 0; i < qty; i++) addToCart(product);
    router.push("/checkout" as any);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hi! I'm interested in: ${product.name} (₹${product.price} × ${qty} = ₹${product.price * qty}). Please provide more info.`
    );
    Linking.openURL(`https://wa.me/${WHATSAPP}?text=${msg}`);
  };

  return (
    <View style={s.container}>
      <View style={[s.navBar, { paddingTop: Platform.OS === "web" ? 67 : insets.top }]}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Pressable onPress={() => toggleWishlist(product)}>
          <Feather name="heart" size={22} color={wished ? colors.red : colors.foreground} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <FlatList
          horizontal
          pagingEnabled
          data={images}
          keyExtractor={(_, i) => i.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Image source={item} style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.75 }} resizeMode="cover" />
          )}
        />

        <View style={s.content}>
          {(product.isNew || product.isBestseller) && (
            <View style={s.badgeRow}>
              {product.isNew && (
                <View style={[s.badge, { backgroundColor: "#22c55e" }]}>
                  <Text style={s.badgeText}>NEW ARRIVAL</Text>
                </View>
              )}
              {product.isBestseller && (
                <View style={[s.badge, { backgroundColor: colors.red }]}>
                  <Text style={s.badgeText}>BESTSELLER</Text>
                </View>
              )}
            </View>
          )}

          <Text style={s.name}>{product.name}</Text>

          <View style={s.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Feather
                key={star}
                name="star"
                size={14}
                color={star <= Math.round(product.rating) ? "#FFD700" : colors.border}
              />
            ))}
            <Text style={s.ratingText}>{product.rating} ({product.reviewCount} reviews)</Text>
          </View>

          <View style={s.priceBlock}>
            <Text style={s.price}>₹{product.price.toLocaleString()}</Text>
            <Text style={s.mrp}>₹{product.mrp.toLocaleString()}</Text>
            <View style={s.discountBadge}>
              <Text style={s.discountText}>{discount}% OFF</Text>
            </View>
          </View>

          {/* Stock status */}
          <View style={[s.stockRow, { backgroundColor: product.inStock ? "#22c55e22" : "#ef444422" }]}>
            <Feather
              name={product.inStock ? "check-circle" : "x-circle"}
              size={14}
              color={product.inStock ? "#22c55e" : "#ef4444"}
            />
            <Text style={[s.stockText, { color: product.inStock ? "#22c55e" : "#ef4444" }]}>
              {product.inStock ? "In Stock — Free Delivery" : "Out of Stock — Not Available"}
            </Text>
          </View>

          {/* Quantity selector */}
          {product.inStock && (
            <View style={s.qtyContainer}>
              <Text style={s.qtyLabel}>Quantity</Text>
              <View style={s.qtyRow}>
                <Pressable
                  style={[s.qtyBtn, qty <= 1 && s.qtyBtnDisabled]}
                  onPress={() => setQty(q => Math.max(1, q - 1))}
                >
                  <Feather name="minus" size={16} color={qty <= 1 ? colors.mutedForeground : colors.foreground} />
                </Pressable>
                <Text style={s.qtyValue}>{qty}</Text>
                <Pressable style={s.qtyBtn} onPress={() => setQty(q => q + 1)}>
                  <Feather name="plus" size={16} color={colors.foreground} />
                </Pressable>
                <Text style={s.qtyTotal}>
                  Total: <Text style={{ color: colors.foreground, fontWeight: "800" }}>₹{(product.price * qty).toLocaleString()}</Text>
                </Text>
              </View>
            </View>
          )}

          <View style={s.divider} />
          <Text style={s.sectionTitle}>Description</Text>
          <Text style={s.description}>{product.description}</Text>

          <View style={s.divider} />
          <Text style={s.sectionTitle}>Specifications</Text>
          {(product.specs ?? []).map((spec) => (
            <View key={spec.label} style={s.specRow}>
              <Text style={s.specLabel}>{spec.label}</Text>
              <Text style={s.specValue}>{spec.value}</Text>
            </View>
          ))}

          <View style={s.divider} />
          <Pressable style={s.whatsappBtn} onPress={handleWhatsApp}>
            <Feather name="message-circle" size={18} color="#25D366" />
            <Text style={s.whatsappText}>Order on WhatsApp — Direct Delhi Auto Hub</Text>
          </Pressable>
        </View>
        <View style={{ height: 120 + bottomPad }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[s.bottomBar, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 8 }]}>
        {product.inStock ? (
          <>
            <Pressable style={s.cartBtn} onPress={handleAddToCart}>
              <Feather name="shopping-cart" size={18} color={colors.red} />
              <Text style={s.cartBtnText}>{added ? `Added ${qty}×!` : "Add to Cart"}</Text>
            </Pressable>
            <Pressable style={s.buyBtn} onPress={handleBuyNow}>
              <Text style={s.buyBtnText}>Buy Now</Text>
            </Pressable>
          </>
        ) : (
          <View style={s.outOfStockBar}>
            <Feather name="x-circle" size={18} color="#ef4444" />
            <Text style={s.outOfStockText}>Out of Stock — Check back soon</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    navBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    backBtn: {
      backgroundColor: "rgba(0,0,0,0.6)",
      borderRadius: 20,
      padding: 8,
    },
    content: { padding: 16, gap: 10 },
    badgeRow: { flexDirection: "row", gap: 8 },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
    badgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
    name: { color: colors.foreground, fontSize: 20, fontWeight: "700", lineHeight: 28 },
    ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    ratingText: { color: colors.mutedForeground, fontSize: 13, marginLeft: 4 },
    priceBlock: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
    price: { color: colors.foreground, fontSize: 26, fontWeight: "800" },
    mrp: { color: colors.mutedForeground, fontSize: 16, textDecorationLine: "line-through" },
    discountBadge: { backgroundColor: "#22c55e22", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    discountText: { color: "#22c55e", fontSize: 13, fontWeight: "700" },
    stockRow: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, padding: 8 },
    stockText: { fontSize: 13, fontWeight: "600" },
    /* Quantity selector */
    qtyContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    qtyLabel: { color: colors.mutedForeground, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
    qtyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    qtyBtn: {
      width: 36,
      height: 36,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    qtyBtnDisabled: { opacity: 0.4 },
    qtyValue: { color: colors.foreground, fontSize: 20, fontWeight: "800", minWidth: 32, textAlign: "center" },
    qtyTotal: { color: colors.mutedForeground, fontSize: 13, marginLeft: 4 },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
    sectionTitle: { color: colors.foreground, fontSize: 16, fontWeight: "700" },
    description: { color: colors.mutedForeground, fontSize: 14, lineHeight: 22 },
    specRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    specLabel: { color: colors.mutedForeground, fontSize: 14 },
    specValue: { color: colors.foreground, fontSize: 14, fontWeight: "600" },
    whatsappBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: "#25D36622",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#25D366",
      paddingVertical: 12,
    },
    whatsappText: { color: "#25D366", fontSize: 14, fontWeight: "700" },
    bottomBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    cartBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderWidth: 2,
      borderColor: colors.red,
      borderRadius: 12,
      paddingVertical: 13,
    },
    cartBtnText: { color: colors.red, fontSize: 15, fontWeight: "700" },
    buyBtn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.red,
      borderRadius: 12,
      paddingVertical: 13,
    },
    buyBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
    outOfStockBar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: "#ef444422",
      borderRadius: 12,
      paddingVertical: 13,
      borderWidth: 1,
      borderColor: "#ef444444",
    },
    outOfStockText: { color: "#ef4444", fontSize: 14, fontWeight: "700" },
  });

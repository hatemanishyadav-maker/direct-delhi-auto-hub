import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useColors } from "@/hooks/useColors";
import { Product } from "@/types";

interface Props {
  product: Product;
  width?: number;
  horizontal?: boolean;
}

const placeholderImg = require("../assets/images/banner1.png");

function getImageSource(product: Product) {
  if (product.imageUrl) return { uri: product.imageUrl };
  if (product.image) return product.image;
  return placeholderImg;
}

export default function ProductCard({ product, width, horizontal }: Props) {
  const colors = useColors();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wished = isInWishlist(product.id);
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const s = styles(colors);

  if (horizontal) {
    return (
      <Pressable
        style={[s.hCard, width ? { width } : {}]}
        onPress={() => router.push(`/product/${product.id}` as any)}
      >
        <View style={s.hImageBox}>
          <Image source={getImageSource(product)} style={s.hImage} resizeMode="cover" />
          {product.isNew && (
            <View style={[s.badge, { backgroundColor: "#22c55e" }]}>
              <Text style={s.badgeText}>NEW</Text>
            </View>
          )}
          {product.isBestseller && !product.isNew && (
            <View style={[s.badge, { backgroundColor: colors.red }]}>
              <Text style={s.badgeText}>BEST</Text>
            </View>
          )}
        </View>
        <View style={s.hInfo}>
          <Text style={s.hName} numberOfLines={2}>{product.name}</Text>
          <View style={s.ratingRow}>
            <Feather name="star" size={12} color="#FFD700" />
            <Text style={s.ratingText}>{product.rating} ({product.reviewCount})</Text>
          </View>
          <View style={s.priceRow}>
            <Text style={s.price}>₹{product.price.toLocaleString()}</Text>
            <Text style={s.mrp}>₹{product.mrp.toLocaleString()}</Text>
            <Text style={s.discount}>{discount}% off</Text>
          </View>
          <Pressable
            style={s.addBtn}
            onPress={() => addToCart(product)}
          >
            <Feather name="shopping-cart" size={14} color="#fff" />
            <Text style={s.addBtnText}>Add</Text>
          </Pressable>
        </View>
        <Pressable style={s.heartBtn} onPress={() => toggleWishlist(product)}>
          <Feather name="heart" size={18} color={wished ? colors.red : colors.mutedForeground} />
        </Pressable>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[s.card, width ? { width } : {}]}
      onPress={() => router.push(`/product/${product.id}` as any)}
    >
      <View style={s.imageBox}>
        <Image source={getImageSource(product)} style={s.image} resizeMode="cover" />
        {product.isNew && (
          <View style={[s.badge, { backgroundColor: "#22c55e" }]}>
            <Text style={s.badgeText}>NEW</Text>
          </View>
        )}
        {product.isBestseller && !product.isNew && (
          <View style={[s.badge, { backgroundColor: colors.red }]}>
            <Text style={s.badgeText}>BEST</Text>
          </View>
        )}
        <Pressable style={s.heartAbsolute} onPress={() => toggleWishlist(product)}>
          <Feather name="heart" size={16} color={wished ? colors.red : colors.mutedForeground} />
        </Pressable>
      </View>
      <View style={s.info}>
        <Text style={s.name} numberOfLines={2}>{product.name}</Text>
        <View style={s.ratingRow}>
          <Feather name="star" size={11} color="#FFD700" />
          <Text style={s.ratingText}>{product.rating} ({product.reviewCount})</Text>
        </View>
        <View style={s.priceRow}>
          <Text style={s.price}>₹{product.price.toLocaleString()}</Text>
          <Text style={s.mrp}>₹{product.mrp.toLocaleString()}</Text>
        </View>
        <Text style={s.discount}>{discount}% off</Text>
        <Pressable style={s.addBtn} onPress={() => addToCart(product)}>
          <Feather name="shopping-cart" size={13} color="#fff" />
          <Text style={s.addBtnText}>Add to Cart</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    imageBox: { position: "relative" },
    image: { width: "100%", aspectRatio: 1 },
    badge: {
      position: "absolute",
      top: 8,
      left: 8,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
    heartAbsolute: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: "rgba(0,0,0,0.6)",
      borderRadius: 20,
      padding: 6,
    },
    info: { padding: 10, gap: 4 },
    name: { color: colors.foreground, fontSize: 13, fontWeight: "600", lineHeight: 18 },
    ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
    ratingText: { color: colors.mutedForeground, fontSize: 11 },
    priceRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
    price: { color: colors.foreground, fontSize: 15, fontWeight: "700" },
    mrp: {
      color: colors.mutedForeground,
      fontSize: 12,
      textDecorationLine: "line-through",
    },
    discount: { color: "#22c55e", fontSize: 11, fontWeight: "600" },
    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      backgroundColor: colors.red,
      borderRadius: 8,
      paddingVertical: 7,
      marginTop: 4,
    },
    addBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
    // Horizontal layout
    hCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
    },
    hImageBox: { width: 110, position: "relative" },
    hImage: { width: 110, height: "100%" },
    hInfo: { flex: 1, padding: 12, gap: 5 },
    hName: { color: colors.foreground, fontSize: 14, fontWeight: "600", lineHeight: 19 },
    heartBtn: {
      position: "absolute",
      top: 8,
      right: 8,
    },
  });

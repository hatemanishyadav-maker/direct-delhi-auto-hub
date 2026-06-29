import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  Dimensions,
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BannerCarousel from "@/components/BannerCarousel";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";
import categories from "@/data/categories";
import { useColors } from "@/hooks/useColors";
import { useFeaturedProducts, useNewProducts, useBestsellerProducts } from "@/hooks/useProducts";
import { Product } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(150, (SCREEN_WIDTH - 16 * 2 - 12) / 2.4);

const bannerImg = require("../../assets/images/banner1.jpg");
const banners = [
  { id: "b1", image: bannerImg, title: "Car Accessories & Auto Parts", subtitle: "Upgrade your ride with top-quality parts" },
  { id: "b2", image: bannerImg, title: "LED Lights Sale — Up to 40% Off", subtitle: "Direct Delhi Auto Hub exclusive offers" },
  { id: "b3", image: bannerImg, title: "Android Stereo Systems", subtitle: "Best prices in Delhi — Call 97536 62278" },
];

type Section =
  | { type: "banner" }
  | { type: "orderBtn" }
  | { type: "catHeader" }
  | { type: "catList" }
  | { type: "sectionHeader"; title: string; filter: string }
  | { type: "productRow"; products: Product[] }
  | { type: "contact" }
  | { type: "spacer" };

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => styles(colors), [colors]);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const featured = useFeaturedProducts();
  const newArrivals = useNewProducts();
  const bestsellers = useBestsellerProducts();

  const toRows = useCallback((products: Product[]): Product[][] => {
    const rows: Product[][] = [];
    for (let i = 0; i < products.length; i += 2) {
      rows.push(products.slice(i, i + 2));
    }
    return rows;
  }, []);

  const sections = useMemo<Section[]>(() => [
    { type: "banner" },
    { type: "orderBtn" },
    { type: "catHeader" },
    { type: "catList" },
    { type: "sectionHeader", title: "Featured Products", filter: "featured" },
    ...toRows(featured).map((products): Section => ({ type: "productRow", products })),
    { type: "sectionHeader", title: "New Arrivals", filter: "new" },
    ...toRows(newArrivals).map((products): Section => ({ type: "productRow", products })),
    { type: "sectionHeader", title: "Best Sellers", filter: "bestseller" },
    ...toRows(bestsellers).map((products): Section => ({ type: "productRow", products })),
    { type: "contact" },
    { type: "spacer" },
  ], [featured, newArrivals, bestsellers, toRows]);

  const renderItem = useCallback(({ item }: { item: Section }) => {
    switch (item.type) {
      case "banner":
        return <BannerCarousel banners={banners} />;

      case "orderBtn":
        return (
          <Pressable style={s.orderBtn} onPress={() => router.push("/(tabs)/chat" as any)}>
            <View style={s.orderBtnInner}>
              <Feather name="message-circle" size={22} color="#fff" />
              <View>
                <Text style={s.orderBtnTitle}>Place Your Order</Text>
                <Text style={s.orderBtnSub}>Chat with us — quick reply guaranteed</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#fff" style={{ marginLeft: "auto" }} />
            </View>
          </Pressable>
        );

      case "catHeader":
        return <SectionHeader title="Categories" onSeeAll={() => router.push("/all-categories" as any)} />;

      case "catList":
        return (
          <FlatList
            horizontal
            data={categories}
            keyExtractor={(c) => c.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.catList}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            removeClippedSubviews
            renderItem={({ item: cat }) => (
              <Pressable style={s.catItem} onPress={() => router.push(`/category/${cat.id}` as any)}>
                <View style={[s.catIcon, { backgroundColor: cat.color + "22" }]}>
                  <Feather name={cat.icon as any} size={22} color={cat.color} />
                </View>
                <Text style={s.catName} numberOfLines={2}>{cat.name}</Text>
              </Pressable>
            )}
          />
        );

      case "sectionHeader":
        return (
          <SectionHeader
            title={item.title}
            onSeeAll={() => router.push({ pathname: "/(tabs)/shop", params: { filter: item.filter } } as any)}
          />
        );

      case "productRow":
        return (
          <View style={s.productRow}>
            {item.products.map((p) => (
              <ProductCard key={p.id} product={p} width={CARD_WIDTH} />
            ))}
          </View>
        );

      case "contact":
        return (
          <View style={s.contactCard}>
            <Text style={s.contactHeading}>Need Help?</Text>
            <Text style={s.contactSub}>Reach us directly — we're always ready</Text>
            <View style={s.contactButtons}>
              <Pressable style={[s.contactBtn, s.callBtn]} onPress={() => Linking.openURL("tel:+919753662278")}>
                <Feather name="phone" size={16} color="#fff" />
                <Text style={s.contactBtnText}>Call Us</Text>
              </Pressable>
              <Pressable
                style={[s.contactBtn, s.waBtn]}
                onPress={() => Linking.openURL("https://wa.me/919753662278?text=Hi! I need help with car accessories.")}
              >
                <Feather name="message-circle" size={16} color="#fff" />
                <Text style={s.contactBtnText}>WhatsApp</Text>
              </Pressable>
            </View>
          </View>
        );

      case "spacer":
        return <View style={{ height: Platform.OS === "web" ? 100 : 90 }} />;

      default:
        return null;
    }
  }, [s]);

  const keyExtractor = useCallback((_: Section, i: number) => String(i), []);

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <View>
          <Text style={s.storeName}>Direct Delhi Auto Hub</Text>
          <Text style={s.tagline}>Car Accessories & Auto Parts</Text>
        </View>
        <Pressable style={s.searchIcon} onPress={() => router.push("/search" as any)}>
          <Feather name="search" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      <FlatList
        data={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={6}
        windowSize={7}
        initialNumToRender={6}
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
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    storeName: { color: colors.foreground, fontSize: 17, fontWeight: "800", letterSpacing: 0.3 },
    tagline: { color: colors.red, fontSize: 12, fontWeight: "500", marginTop: 1 },
    searchIcon: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    orderBtn: {
      marginHorizontal: 16,
      marginTop: 14,
      marginBottom: 6,
      borderRadius: 12,
      backgroundColor: colors.red,
      overflow: "hidden",
    },
    orderBtnInner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 18,
      paddingVertical: 16,
    },
    orderBtnTitle: { color: "#fff", fontSize: 16, fontWeight: "800", letterSpacing: 0.2 },
    orderBtnSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 1 },
    catList: { paddingHorizontal: 16, gap: 12, paddingVertical: 4 },
    catItem: { alignItems: "center", gap: 6, width: 68 },
    catIcon: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center" },
    catName: { color: colors.foreground, fontSize: 11, textAlign: "center", fontWeight: "500" },
    productRow: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
    contactCard: {
      margin: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
    },
    contactHeading: { color: colors.foreground, fontSize: 15, fontWeight: "800", marginBottom: 2 },
    contactSub: { color: colors.mutedForeground, fontSize: 12, marginBottom: 14 },
    contactButtons: { flexDirection: "row", gap: 10 },
    contactBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      paddingVertical: 11,
      borderRadius: 8,
    },
    callBtn: { backgroundColor: colors.red },
    waBtn: { backgroundColor: "#25D366" },
    contactBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  });

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BannerCarousel from "@/components/BannerCarousel";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";
import categories from "@/data/categories";
import { useColors } from "@/hooks/useColors";
import { useFeaturedProducts, useNewProducts, useBestsellerProducts } from "@/hooks/useProducts";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(150, (SCREEN_WIDTH - 16 * 2 - 12) / 2.4);

const bannerImg = require("../../assets/images/banner1.jpg");
const banners = [
  {
    id: "b1",
    image: bannerImg,
    title: "Car Accessories & Auto Parts",
    subtitle: "Upgrade your ride with top-quality parts",
  },
  {
    id: "b2",
    image: bannerImg,
    title: "LED Lights Sale — Up to 40% Off",
    subtitle: "Direct Delhi Auto Hub exclusive offers",
  },
  {
    id: "b3",
    image: bannerImg,
    title: "Android Stereo Systems",
    subtitle: "Best prices in Delhi — Call 97536 62278",
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const s = styles(colors);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const featured = useFeaturedProducts();
  const newArrivals = useNewProducts();
  const bestsellers = useBestsellerProducts();

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

      <ScrollView showsVerticalScrollIndicator={false}>
        <BannerCarousel banners={banners} />

        <View style={s.categoriesSection}>
          <SectionHeader title="Categories" onSeeAll={() => router.push("/all-categories" as any)} />
          <FlatList
            horizontal
            data={categories}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.catList}
            renderItem={({ item }) => (
              <Pressable
                style={s.catItem}
                onPress={() => router.push(`/category/${item.id}` as any)}
              >
                <View style={[s.catIcon, { backgroundColor: item.color + "22" }]}>
                  <Feather name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={s.catName} numberOfLines={2}>{item.name}</Text>
              </Pressable>
            )}
          />
        </View>

        <SectionHeader
          title="Featured Products"
          onSeeAll={() => router.push({ pathname: "/(tabs)/shop", params: { filter: "featured" } } as any)}
        />
        <FlatList
          horizontal
          data={featured}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.hList}
          renderItem={({ item }) => (
            <ProductCard product={item} width={CARD_WIDTH} />
          )}
        />

        <SectionHeader
          title="New Arrivals"
          onSeeAll={() => router.push({ pathname: "/(tabs)/shop", params: { filter: "new" } } as any)}
        />
        <FlatList
          horizontal
          data={newArrivals}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.hList}
          renderItem={({ item }) => (
            <ProductCard product={item} width={CARD_WIDTH} />
          )}
        />

        <SectionHeader
          title="Best Sellers"
          onSeeAll={() => router.push({ pathname: "/(tabs)/shop", params: { filter: "bestseller" } } as any)}
        />
        <FlatList
          horizontal
          data={bestsellers}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.hList}
          renderItem={({ item }) => (
            <ProductCard product={item} width={CARD_WIDTH} />
          )}
        />

        <View style={s.contactCard}>
          <Text style={s.contactHeading}>Need Help?</Text>
          <Text style={s.contactSub}>Reach us directly — we're always ready</Text>
          <View style={s.contactButtons}>
            <Pressable
              style={[s.contactBtn, s.callBtn]}
              onPress={() => Linking.openURL("tel:+919753662278")}
            >
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

        <View style={{ height: Platform.OS === "web" ? 100 : 90 }} />
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
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    storeName: {
      color: colors.foreground,
      fontSize: 17,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    tagline: { color: colors.red, fontSize: 12, fontWeight: "500", marginTop: 1 },
    searchIcon: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoriesSection: { marginBottom: 4 },
    catList: { paddingHorizontal: 16, gap: 12 },
    catItem: { alignItems: "center", gap: 6, width: 68 },
    catIcon: {
      width: 54,
      height: 54,
      borderRadius: 27,
      alignItems: "center",
      justifyContent: "center",
    },
    catName: {
      color: colors.foreground,
      fontSize: 11,
      textAlign: "center",
      fontWeight: "500",
    },
    hList: { paddingHorizontal: 16, gap: 12, paddingBottom: 8 },
    contactCard: {
      margin: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
    },
    contactHeading: {
      color: colors.foreground,
      fontSize: 15,
      fontWeight: "800",
      marginBottom: 2,
    },
    contactSub: {
      color: colors.mutedForeground,
      fontSize: 12,
      marginBottom: 14,
    },
    contactButtons: {
      flexDirection: "row",
      gap: 10,
    },
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
    contactBtnText: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "700",
    },
  });

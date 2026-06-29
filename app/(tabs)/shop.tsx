import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ProductCard from "@/components/ProductCard";
import categories from "@/data/categories";
import { useColors } from "@/hooks/useColors";
import { useAllProducts } from "@/hooks/useProducts";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 12) / 2;

const FILTER_LABELS: Record<string, string> = {
  featured: "Featured",
  new: "New Arrivals",
  bestseller: "Best Sellers",
};

export default function ShopScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string; filter?: string }>();
  const [activeCategory, setActiveCategory] = useState(params.category ?? "all");
  const [activeFilter, setActiveFilter] = useState(params.filter ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const s = useMemo(() => styles(colors), [colors]);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (params.category) setActiveCategory(params.category);
    if (params.filter !== undefined) setActiveFilter(params.filter ?? "");
  }, [params.category, params.filter]);

  const { products, loading } = useAllProducts(searchQuery, activeFilter);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((p) => p.categoryId === activeCategory);
  }, [products, activeCategory]);

  const renderProduct = useCallback(({ item }: { item: (typeof products)[0] }) => (
    <ProductCard product={item} width={CARD_WIDTH} />
  ), []);

  const keyExtractProduct = useCallback((item: (typeof products)[0]) => item.id, []);

  const allCategories = [
    { id: "all", name: "All", icon: "grid", color: colors.red },
    ...categories,
  ];

  const pageTitle = activeFilter ? FILTER_LABELS[activeFilter] ?? "Shop" : "Shop";

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        {activeFilter ? (
          <Pressable style={s.backBtn} onPress={() => { setActiveFilter(""); router.back(); }}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
        ) : (
          <View style={{ width: 38 }} />
        )}
        <Text style={s.title}>{pageTitle}</Text>
        <Pressable onPress={() => router.push("/search" as any)}>
          <Feather name="search" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      <View style={s.searchBox}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={s.searchInput}
          placeholder="Search products..."
          placeholderTextColor={colors.mutedForeground}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      {!activeFilter && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabs}
        >
          {allCategories.map((cat) => (
            <Pressable
              key={cat.id}
              style={[
                s.tab,
                {
                  backgroundColor: activeCategory === cat.id ? colors.red : colors.card,
                  borderColor: activeCategory === cat.id ? colors.red : colors.border,
                },
              ]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text
                style={[
                  s.tabText,
                  { color: activeCategory === cat.id ? "#fff" : colors.mutedForeground },
                ]}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator color={colors.red} size="large" />
        </View>
      ) : (
        <>
          <Text style={s.count}>{filtered.length} products</Text>
          <FlatList
            data={filtered}
            numColumns={2}
            columnWrapperStyle={s.row}
            keyExtractor={keyExtractProduct}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            maxToRenderPerBatch={6}
            windowSize={7}
            initialNumToRender={6}
            renderItem={renderProduct}
            ListEmptyComponent={
              <View style={s.empty}>
                <Feather name="package" size={48} color={colors.mutedForeground} />
                <Text style={s.emptyText}>No products found</Text>
              </View>
            }
          />
        </>
      )}
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
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
    title: { color: colors.foreground, fontSize: 20, fontWeight: "800" },
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 10,
      marginHorizontal: 16,
      marginTop: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    searchInput: { flex: 1, color: colors.foreground, fontSize: 14 },
    tabs: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
    tabText: { fontSize: 13, fontWeight: "600" },
    loader: { flex: 1, alignItems: "center", justifyContent: "center" },
    count: { color: colors.mutedForeground, fontSize: 13, paddingHorizontal: 16, marginBottom: 8, marginTop: 8 },
    list: { paddingHorizontal: 16, paddingBottom: Platform.OS === "web" ? 100 : 90 },
    row: { gap: 12, marginBottom: 12 },
    empty: { alignItems: "center", justifyContent: "center", paddingVertical: 80, gap: 12 },
    emptyText: { color: colors.mutedForeground, fontSize: 16 },
  });

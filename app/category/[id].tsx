import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ProductCard from "@/components/ProductCard";
import categories from "@/data/categories";
import { useColors } from "@/hooks/useColors";
import { useCategoryProducts } from "@/hooks/useProducts";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 12) / 2;

export default function CategoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const category = categories.find((c) => c.id === id);
  const products = useCategoryProducts(id ?? "");
  const s = styles(colors);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={s.title}>{category?.name ?? "Category"}</Text>
        <View style={{ width: 38 }} />
      </View>

      <FlatList
        data={products}
        numColumns={2}
        columnWrapperStyle={s.row}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={s.count}>{products.length} products</Text>
        }
        renderItem={({ item }) => (
          <ProductCard product={item} width={CARD_WIDTH} />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Feather name="package" size={48} color={colors.mutedForeground} />
            <Text style={s.emptyText}>No products in this category</Text>
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
      paddingHorizontal: 16,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
    },
    title: { flex: 1, color: colors.foreground, fontSize: 18, fontWeight: "700", textAlign: "center" },
    count: {
      color: colors.mutedForeground,
      fontSize: 13,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === "web" ? 100 : 90 },
    row: { gap: 12, marginBottom: 12 },
    empty: {
      alignItems: "center",
      paddingTop: 80,
      gap: 12,
    },
    emptyText: { color: colors.mutedForeground, fontSize: 16 },
  });

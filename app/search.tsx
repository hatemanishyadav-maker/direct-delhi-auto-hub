import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ProductCard from "@/components/ProductCard";
import { searchProducts } from "@/data/products";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 12) / 2;

const SUGGESTIONS = [
  "LED Lights",
  "Android Stereo",
  "Seat Covers",
  "Reverse Camera",
  "Floor Mats",
  "Horns",
];

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const s = styles(colors);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const results = query.trim().length > 1 ? searchProducts(query) : [];

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={s.searchBox}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={s.input}
            placeholder="Search car accessories..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {query.trim().length <= 1 ? (
        <View style={s.suggestions}>
          <Text style={s.suggestTitle}>Popular Searches</Text>
          <View style={s.chips}>
            {SUGGESTIONS.map((s2) => (
              <Pressable key={s2} style={[s.chip, { borderColor: colors.border }]} onPress={() => setQuery(s2)}>
                <Feather name="search" size={12} color={colors.mutedForeground} />
                <Text style={s.chipText}>{s2}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={results}
          numColumns={2}
          columnWrapperStyle={s.row}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            results.length > 0 ? (
              <Text style={s.resultCount}>{results.length} results for "{query}"</Text>
            ) : null
          }
          renderItem={({ item }) => <ProductCard product={item} width={CARD_WIDTH} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Feather name="search" size={48} color={colors.mutedForeground} />
              <Text style={s.emptyTitle}>No results found</Text>
              <Text style={s.emptySubtitle}>Try a different search term</Text>
            </View>
          }
        />
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
      gap: 12,
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchBox: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    input: { flex: 1, color: colors.foreground, fontSize: 15 },
    suggestions: { padding: 16 },
    suggestTitle: { color: colors.mutedForeground, fontSize: 13, fontWeight: "700", marginBottom: 12 },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    chipText: { color: colors.foreground, fontSize: 13 },
    resultCount: {
      color: colors.mutedForeground,
      fontSize: 13,
      marginBottom: 8,
    },
    list: { padding: 16 },
    row: { gap: 12, marginBottom: 12 },
    empty: { alignItems: "center", paddingTop: 80, gap: 10 },
    emptyTitle: { color: colors.foreground, fontSize: 18, fontWeight: "700" },
    emptySubtitle: { color: colors.mutedForeground, fontSize: 14 },
  });

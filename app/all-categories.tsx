import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import categories from "@/data/categories";
import { useColors } from "@/hooks/useColors";

export default function AllCategoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const s = styles(colors);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={s.title}>All Categories</Text>
        <View style={{ width: 38 }} />
      </View>

      <FlatList
        data={categories}
        numColumns={3}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        columnWrapperStyle={s.row}
        renderItem={({ item }) => (
          <Pressable
            style={s.card}
            onPress={() => router.push(`/category/${item.id}` as any)}
          >
            <View style={[s.iconBox, { backgroundColor: item.color + "22" }]}>
              <Feather name={item.icon as any} size={28} color={item.color} />
            </View>
            <Text style={s.name} numberOfLines={2}>
              {item.name}
            </Text>
          </Pressable>
        )}
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
    title: {
      flex: 1,
      color: colors.foreground,
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
    },
    list: { padding: 16 },
    row: { gap: 12, marginBottom: 12 },
    card: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      paddingVertical: 20,
      paddingHorizontal: 8,
      gap: 10,
    },
    iconBox: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    name: {
      color: colors.foreground,
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
      lineHeight: 16,
    },
  });

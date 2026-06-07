import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  title: string;
  onSeeAll?: () => void;
  categoryId?: string;
}

export default function SectionHeader({ title, onSeeAll, categoryId }: Props) {
  const colors = useColors();

  const handleSeeAll = () => {
    if (onSeeAll) {
      onSeeAll();
    } else if (categoryId) {
      router.push(`/category/${categoryId}` as any);
    }
  };

  return (
    <View style={styles.row}>
      <View style={styles.titleRow}>
        <View style={[styles.accent, { backgroundColor: colors.red }]} />
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      </View>
      <Pressable style={styles.seeAll} onPress={handleSeeAll}>
        <Text style={[styles.seeAllText, { color: colors.red }]}>See All</Text>
        <Feather name="chevron-right" size={14} color={colors.red} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  accent: {
    width: 3,
    height: 18,
    borderRadius: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
});

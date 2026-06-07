import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface BarData {
  label: string;
  value: number;
}

interface Props {
  data: BarData[];
  height?: number;
  barColor?: string;
}

export default function SimpleBarChart({ data, height = 140, barColor }: Props) {
  const colors = useColors();
  const max = Math.max(...data.map((d) => d.value), 1);
  const color = barColor ?? colors.red;

  return (
    <View style={[styles.container, { height }]}>
      <View style={[styles.chartArea, { height: height - 28 }]}>
        {data.map((item) => {
          const barH = ((item.value / max) * (height - 28 - 8));
          return (
            <View key={item.label} style={styles.barGroup}>
              <Text style={[styles.barValue, { color: colors.mutedForeground }]}>
                {item.value > 999 ? `${(item.value / 1000).toFixed(1)}k` : item.value}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barH,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {data.map((item) => (
          <Text key={item.label} style={[styles.label, { color: colors.mutedForeground }]} numberOfLines={1}>
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 6,
    paddingBottom: 4,
  },
  barGroup: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 3,
  },
  barValue: { fontSize: 9, fontWeight: "600" },
  barTrack: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 4,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
    marginTop: 4,
  },
  label: {
    flex: 1,
    fontSize: 9,
    textAlign: "center",
  },
});

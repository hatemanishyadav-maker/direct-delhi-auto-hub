import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AdminProduct, StockEntry, useAdmin } from "@/contexts/AdminContext";
import { useColors } from "@/hooks/useColors";

export default function AdminInventory() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { products, updateProduct, stockHistory, addStockEntry } = useAdmin();
  const [tab, setTab] = useState<"stock" | "history" | "suppliers">("stock");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [stockType, setStockType] = useState<"in" | "out">("in");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const s = styles(colors);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const lowStock = products.filter((p) => p.stock <= p.lowStockThreshold);
  const { suppliers } = useAdmin();

  const openStockModal = (product: AdminProduct, type: "in" | "out") => {
    setSelectedProduct(product);
    setStockType(type);
    setQty("");
    setNote("");
    setModalVisible(true);
  };

  const handleStockUpdate = () => {
    if (!selectedProduct || !qty || isNaN(Number(qty)) || Number(qty) <= 0) {
      Alert.alert("Error", "Enter a valid quantity.");
      return;
    }
    const q = Number(qty);
    const newStock = stockType === "in"
      ? selectedProduct.stock + q
      : Math.max(0, selectedProduct.stock - q);
    updateProduct(selectedProduct.id, { stock: newStock, inStock: newStock > 0 });
    addStockEntry({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      type: stockType,
      qty: q,
      date: new Date().toISOString().split("T")[0],
      note: note || (stockType === "in" ? "Stock received" : "Stock issued"),
    });
    setModalVisible(false);
  };

  const renderStockItem = ({ item }: { item: AdminProduct }) => {
    const isLow = item.stock <= item.lowStockThreshold;
    const pct = Math.min(100, Math.round((item.stock / Math.max(item.stock, item.lowStockThreshold * 3)) * 100));
    return (
      <View style={s.card}>
        <View style={s.cardTop}>
          <View style={s.cardInfo}>
            <Text style={s.sku}>{item.sku}</Text>
            <Text style={s.productName} numberOfLines={2}>{item.name}</Text>
          </View>
          <View style={[s.stockCircle, { borderColor: isLow ? "#F59E0B" : "#22c55e" }]}>
            <Text style={[s.stockNum, { color: isLow ? "#F59E0B" : "#22c55e" }]}>{item.stock}</Text>
            <Text style={s.stockUnit}>units</Text>
          </View>
        </View>
        <View style={s.progressBar}>
          <View style={[s.progressFill, {
            width: `${pct}%` as any,
            backgroundColor: isLow ? "#F59E0B" : "#22c55e",
          }]} />
        </View>
        {isLow && (
          <View style={s.lowAlert}>
            <Feather name="alert-triangle" size={12} color="#F59E0B" />
            <Text style={s.lowAlertText}>Low stock — threshold: {item.lowStockThreshold} units</Text>
          </View>
        )}
        <View style={s.btnRow}>
          <Pressable style={[s.stockBtn, { backgroundColor: "#22c55e22", borderColor: "#22c55e" }]} onPress={() => openStockModal(item, "in")}>
            <Feather name="plus" size={14} color="#22c55e" />
            <Text style={[s.stockBtnText, { color: "#22c55e" }]}>Stock In</Text>
          </Pressable>
          <Pressable style={[s.stockBtn, { backgroundColor: colors.red + "22", borderColor: colors.red }]} onPress={() => openStockModal(item, "out")}>
            <Feather name="minus" size={14} color={colors.red} />
            <Text style={[s.stockBtnText, { color: colors.red }]}>Stock Out</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderHistoryItem = ({ item }: { item: StockEntry }) => (
    <View style={s.historyCard}>
      <View style={[s.typeIcon, { backgroundColor: item.type === "in" ? "#22c55e22" : colors.red + "22" }]}>
        <Feather name={item.type === "in" ? "arrow-down-circle" : "arrow-up-circle"} size={18} color={item.type === "in" ? "#22c55e" : colors.red} />
      </View>
      <View style={s.historyInfo}>
        <Text style={s.historyName} numberOfLines={1}>{item.productName}</Text>
        <Text style={s.historyNote}>{item.note}</Text>
      </View>
      <View style={s.historyRight}>
        <Text style={[s.historyQty, { color: item.type === "in" ? "#22c55e" : colors.red }]}>
          {item.type === "in" ? "+" : "-"}{item.qty}
        </Text>
        <Text style={s.historyDate}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={s.title}>Inventory</Text>
        {lowStock.length > 0 && (
          <View style={s.alertBadge}>
            <Text style={s.alertBadgeText}>{lowStock.length} low</Text>
          </View>
        )}
      </View>

      <View style={s.tabs}>
        {[
          { id: "stock", label: "Stock" },
          { id: "history", label: "History" },
          { id: "suppliers", label: "Suppliers" },
        ].map((t) => (
          <Pressable
            key={t.id}
            style={[s.tab, tab === t.id && { borderBottomColor: colors.red }]}
            onPress={() => setTab(t.id as any)}
          >
            <Text style={[s.tabText, { color: tab === t.id ? colors.red : colors.mutedForeground }]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "stock" && (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          renderItem={renderStockItem}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}

      {tab === "history" && (
        <FlatList
          data={stockHistory}
          keyExtractor={(h) => h.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          renderItem={renderHistoryItem}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={<View style={s.empty}><Text style={s.emptyText}>No history yet</Text></View>}
        />
      )}

      {tab === "suppliers" && (
        <FlatList
          data={suppliers}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles(colors).list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles(colors).card}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles(colors).productName}>{item.name}</Text>
                  <Text style={styles(colors).sku}>{item.phone}</Text>
                  <Text style={styles(colors).historyNote}>GST: {item.gst}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 14 }}>₹{item.totalPurchased.toLocaleString()}</Text>
                  <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>Total purchased</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {item.products.map((p) => (
                  <View key={p} style={{ backgroundColor: colors.secondary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{p}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>
              {stockType === "in" ? "Stock In" : "Stock Out"} — {selectedProduct?.name}
            </Text>
            <Text style={s.modalSub}>Current stock: {selectedProduct?.stock ?? 0} units</Text>
            <TextInput
              style={s.modalInput}
              placeholder="Quantity"
              placeholderTextColor={colors.mutedForeground}
              value={qty}
              onChangeText={setQty}
              keyboardType="numeric"
              autoFocus
            />
            <TextInput
              style={s.modalInput}
              placeholder="Note (optional)"
              placeholderTextColor={colors.mutedForeground}
              value={note}
              onChangeText={setNote}
            />
            <View style={s.modalBtns}>
              <Pressable style={s.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={[s.modalConfirm, { backgroundColor: stockType === "in" ? "#22c55e" : colors.red }]} onPress={handleStockUpdate}>
                <Text style={s.modalConfirmText}>{stockType === "in" ? "Add Stock" : "Remove Stock"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { flex: 1, color: colors.foreground, fontSize: 18, fontWeight: "800" },
    alertBadge: { backgroundColor: "#F59E0B22", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
    alertBadgeText: { color: "#F59E0B", fontSize: 12, fontWeight: "700" },
    tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border },
    tab: { flex: 1, alignItems: "center", paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
    tabText: { fontSize: 14, fontWeight: "600" },
    list: { padding: 16, paddingBottom: Platform.OS === "web" ? 60 : 40 },
    card: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 10 },
    cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    cardInfo: { flex: 1, gap: 4 },
    sku: { color: colors.red, fontSize: 11, fontWeight: "700" },
    productName: { color: colors.foreground, fontSize: 14, fontWeight: "600", lineHeight: 19 },
    stockCircle: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, alignItems: "center", justifyContent: "center" },
    stockNum: { fontSize: 18, fontWeight: "800" },
    stockUnit: { color: colors.mutedForeground, fontSize: 10 },
    progressBar: { height: 5, backgroundColor: colors.secondary, borderRadius: 3, overflow: "hidden" },
    progressFill: { height: "100%", borderRadius: 3 },
    lowAlert: { flexDirection: "row", alignItems: "center", gap: 5 },
    lowAlertText: { color: "#F59E0B", fontSize: 12 },
    btnRow: { flexDirection: "row", gap: 10 },
    stockBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, borderRadius: 8, borderWidth: 1, paddingVertical: 8 },
    stockBtnText: { fontSize: 13, fontWeight: "700" },
    historyCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 12 },
    typeIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    historyInfo: { flex: 1 },
    historyName: { color: colors.foreground, fontSize: 13, fontWeight: "600" },
    historyNote: { color: colors.mutedForeground, fontSize: 12, marginTop: 2 },
    historyRight: { alignItems: "flex-end" },
    historyQty: { fontSize: 16, fontWeight: "800" },
    historyDate: { color: colors.mutedForeground, fontSize: 11, marginTop: 2 },
    empty: { alignItems: "center", paddingTop: 80 },
    emptyText: { color: colors.mutedForeground, fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
    modal: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 14 },
    modalTitle: { color: colors.foreground, fontSize: 16, fontWeight: "800" },
    modalSub: { color: colors.mutedForeground, fontSize: 13, marginTop: -6 },
    modalInput: { backgroundColor: colors.secondary, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12, color: colors.foreground, fontSize: 16 },
    modalBtns: { flexDirection: "row", gap: 12 },
    modalCancel: { flex: 1, alignItems: "center", paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
    modalCancelText: { color: colors.mutedForeground, fontSize: 15, fontWeight: "600" },
    modalConfirm: { flex: 1, alignItems: "center", paddingVertical: 13, borderRadius: 12 },
    modalConfirmText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  });

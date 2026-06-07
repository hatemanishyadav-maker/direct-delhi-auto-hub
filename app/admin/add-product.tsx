import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import categories from "@/data/categories";
import { useAdmin } from "@/contexts/AdminContext";
import { useColors } from "@/hooks/useColors";

const bannerImg = require("../../assets/images/banner1.png");

export default function AddProductScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { products, addProduct, updateProduct } = useAdmin();
  const isEdit = !!id;
  const existing = products.find((p) => p.id === id);
  const s = styles(colors);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [name, setName] = useState(existing?.name ?? "");
  const [sku, setSku] = useState(existing?.sku ?? "");
  const [brand, setBrand] = useState(existing?.brand ?? "");
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? "lights");
  const [price, setPrice] = useState(existing?.price?.toString() ?? "");
  const [purchasePrice, setPurchasePrice] = useState(existing?.purchasePrice?.toString() ?? "");
  const [mrp, setMrp] = useState(existing?.mrp?.toString() ?? "");
  const [stock, setStock] = useState(existing?.stock?.toString() ?? "");
  const [lowStock, setLowStock] = useState(existing?.lowStockThreshold?.toString() ?? "5");
  const [description, setDescription] = useState(existing?.description ?? "");

  const validate = () => {
    if (!name.trim()) { Alert.alert("Error", "Product name is required."); return false; }
    if (!sku.trim()) { Alert.alert("Error", "SKU is required."); return false; }
    if (!price || isNaN(Number(price))) { Alert.alert("Error", "Valid selling price required."); return false; }
    if (!stock || isNaN(Number(stock))) { Alert.alert("Error", "Valid stock quantity required."); return false; }
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    const data = {
      name: name.trim(),
      sku: sku.trim(),
      brand: brand.trim(),
      categoryId,
      price: Number(price),
      purchasePrice: Number(purchasePrice) || 0,
      mrp: Number(mrp) || Number(price),
      stock: Number(stock),
      lowStockThreshold: Number(lowStock) || 5,
      description: description.trim(),
      image: bannerImg,
      images: [bannerImg],
      inStock: Number(stock) > 0,
      rating: 4.0,
      reviewCount: 0,
      specs: [],
    };
    if (isEdit && id) {
      updateProduct(id, data);
      Alert.alert("Updated!", `"${name}" has been updated.`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      addProduct(data);
      Alert.alert("Added!", `"${name}" has been added.`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  };

  const InputField = ({
    label, value, onChangeText, placeholder, keyboardType, required,
  }: {
    label: string; value: string; onChangeText: (v: string) => void;
    placeholder?: string; keyboardType?: "default" | "numeric"; required?: boolean;
  }) => (
    <View style={s.fieldGroup}>
      <Text style={s.fieldLabel}>{label}{required && <Text style={{ color: colors.red }}> *</Text>}</Text>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType ?? "default"}
      />
    </View>
  );

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={s.title}>{isEdit ? "Edit Product" : "Add Product"}</Text>
        <Pressable style={s.saveBtn} onPress={handleSave}>
          <Text style={s.saveBtnText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.sectionLabel}>Basic Information</Text>
        <View style={s.card}>
          <InputField label="Product Name" value={name} onChangeText={setName} required placeholder="e.g. LED H4 Headlight Bulb" />
          <InputField label="SKU Code" value={sku} onChangeText={setSku} required placeholder="e.g. LED-H4-01" />
          <InputField label="Brand" value={brand} onChangeText={setBrand} placeholder="e.g. OSRAM" />
          <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[
                      s.catChip,
                      { borderColor: categoryId === cat.id ? colors.red : colors.border },
                      categoryId === cat.id && { backgroundColor: colors.red + "22" },
                    ]}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <Text style={[s.catChipText, { color: categoryId === cat.id ? colors.red : colors.mutedForeground }]}>
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
          <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>Description</Text>
            <TextInput
              style={[s.input, s.multiline]}
              value={description}
              onChangeText={setDescription}
              placeholder="Product description..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <Text style={s.sectionLabel}>Pricing</Text>
        <View style={s.card}>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <InputField label="Selling Price *" value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="₹0" />
            </View>
            <View style={{ flex: 1 }}>
              <InputField label="MRP" value={mrp} onChangeText={setMrp} keyboardType="numeric" placeholder="₹0" />
            </View>
          </View>
          <InputField label="Purchase / Cost Price" value={purchasePrice} onChangeText={setPurchasePrice} keyboardType="numeric" placeholder="₹0" />
          {price && purchasePrice && Number(price) > 0 && (
            <View style={s.marginDisplay}>
              <Text style={s.marginLabel}>Estimated Margin:</Text>
              <Text style={s.marginValue}>
                ₹{(Number(price) - Number(purchasePrice)).toLocaleString()} ({Math.round(((Number(price) - Number(purchasePrice)) / Number(price)) * 100)}%)
              </Text>
            </View>
          )}
        </View>

        <Text style={s.sectionLabel}>Inventory</Text>
        <View style={s.card}>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <InputField label="Stock Quantity *" value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="0" />
            </View>
            <View style={{ flex: 1 }}>
              <InputField label="Low Stock Alert" value={lowStock} onChangeText={setLowStock} keyboardType="numeric" placeholder="5" />
            </View>
          </View>
        </View>

        <View style={{ height: Platform.OS === "web" ? 60 : 40 }} />
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
      gap: 12,
      paddingHorizontal: 16,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { flex: 1, color: colors.foreground, fontSize: 18, fontWeight: "800" },
    saveBtn: { backgroundColor: colors.red, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
    saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
    scroll: { padding: 16, gap: 12 },
    sectionLabel: {
      color: colors.mutedForeground,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginTop: 4,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      gap: 12,
    },
    fieldGroup: { gap: 6 },
    fieldLabel: { color: colors.foreground, fontSize: 13, fontWeight: "600" },
    input: {
      backgroundColor: colors.secondary,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.foreground,
      fontSize: 14,
    },
    multiline: { minHeight: 80, textAlignVertical: "top" },
    row: { flexDirection: "row", gap: 12 },
    catChip: {
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    catChipText: { fontSize: 12, fontWeight: "600" },
    marginDisplay: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "#22c55e22",
      borderRadius: 8,
      padding: 10,
    },
    marginLabel: { color: colors.mutedForeground, fontSize: 13 },
    marginValue: { color: "#22c55e", fontSize: 14, fontWeight: "700" },
  });

import { Stack } from "expo-router";
import React from "react";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="products" />
      <Stack.Screen name="add-product" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="inventory" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="customers" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="invoice/[orderId]" />
    </Stack>
  );
}

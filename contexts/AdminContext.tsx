import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Product } from "@/types";

export interface AdminProduct extends Product {
  sku: string;
  brand: string;
  purchasePrice: number;
  stock: number;
  lowStockThreshold: number;
  supplierId?: string;
}

export interface AdminOrder {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: { productId: string; productName: string; qty: number; price: number }[];
  total: number;
  status: "pending" | "confirmed" | "packing" | "dispatched" | "delivered" | "cancelled";
  date: string;
  paymentMethod: "cod" | "upi";
  paymentStatus: "pending" | "paid";
}

export interface AdminCustomer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  gst: string;
  products: string[];
  totalPurchased: number;
}

export interface StockEntry {
  id: string;
  productId: string;
  productName: string;
  type: "in" | "out";
  qty: number;
  date: string;
  note: string;
}

const lightsImg = require("../assets/images/cat_lights.jpg");
const stereoImg = require("../assets/images/cat_stereo.jpg");
const seatsImg = require("../assets/images/cat_seats.jpg");
const bannerImg = require("../assets/images/banner1.jpg");

const SEED_PRODUCTS: AdminProduct[] = [
  {
    id: "p1", name: "OSRAM LED Headlight Bulb H4 (Pair)", categoryId: "lights",
    price: 2499, mrp: 3999, purchasePrice: 1400, sku: "LED-H4-01", brand: "OSRAM",
    stock: 45, lowStockThreshold: 10, image: lightsImg, images: [lightsImg],
    description: "Upgrade your vehicle's lighting with OSRAM LED H4 bulbs.",
    specs: [{ label: "Wattage", value: "25W" }, { label: "Color Temp", value: "6000K" }],
    inStock: true, rating: 4.5, reviewCount: 328, isFeatured: true, isBestseller: true,
  },
  {
    id: "p2", name: "RGB LED Interior Light Strip (4pcs)", categoryId: "lights",
    price: 799, mrp: 1499, purchasePrice: 350, sku: "LED-RGB-02", brand: "Generic",
    stock: 78, lowStockThreshold: 15, image: lightsImg, images: [lightsImg],
    description: "16 million colors RGB LED strip light for car interior.",
    specs: [{ label: "Control", value: "Bluetooth" }],
    inStock: true, rating: 4.3, reviewCount: 215, isNew: true,
  },
  {
    id: "p3", name: "Android 10 Car Stereo 9-inch", categoryId: "stereo",
    price: 7999, mrp: 12999, purchasePrice: 4500, sku: "STEREO-A10-01", brand: "Xtrons",
    stock: 12, lowStockThreshold: 5, image: stereoImg, images: [stereoImg],
    description: "9-inch Full HD IPS touchscreen Android car stereo.",
    specs: [{ label: "RAM", value: "2GB" }, { label: "ROM", value: "32GB" }],
    inStock: true, rating: 4.6, reviewCount: 512, isFeatured: true, isBestseller: true,
  },
  {
    id: "p4", name: "Android 12 Car Stereo 10-inch", categoryId: "stereo",
    price: 10999, mrp: 16999, purchasePrice: 6500, sku: "STEREO-A12-01", brand: "Joying",
    stock: 8, lowStockThreshold: 5, image: stereoImg, images: [stereoImg],
    description: "10-inch QLED Android 12 stereo.",
    specs: [{ label: "RAM", value: "4GB" }, { label: "ROM", value: "64GB" }],
    inStock: true, rating: 4.7, reviewCount: 189, isNew: true, isFeatured: true,
  },
  {
    id: "p5", name: "Premium Leatherite Seat Cover Set", categoryId: "seats",
    price: 3499, mrp: 5999, purchasePrice: 1800, sku: "SEAT-PRM-01", brand: "AutoFit",
    stock: 3, lowStockThreshold: 5, image: seatsImg, images: [seatsImg],
    description: "Full set premium leatherite seat covers.",
    specs: [{ label: "Material", value: "Leatherite" }],
    inStock: true, rating: 4.4, reviewCount: 673, isBestseller: true, isFeatured: true,
  },
  {
    id: "p6", name: "3D Honeycomb Floor Mat Set (7pcs)", categoryId: "mats",
    price: 1199, mrp: 2499, purchasePrice: 550, sku: "MAT-3D-01", brand: "Generic",
    stock: 65, lowStockThreshold: 10, image: bannerImg, images: [bannerImg],
    description: "Heavy duty 3D honeycomb design floor mats.",
    specs: [{ label: "Pieces", value: "7" }],
    inStock: true, rating: 4.2, reviewCount: 421, isBestseller: true,
  },
  {
    id: "p7", name: "HD Reversing Camera 170°", categoryId: "cameras",
    price: 1999, mrp: 3499, purchasePrice: 900, sku: "CAM-REV-01", brand: "Rear Eye",
    stock: 22, lowStockThreshold: 8, image: bannerImg, images: [bannerImg],
    description: "HD 1080P rear view camera.",
    specs: [{ label: "Resolution", value: "1080P" }],
    inStock: true, rating: 4.3, reviewCount: 298, isNew: true,
  },
  {
    id: "p8", name: "Parking Sensor Kit (4 Sensors)", categoryId: "cameras",
    price: 2199, mrp: 3999, purchasePrice: 1100, sku: "PARK-SEN-01", brand: "ParkSafe",
    stock: 18, lowStockThreshold: 5, image: bannerImg, images: [bannerImg],
    description: "Ultrasonic parking sensor kit.",
    specs: [{ label: "Sensors", value: "4" }],
    inStock: true, rating: 4.1, reviewCount: 156,
  },
  {
    id: "p9", name: "Musical Air Horn 12V (120dB)", categoryId: "horns",
    price: 649, mrp: 999, purchasePrice: 280, sku: "HORN-MUS-01", brand: "Roots",
    stock: 90, lowStockThreshold: 20, image: bannerImg, images: [bannerImg],
    description: "Powerful 120dB musical air horn.",
    specs: [{ label: "Sound", value: "120dB" }],
    inStock: true, rating: 4.0, reviewCount: 387, isBestseller: true,
  },
  {
    id: "p13", name: "Universal Car Phone Holder", categoryId: "interior",
    price: 349, mrp: 599, purchasePrice: 130, sku: "HOLD-PH-01", brand: "Baseus",
    stock: 120, lowStockThreshold: 20, image: bannerImg, images: [bannerImg],
    description: "360° rotating gravity car phone holder.",
    specs: [{ label: "Rotation", value: "360°" }],
    inStock: true, rating: 4.3, reviewCount: 892, isBestseller: true,
  },
  {
    id: "p15", name: "Bosch Wiper Blade Set", categoryId: "spare",
    price: 849, mrp: 1499, purchasePrice: 450, sku: "WIPE-BSH-01", brand: "Bosch",
    stock: 4, lowStockThreshold: 5, image: bannerImg, images: [bannerImg],
    description: "Bosch Aerotwin flat wiper blades.",
    specs: [{ label: "Brand", value: "Bosch" }],
    inStock: true, rating: 4.6, reviewCount: 317, isBestseller: true,
  },
];

const SEED_ORDERS: AdminOrder[] = [
  {
    id: "o1", orderId: "DDAH-001", customerId: "c1",
    customerName: "Rahul Sharma", customerPhone: "9876543210",
    customerAddress: "12, Rohini Sector 7, Delhi - 110085",
    items: [{ productId: "p3", productName: "Android 10 Car Stereo 9-inch", qty: 1, price: 7999 },
            { productId: "p7", productName: "HD Reversing Camera", qty: 1, price: 1999 }],
    total: 9998, status: "delivered", date: "2026-05-28", paymentMethod: "upi", paymentStatus: "paid",
  },
  {
    id: "o2", orderId: "DDAH-002", customerId: "c2",
    customerName: "Priya Gupta", customerPhone: "9988776655",
    customerAddress: "45, Dwarka Sector 12, Delhi - 110075",
    items: [{ productId: "p5", productName: "Premium Seat Cover Set", qty: 1, price: 3499 }],
    total: 3499, status: "dispatched", date: "2026-06-02", paymentMethod: "cod", paymentStatus: "pending",
  },
  {
    id: "o3", orderId: "DDAH-003", customerId: "c3",
    customerName: "Amit Verma", customerPhone: "9871234567",
    customerAddress: "78, Laxmi Nagar, Delhi - 110092",
    items: [{ productId: "p1", productName: "OSRAM LED Headlight Bulb H4", qty: 2, price: 2499 },
            { productId: "p6", productName: "3D Floor Mat Set", qty: 1, price: 1199 }],
    total: 6197, status: "confirmed", date: "2026-06-04", paymentMethod: "upi", paymentStatus: "paid",
  },
  {
    id: "o4", orderId: "DDAH-004", customerId: "c4",
    customerName: "Sunita Yadav", customerPhone: "9812345678",
    customerAddress: "33, Janakpuri, Delhi - 110058",
    items: [{ productId: "p9", productName: "Musical Air Horn", qty: 1, price: 649 }],
    total: 649, status: "pending", date: "2026-06-05", paymentMethod: "cod", paymentStatus: "pending",
  },
  {
    id: "o5", orderId: "DDAH-005", customerId: "c5",
    customerName: "Rajesh Kumar", customerPhone: "9701234567",
    customerAddress: "101, Pitampura, Delhi - 110034",
    items: [{ productId: "p4", productName: "Android 12 Stereo 10-inch", qty: 1, price: 10999 }],
    total: 10999, status: "packing", date: "2026-06-05", paymentMethod: "upi", paymentStatus: "paid",
  },
  {
    id: "o6", orderId: "DDAH-006", customerId: "c1",
    customerName: "Rahul Sharma", customerPhone: "9876543210",
    customerAddress: "12, Rohini Sector 7, Delhi - 110085",
    items: [{ productId: "p13", productName: "Car Phone Holder", qty: 2, price: 349 },
            { productId: "p8", productName: "Parking Sensor Kit", qty: 1, price: 2199 }],
    total: 2897, status: "pending", date: "2026-06-06", paymentMethod: "cod", paymentStatus: "pending",
  },
];

const SEED_CUSTOMERS: AdminCustomer[] = [
  { id: "c1", name: "Rahul Sharma", phone: "9876543210", address: "Rohini, Delhi", totalOrders: 2, totalSpent: 12895, joinDate: "2026-03-10" },
  { id: "c2", name: "Priya Gupta", phone: "9988776655", address: "Dwarka, Delhi", totalOrders: 1, totalSpent: 3499, joinDate: "2026-04-22" },
  { id: "c3", name: "Amit Verma", phone: "9871234567", address: "Laxmi Nagar, Delhi", totalOrders: 1, totalSpent: 6197, joinDate: "2026-05-01" },
  { id: "c4", name: "Sunita Yadav", phone: "9812345678", address: "Janakpuri, Delhi", totalOrders: 1, totalSpent: 649, joinDate: "2026-05-15" },
  { id: "c5", name: "Rajesh Kumar", phone: "9701234567", address: "Pitampura, Delhi", totalOrders: 1, totalSpent: 10999, joinDate: "2026-06-01" },
];

const SEED_SUPPLIERS: Supplier[] = [
  { id: "s1", name: "Mumbai Auto Traders", phone: "9022334455", gst: "27ABCDE1234F1Z5", products: ["LED Lights", "Horns"], totalPurchased: 85000 },
  { id: "s2", name: "Delhi Electronics Hub", phone: "9811223344", gst: "07FGHIJ5678G2A3", products: ["Android Stereos", "Cameras"], totalPurchased: 145000 },
  { id: "s3", name: "Chennai Auto Parts", phone: "9444556677", gst: "33KLMNO9012H3B4", products: ["Seat Covers", "Floor Mats", "Spare Parts"], totalPurchased: 62000 },
];

const SEED_STOCK_HISTORY: StockEntry[] = [
  { id: "sh1", productId: "p1", productName: "OSRAM LED Headlight", type: "in", qty: 20, date: "2026-05-25", note: "Purchase from Mumbai Auto Traders" },
  { id: "sh2", productId: "p3", productName: "Android 10 Stereo", type: "in", qty: 10, date: "2026-05-20", note: "New stock" },
  { id: "sh3", productId: "p5", productName: "Seat Cover Set", type: "out", qty: 2, date: "2026-06-02", note: "Order DDAH-002" },
  { id: "sh4", productId: "p3", productName: "Android 10 Stereo", type: "out", qty: 1, date: "2026-05-28", note: "Order DDAH-001" },
  { id: "sh5", productId: "p9", productName: "Musical Air Horn", type: "in", qty: 50, date: "2026-06-01", note: "Bulk purchase" },
];

interface AdminContextType {
  products: AdminProduct[];
  orders: AdminOrder[];
  customers: AdminCustomer[];
  suppliers: Supplier[];
  stockHistory: StockEntry[];
  addProduct: (p: Omit<AdminProduct, "id">) => void;
  updateProduct: (id: string, data: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (id: string, status: AdminOrder["status"]) => void;
  addStockEntry: (entry: Omit<StockEntry, "id">) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

const KEYS = {
  products: "@ddah_admin_products",
  orders: "@ddah_admin_orders",
  customers: "@ddah_admin_customers",
  stockHistory: "@ddah_stock_history",
};

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<AdminProduct[]>(SEED_PRODUCTS);
  const [orders, setOrders] = useState<AdminOrder[]>(SEED_ORDERS);
  const [customers] = useState<AdminCustomer[]>(SEED_CUSTOMERS);
  const [suppliers] = useState<Supplier[]>(SEED_SUPPLIERS);
  const [stockHistory, setStockHistory] = useState<StockEntry[]>(SEED_STOCK_HISTORY);

  useEffect(() => {
    const load = async () => {
      const [savedProducts, savedOrders, savedStock] = await Promise.all([
        AsyncStorage.getItem(KEYS.products),
        AsyncStorage.getItem(KEYS.orders),
        AsyncStorage.getItem(KEYS.stockHistory),
      ]);
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      if (savedStock) setStockHistory(JSON.parse(savedStock));
    };
    load();
  }, []);

  const addProduct = useCallback((p: Omit<AdminProduct, "id">) => {
    const newProduct = { ...p, id: `p_${Date.now()}` } as AdminProduct;
    setProducts((prev) => {
      const next = [...prev, newProduct];
      AsyncStorage.setItem(KEYS.products, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateProduct = useCallback((id: string, data: Partial<AdminProduct>) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...data } : p));
      AsyncStorage.setItem(KEYS.products, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      AsyncStorage.setItem(KEYS.products, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateOrderStatus = useCallback((id: string, status: AdminOrder["status"]) => {
    setOrders((prev) => {
      const next = prev.map((o) =>
        o.id === id
          ? { ...o, status, paymentStatus: status === "delivered" ? "paid" : o.paymentStatus }
          : o
      );
      AsyncStorage.setItem(KEYS.orders, JSON.stringify(next));
      return next;
    });
  }, []);

  const addStockEntry = useCallback((entry: Omit<StockEntry, "id">) => {
    const newEntry = { ...entry, id: `sh_${Date.now()}` };
    setStockHistory((prev) => {
      const next = [newEntry, ...prev];
      AsyncStorage.setItem(KEYS.stockHistory, JSON.stringify(next));
      return next;
    });
    updateProduct(entry.productId, {
      stock: undefined as any,
    });
  }, [updateProduct]);

  return (
    <AdminContext.Provider value={{
      products, orders, customers, suppliers, stockHistory,
      addProduct, updateProduct, deleteProduct, updateOrderStatus, addStockEntry,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}

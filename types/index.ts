export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  mrp: number;
  image: any;
  images?: any[];
  description: string;
  specs: { label: string; value: string }[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  address: string;
  paymentMethod: string;
}

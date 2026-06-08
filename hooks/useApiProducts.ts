import { useEffect, useState } from "react";
import { API_BASE } from "@/constants/apiUrl";

export interface ApiProduct {
  id: number;
  name: string;
  categoryId: string;
  price: number;
  mrp: number;
  purchasePrice: number;
  imageUrl: string | null;
  description: string | null;
  sku: string;
  brand: string;
  stock: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  isNew: boolean | null;
  isBestseller: boolean | null;
  isFeatured: boolean | null;
}

interface UseApiProductsOptions {
  category?: string;
  featured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
}

export function useApiProducts(opts: UseApiProductsOptions = {}) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (opts.category) params.set("category", opts.category);
    if (opts.featured) params.set("featured", "true");
    if (opts.isNew) params.set("isNew", "true");
    if (opts.isBestseller) params.set("isBestseller", "true");

    fetch(`${API_BASE}/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [opts.category, opts.featured, opts.isNew, opts.isBestseller]);

  return { products, loading, error };
}

export function useApiProduct(id: number | string | null) {
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/products/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  return { product, loading };
}

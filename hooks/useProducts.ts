import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Product } from "@/types";
import { API_BASE } from "@/constants/apiUrl";

function apiToProduct(p: any): Product {
  return {
    id: String(p.id),
    name: p.name,
    categoryId: p.categoryId,
    price: Number(p.price),
    mrp: Number(p.mrp),
    imageUrl: p.imageUrl || null,
    description: p.description || "",
    specs: [],
    inStock: p.inStock ?? p.stock > 0,
    rating: Number(p.rating) || 4.0,
    reviewCount: p.reviewCount || 0,
    isNew: p.isNew ?? false,
    isBestseller: p.isBestseller ?? false,
    isFeatured: p.isFeatured ?? false,
  };
}

async function fetchProducts(params?: Record<string, string>): Promise<Product[]> {
  const qs = params && Object.keys(params).length > 0
    ? "?" + new URLSearchParams(params).toString()
    : "";
  const res = await fetch(`${API_BASE}/products${qs}`, {
    headers: { "Cache-Control": "no-cache" },
  });
  if (!res.ok) throw new Error("API error");
  const data = await res.json();
  return Array.isArray(data) ? data.map(apiToProduct) : [];
}

export function useAllProducts(search?: string, filter?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const params: Record<string, string> = {};
    if (search?.trim()) params.q = search.trim();
    if (filter === "featured") params.featured = "true";
    else if (filter === "new") params.isNew = "true";
    else if (filter === "bestseller") params.isBestseller = "true";

    setLoading(true);
    fetchProducts(params)
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, filter]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  return { products, loading, refetch: load };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useFocusEffect(useCallback(() => {
    fetchProducts({ featured: "true" })
      .then((d) => setProducts(d))
      .catch(() => {});
  }, []));

  return products;
}

export function useNewProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useFocusEffect(useCallback(() => {
    fetchProducts({ isNew: "true" })
      .then((d) => setProducts(d))
      .catch(() => {});
  }, []));

  return products;
}

export function useBestsellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useFocusEffect(useCallback(() => {
    fetchProducts({ isBestseller: "true" })
      .then((d) => setProducts(d))
      .catch(() => {});
  }, []));

  return products;
}

export function useCategoryProducts(categoryId: string) {
  const [products, setProducts] = useState<Product[]>([]);

  useFocusEffect(useCallback(() => {
    if (!categoryId) return;
    fetchProducts({ category: categoryId })
      .then((d) => setProducts(d))
      .catch(() => {});
  }, [categoryId]));

  return products;
}

export function useProductById(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    fetch(`${API_BASE}/products/${id}`, { headers: { "Cache-Control": "no-cache" } })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setProduct(apiToProduct(data));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]));

  return { product, loading };
}

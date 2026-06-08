import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { Product } from "@/types";
import { API_BASE } from "@/constants/apiUrl";
import staticProducts, {
  getFeaturedProducts,
  getNewProducts,
  getBestsellerProducts,
  getProductsByCategory,
  getProductById as getStaticById,
} from "@/data/products";

// Module-level cache shared across all hook instances
const cache: Record<string, { data: Product[]; at: number }> = {};
const CACHE_TTL = 30_000; // 30 seconds — refresh when app comes to foreground

function isFresh(key: string) {
  return cache[key] && Date.now() - cache[key].at < CACHE_TTL;
}

export function invalidateProductCache() {
  Object.keys(cache).forEach((k) => delete cache[k]);
}

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
  const key = qs || "all";
  if (isFresh(key)) return cache[key].data;

  const res = await fetch(`${API_BASE}/products${qs}`, {
    headers: { "Cache-Control": "no-cache" },
  });
  if (!res.ok) throw new Error("API error");
  const data = await res.json();
  const products = Array.isArray(data) ? data.map(apiToProduct) : [];
  cache[key] = { data: products, at: Date.now() };
  return products;
}

// When app comes to foreground, invalidate cache so next fetch gets fresh data
AppState.addEventListener("change", (state: AppStateStatus) => {
  if (state === "active") invalidateProductCache();
});

export function useAllProducts(search?: string, filter?: string) {
  const fallback = filter === "featured"
    ? (getFeaturedProducts() as unknown as Product[])
    : filter === "new"
    ? (getNewProducts() as unknown as Product[])
    : filter === "bestseller"
    ? (getBestsellerProducts() as unknown as Product[])
    : (staticProducts as unknown as Product[]);

  const [products, setProducts] = useState<Product[]>(search ? [] : fallback);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const load = useCallback((force = false) => {
    const params: Record<string, string> = {};
    if (search?.trim()) params.q = search.trim();
    if (filter === "featured") params.featured = "true";
    else if (filter === "new") params.isNew = "true";
    else if (filter === "bestseller") params.isBestseller = "true";
    const key = new URLSearchParams(params).toString() || "all";
    if (!force && isFresh(key)) {
      if (mounted.current) setProducts(cache[key].data);
      return;
    }
    setLoading(true);
    fetchProducts(params)
      .then((data) => { if (mounted.current) setProducts(data.length > 0 ? data : fallback); })
      .catch(() => { if (mounted.current) setProducts(fallback); })
      .finally(() => { if (mounted.current) setLoading(false); });
  }, [search, filter]);

  useEffect(() => { load(); }, [load]);

  return { products, loading, refetch: () => load(true) };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>(
    getFeaturedProducts() as unknown as Product[]
  );
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    fetchProducts({ featured: "true" })
      .then((d) => { if (mounted.current && d.length > 0) setProducts(d); })
      .catch(() => {});
  }, []);
  return products;
}

export function useNewProducts() {
  const [products, setProducts] = useState<Product[]>(
    getNewProducts() as unknown as Product[]
  );
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    fetchProducts({ isNew: "true" })
      .then((d) => { if (mounted.current && d.length > 0) setProducts(d); })
      .catch(() => {});
  }, []);
  return products;
}

export function useBestsellerProducts() {
  const [products, setProducts] = useState<Product[]>(
    getBestsellerProducts() as unknown as Product[]
  );
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    fetchProducts({ isBestseller: "true" })
      .then((d) => { if (mounted.current && d.length > 0) setProducts(d); })
      .catch(() => {});
  }, []);
  return products;
}

export function useCategoryProducts(categoryId: string) {
  const [products, setProducts] = useState<Product[]>(
    getProductsByCategory(categoryId) as unknown as Product[]
  );
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (!categoryId) return;
    fetchProducts({ category: categoryId })
      .then((d) => { if (mounted.current && d.length > 0) setProducts(d); })
      .catch(() => {});
  }, [categoryId]);
  return products;
}

export function useProductById(id: string) {
  const [product, setProduct] = useState<Product | null>(
    getStaticById(id) as unknown as Product | null
  );
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    fetch(`${API_BASE}/products/${id}`, { headers: { "Cache-Control": "no-cache" } })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (mounted.current) {
          if (data) setProduct(apiToProduct(data));
          setLoading(false);
        }
      })
      .catch(() => { if (mounted.current) setLoading(false); });
  }, [id]);
  return { product, loading };
}

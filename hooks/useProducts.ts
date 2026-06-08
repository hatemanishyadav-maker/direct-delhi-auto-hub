import { useEffect, useRef, useState } from "react";
import { Product } from "@/types";
import { API_BASE } from "@/constants/apiUrl";
import staticProducts, {
  getFeaturedProducts,
  getNewProducts,
  getBestsellerProducts,
  getProductsByCategory,
  getProductById as getStaticById,
} from "@/data/products";

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
  const res = await fetch(`${API_BASE}/products${qs}`);
  if (!res.ok) throw new Error("API error");
  const data = await res.json();
  return Array.isArray(data) ? data.map(apiToProduct) : [];
}

export function useAllProducts(search?: string, filter?: string) {
  const fallback = filter === "featured"
    ? (getFeaturedProducts() as unknown as Product[])
    : filter === "new"
    ? (getNewProducts() as unknown as Product[])
    : filter === "bestseller"
    ? (getBestsellerProducts() as unknown as Product[])
    : (staticProducts as unknown as Product[]);

  const [products, setProducts] = useState<Product[]>(search ? [] : fallback);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search?.trim()) params.q = search.trim();
    if (filter === "featured") params.featured = "true";
    else if (filter === "new") params.isNew = "true";
    else if (filter === "bestseller") params.isBestseller = "true";

    setLoading(true);
    fetchProducts(params)
      .then((data) => {
        if (mounted.current) setProducts(data.length > 0 ? data : fallback);
      })
      .catch(() => {
        if (mounted.current) setProducts(fallback);
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });
  }, [search, filter]);

  return { products, loading };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>(getFeaturedProducts() as unknown as Product[]);
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
  const [products, setProducts] = useState<Product[]>(getNewProducts() as unknown as Product[]);
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
  const [products, setProducts] = useState<Product[]>(getBestsellerProducts() as unknown as Product[]);
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
  const [products, setProducts] = useState<Product[]>(getProductsByCategory(categoryId) as unknown as Product[]);
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
  const [product, setProduct] = useState<Product | null>(getStaticById(id) as unknown as Product | null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    fetch(`${API_BASE}/products/${id}`)
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

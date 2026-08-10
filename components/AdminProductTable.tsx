"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";

export default function AdminProductTable({ initialProducts }: { initialProducts: Product[] }) {
  const [items, setItems] = useState(initialProducts);
  const [notice, setNotice] = useState("");

  function updateLocal(id: string, field: keyof Product, value: unknown) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  async function save(product: Product) {
    setNotice(`Saving ${product.code}…`);
    const response = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice ?? null,
        stock: Number(product.stock),
        featured: Boolean(product.featured),
        badge: product.badge || null,
        highlights: product.highlights || [],
      }),
    });
    const body = await response.json().catch(() => ({}));
    setNotice(response.ok ? `${product.code} saved. Relevant wishlist alerts were checked automatically.` : body.error || "Save failed.");
  }

  return (
    <div className="admin-table-wrap v10-admin-product-wrap">
      {notice && <p className="admin-notice">{notice}</p>}
      <table className="admin-table v10-admin-table">
        <thead><tr><th>Product</th><th>Price</th><th>Was</th><th>Stock</th><th>Badge</th><th>Featured</th><th /></tr></thead>
        <tbody>{items.map((product) => (
          <tr key={product.id}>
            <td><strong>{product.name}</strong><small>{product.code} · {product.strength}</small></td>
            <td><input type="number" step="0.01" value={product.price} onChange={(e) => updateLocal(product.id, "price", Number(e.target.value))} /></td>
            <td><input type="number" step="0.01" value={product.compareAtPrice ?? ""} placeholder="—" onChange={(e) => updateLocal(product.id, "compareAtPrice", e.target.value === "" ? undefined : Number(e.target.value))} /></td>
            <td><input type="number" value={product.stock} onChange={(e) => updateLocal(product.id, "stock", Number(e.target.value))} /></td>
            <td><input value={product.badge || ""} placeholder="SPECIAL OFFER" onChange={(e) => updateLocal(product.id, "badge", e.target.value)} /></td>
            <td><input type="checkbox" checked={Boolean(product.featured)} onChange={(e) => updateLocal(product.id, "featured", e.target.checked)} /></td>
            <td><button className="mini-button" onClick={() => void save(product)}>Save</button></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

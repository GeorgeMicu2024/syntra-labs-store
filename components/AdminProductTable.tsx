"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";

export default function AdminProductTable({ initialProducts }: { initialProducts: Product[] }) {
  const [items, setItems] = useState(initialProducts);
  const [notice, setNotice] = useState("");

  function updateLocal(id: string, field: "price" | "stock" | "featured", value: number | boolean) {
    setItems(current => current.map(item => item.id === id ? { ...item, [field]: value } : item));
  }

  async function save(product: Product) {
    setNotice(`Saving ${product.code}…`);
    const response = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    const body = await response.json().catch(() => ({}));
    setNotice(response.ok ? `${product.code} saved.` : body.error || "Save failed.");
  }

  return (
    <div className="admin-table-wrap">
      {notice && <p className="admin-notice">{notice}</p>}
      <table className="admin-table">
        <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Featured</th><th /></tr></thead>
        <tbody>{items.map(product => (
          <tr key={product.id}>
            <td><strong>{product.name}</strong><small>{product.code} · {product.strength}</small></td>
            <td><input type="number" step="0.01" value={product.price} onChange={e => updateLocal(product.id, "price", Number(e.target.value))} /></td>
            <td><input type="number" value={product.stock} onChange={e => updateLocal(product.id, "stock", Number(e.target.value))} /></td>
            <td><input type="checkbox" checked={product.featured} onChange={e => updateLocal(product.id, "featured", e.target.checked)} /></td>
            <td><button className="mini-button" onClick={() => save(product)}>Save</button></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

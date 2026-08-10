"use client";

import { useMemo, useState } from "react";

type Order = {
  id: string;
  customer_email: string | null;
  amount_total: number | null;
  discount_percent: number | null;
  status: string | null;
  dispatch_window: string | null;
  created_at: string;
};

export default function AdminOrderManager({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ status: "processing", detail: "", trackingNumber: "", trackingUrl: "" });
  const [notice, setNotice] = useState("");
  const totals = useMemo(() => orders.reduce((sum, order) => sum + Number(order.amount_total || 0), 0) / 100, [orders]);

  async function save(orderId: string) {
    setNotice("Saving order update…");
    const response = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, ...form }) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return setNotice(body.error || "Update failed.");
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status: form.status } : order));
    setEditing(null);
    setNotice("Order status, customer notification and timeline updated.");
  }

  return <div className="v10-admin-orders">
    <div className="v10-admin-summary"><span><small>ORDERS SHOWN</small><strong>{orders.length}</strong></span><span><small>VALUE SHOWN</small><strong>£{totals.toFixed(2)}</strong></span></div>
    {notice && <div className="admin-notice">{notice}</div>}
    <div className="v10-admin-order-list">{orders.map((order) => <article key={order.id}>
      <div className="v10-admin-order-row"><span><small>ORDER</small><strong>SL-{order.id.slice(0,8).toUpperCase()}</strong><p>{new Date(order.created_at).toLocaleString("en-GB")}</p></span><span><small>CUSTOMER</small><strong>{order.customer_email || "Guest"}</strong><p>{order.dispatch_window || "—"}</p></span><span><small>TOTAL</small><strong>£{(Number(order.amount_total || 0)/100).toFixed(2)}</strong><p>{order.discount_percent || 0}% discount</p></span><span><small>STATUS</small><strong className={`v10-status ${order.status || "paid"}`}>{order.status || "paid"}</strong></span><button type="button" onClick={() => { setEditing(editing === order.id ? null : order.id); setForm({ status: order.status === "paid" ? "processing" : order.status || "processing", detail: "", trackingNumber: "", trackingUrl: "" }); }}>{editing === order.id ? "Close" : "Update"}</button></div>
      {editing === order.id && <div className="v10-admin-order-editor"><label>Status<select value={form.status} onChange={(e) => setForm((v) => ({ ...v, status: e.target.value }))}><option value="processing">Processing</option><option value="dispatched">Dispatched</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option><option value="refunded">Refunded</option></select></label><label>Customer-facing note<input value={form.detail} onChange={(e) => setForm((v) => ({ ...v, detail: e.target.value }))} placeholder="Optional status detail" /></label><label>Tracking number<input value={form.trackingNumber} onChange={(e) => setForm((v) => ({ ...v, trackingNumber: e.target.value }))} placeholder="Optional" /></label><label>Tracking URL<input value={form.trackingUrl} onChange={(e) => setForm((v) => ({ ...v, trackingUrl: e.target.value }))} placeholder="https://…" /></label><button type="button" onClick={() => void save(order.id)}>Publish update</button></div>}
    </article>)}</div>
  </div>;
}

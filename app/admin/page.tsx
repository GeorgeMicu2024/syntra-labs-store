import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import { getProducts } from "@/lib/supabase-rest";
import { getAdminSupabase } from "@/lib/supabase/server-auth";
import AdminNav from "@/components/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const store = await cookies();
  if (!verifyAdminToken(store.get(COOKIE_NAME)?.value)) redirect("/admin/login");

  const products = await getProducts();
  const admin = getAdminSupabase();
  let orders: any[] = [];
  let rewards: any[] = [];
  let customerCount = 0;
  if (admin) {
    const [orderResult, rewardResult, customerResult] = await Promise.all([
      admin.from("orders").select("id,amount_total,status,customer_email,created_at").order("created_at", { ascending: false }).limit(100),
      admin.from("customer_rewards").select("user_id,paid_order_count,lifetime_spend_pence,tier,store_credit_pence"),
      admin.from("profiles").select("id", { count: "exact", head: true }),
    ]);
    orders = orderResult.data || [];
    rewards = rewardResult.data || [];
    customerCount = customerResult.count || 0;
  }

  const paidOrders = orders.filter((order) => ["paid", "processing", "dispatched", "delivered"].includes(order.status || ""));
  const revenue = paidOrders.reduce((sum, order) => sum + Number(order.amount_total || 0), 0) / 100;
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayOrders = paidOrders.filter((order) => String(order.created_at || "").slice(0, 10) === todayKey);
  const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.amount_total || 0), 0) / 100;
  const inventoryValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);
  const lowStock = products.filter((product) => product.stock < 10).sort((a, b) => a.stock - b.stock);
  const creditLiability = rewards.reduce((sum, row) => sum + Number(row.store_credit_pence || 0), 0) / 100;

  return <main className="admin-page v10-admin-page">
    <div className="admin-heading"><div><p className="eyebrow">OPERATIONS COMMAND CENTRE</p><h1>Syntra dashboard</h1><p>Commerce, inventory and customer operations in one protected workspace.</p></div><form action="/api/admin/logout" method="post"><button className="mini-button">Log out</button></form></div>
    <AdminNav />
    <section className="v10-admin-metric-grid">
      <article><span>TODAY REVENUE</span><strong>£{todayRevenue.toFixed(2)}</strong><small>{todayOrders.length} paid order{todayOrders.length === 1 ? "" : "s"}</small></article>
      <article><span>RECORDED REVENUE</span><strong>£{revenue.toFixed(2)}</strong><small>Latest {orders.length} orders loaded</small></article>
      <article><span>CUSTOMERS</span><strong>{customerCount}</strong><small>Supabase Auth profiles</small></article>
      <article><span>INVENTORY VALUE</span><strong>£{inventoryValue.toLocaleString("en-GB", { maximumFractionDigits: 0 })}</strong><small>{products.reduce((sum, product) => sum + product.stock, 0)} units</small></article>
      <article><span>LOW STOCK</span><strong>{lowStock.length}</strong><small>Below 10 units</small></article>
      <article><span>ACCOUNT CREDIT</span><strong>£{creditLiability.toFixed(2)}</strong><small>Recorded customer liability</small></article>
    </section>

    <section className="v10-admin-grid-two">
      <article className="v10-admin-panel"><div className="v10-admin-panel-head"><div><small>FULFILMENT</small><h2>Recent orders</h2></div><Link href="/admin/orders">Manage orders →</Link></div><div className="v10-admin-recent">{orders.slice(0, 6).map((order) => <div key={order.id}><span><strong>SL-{order.id.slice(0, 8).toUpperCase()}</strong><small>{order.customer_email || "Guest checkout"}</small></span><span><b className={`v10-status ${order.status || "paid"}`}>{order.status || "paid"}</b><strong>£{(Number(order.amount_total || 0) / 100).toFixed(2)}</strong></span></div>)}</div></article>
      <article className="v10-admin-panel"><div className="v10-admin-panel-head"><div><small>INVENTORY</small><h2>Low-stock watch</h2></div><Link href="/admin/products">Manage products →</Link></div>{lowStock.length === 0 ? <p className="v10-admin-empty">No products are currently below the low-stock threshold.</p> : <div className="v10-admin-low-stock">{lowStock.slice(0, 8).map((product) => <div key={product.id}><span><strong>{product.name}</strong><small>{product.code} · {product.strength}</small></span><b>{product.stock} left</b></div>)}</div>}</article>
    </section>
  </main>;
}

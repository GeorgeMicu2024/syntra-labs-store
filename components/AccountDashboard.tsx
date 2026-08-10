"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useWishlist } from "./WishlistProvider";
import { useCart } from "./CartProvider";
import type { Product } from "@/lib/products";
import { displayProductName } from "@/lib/display";
import SecurityMFA from "./SecurityMFA";

type Address = {
  id: string;
  label: string;
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  county: string | null;
  postcode: string;
  country: string;
  phone: string | null;
  is_default: boolean;
};

type Order = {
  id: string;
  stripe_session_id: string | null;
  amount_total: number | null;
  subtotal_amount: number | null;
  discount_amount: number | null;
  discount_percent: number | null;
  discount_type: string | null;
  credit_amount: number | null;
  dispatch_window: string | null;
  currency: string | null;
  status: string | null;
  created_at: string;
};

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

type OrderEvent = {
  id: string;
  status: string;
  title: string;
  detail: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
};

type CreditEntry = {
  id: string;
  amount_pence: number;
  reason: string;
  reference: string | null;
  created_at: string;
};

type Tab = "overview" | "orders" | "addresses" | "wishlist" | "rewards" | "notifications" | "security";

const blankAddress = {
  label: "Primary",
  full_name: "",
  line1: "",
  line2: "",
  city: "",
  county: "",
  postcode: "",
  phone: "",
  is_default: true,
};

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "⌂" },
  { key: "orders", label: "Orders", icon: "▤" },
  { key: "addresses", label: "Addresses", icon: "⌖" },
  { key: "wishlist", label: "Saved products", icon: "♡" },
  { key: "rewards", label: "Rewards", icon: "◇" },
  { key: "notifications", label: "Notifications", icon: "◉" },
  { key: "security", label: "Security", icon: "⌁" },
];

function money(pence: number | null | undefined) {
  return `£${(Number(pence || 0) / 100).toFixed(2)}`;
}

function orderRef(order: Order) {
  return `SL-${order.id.slice(0, 8).toUpperCase()}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AccountDashboard() {
  const { configured, loading, user, profile, rewards, discountPercent, discountLabel, refreshCustomer, signOut } = useAuth();
  const { entries: wishlist, setAlert, toggle: toggleWishlist } = useWishlist();
  const { addMany } = useCart();
  const [tab, setTab] = useState<Tab>("overview");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [creditLedger, setCreditLedger] = useState<CreditEntry[]>([]);
  const [catalogue, setCatalogue] = useState<Product[]>([]);
  const [profileForm, setProfileForm] = useState({ first_name: "", last_name: "", phone: "", marketing_opt_in: false });
  const [addressForm, setAddressForm] = useState(blankAddress);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderEvents, setOrderEvents] = useState<Record<string, OrderEvent[]>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("tab") as Tab | null;
    if (raw && tabs.some((item) => item.key === raw)) setTab(raw);
  }, []);

  useEffect(() => {
    setProfileForm({
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      phone: profile?.phone || "",
      marketing_opt_in: Boolean(profile?.marketing_opt_in),
    });
  }, [profile]);

  async function loadPrivateData() {
    const supabase = getBrowserSupabase();
    if (!supabase || !user) return;

    const [addressResult, orderResult, notificationResult, creditResult, catalogueResponse] = await Promise.all([
      supabase.from("addresses").select("*").order("is_default", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("orders").select("id,stripe_session_id,amount_total,subtotal_amount,discount_amount,discount_percent,discount_type,credit_amount,dispatch_window,currency,status,created_at").order("created_at", { ascending: false }).limit(40),
      supabase.from("notifications").select("id,type,title,body,href,read_at,created_at").order("created_at", { ascending: false }).limit(50),
      supabase.from("credit_ledger").select("id,amount_pence,reason,reference,created_at").order("created_at", { ascending: false }).limit(30),
      fetch("/api/catalogue", { cache: "no-store" }).then((response) => response.ok ? response.json() : []),
    ]);

    setAddresses((addressResult.data as Address[] | null) || []);
    setOrders((orderResult.data as Order[] | null) || []);
    setNotifications((notificationResult.data as Notification[] | null) || []);
    setCreditLedger((creditResult.data as CreditEntry[] | null) || []);
    setCatalogue((catalogueResponse as Product[]) || []);
  }

  useEffect(() => {
    if (user) void loadPrivateData();
  }, [user]);

  const totalSaved = useMemo(() => orders.reduce((sum, order) => sum + Number(order.discount_amount || 0), 0), [orders]);
  const unread = notifications.filter((item) => !item.read_at).length;
  const savedProducts = wishlist.map((entry) => ({ entry, product: catalogue.find((product) => product.id === entry.product_id) })).filter((item): item is { entry: typeof wishlist[number]; product: Product } => Boolean(item.product));
  const firstName = profile?.first_name || user?.email?.split("@")[0] || "Member";

  function changeTab(next: Tab) {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState({}, "", url.toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase || !user) return;
    setBusy(true); setNotice("");
    const { error } = await supabase.from("profiles").update({ ...profileForm, updated_at: new Date().toISOString() }).eq("id", user.id);
    setBusy(false);
    if (error) return setNotice(error.message);
    await refreshCustomer();
    setNotice("Profile updated securely.");
  }

  function editAddress(address: Address) {
    setEditingAddress(address.id);
    setAddressForm({ label: address.label, full_name: address.full_name, line1: address.line1, line2: address.line2 || "", city: address.city, county: address.county || "", postcode: address.postcode, phone: address.phone || "", is_default: address.is_default });
  }

  function resetAddress() { setEditingAddress(null); setAddressForm(blankAddress); }

  async function saveAddress(event: React.FormEvent) {
    event.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase || !user) return;
    setBusy(true); setNotice("");
    if (addressForm.is_default) await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    const payload = { user_id: user.id, label: addressForm.label.trim() || "Address", full_name: addressForm.full_name.trim(), line1: addressForm.line1.trim(), line2: addressForm.line2.trim() || null, city: addressForm.city.trim(), county: addressForm.county.trim() || null, postcode: addressForm.postcode.trim().toUpperCase(), country: "GB", phone: addressForm.phone.trim() || null, is_default: addressForm.is_default, updated_at: new Date().toISOString() };
    const result = editingAddress ? await supabase.from("addresses").update(payload).eq("id", editingAddress) : await supabase.from("addresses").insert(payload);
    setBusy(false);
    if (result.error) return setNotice(result.error.message);
    resetAddress(); await loadPrivateData(); setNotice("Address saved securely.");
  }

  async function removeAddress(id: string) {
    if (!window.confirm("Remove this saved address?")) return;
    const supabase = getBrowserSupabase(); if (!supabase) return;
    await supabase.from("addresses").delete().eq("id", id); await loadPrivateData();
  }

  async function expandOrder(orderId: string) {
    if (expandedOrder === orderId) return setExpandedOrder(null);
    setExpandedOrder(orderId);
    if (orderEvents[orderId]) return;
    const supabase = getBrowserSupabase(); if (!supabase) return;
    const { data } = await supabase.from("order_events").select("id,status,title,detail,tracking_number,tracking_url,created_at").eq("order_id", orderId).order("created_at", { ascending: true });
    setOrderEvents((current) => ({ ...current, [orderId]: (data as OrderEvent[] | null) || [] }));
  }

  async function reorder(orderId: string) {
    const supabase = getBrowserSupabase(); if (!supabase) return;
    const { data } = await supabase.from("order_items").select("product_id,quantity").eq("order_id", orderId);
    const rows = (data || []) as { product_id: string; quantity: number }[];
    const incoming = rows.map((row) => ({ product: catalogue.find((product) => product.id === row.product_id), quantity: row.quantity })).filter((item): item is { product: Product; quantity: number } => Boolean(item.product && item.product.stock > 0));
    if (!incoming.length) {
      window.dispatchEvent(new CustomEvent("syntra:toast", { detail: "No currently available items from this order could be added." }));
      return;
    }
    addMany(incoming);
    window.dispatchEvent(new CustomEvent("syntra:toast", { detail: `${incoming.length} order line${incoming.length === 1 ? "" : "s"} added to your basket.` }));
    window.dispatchEvent(new CustomEvent("syntra:open-cart"));
  }

  async function markRead(id?: string) {
    const supabase = getBrowserSupabase(); if (!supabase || !user) return;
    const now = new Date().toISOString();
    let query = supabase.from("notifications").update({ read_at: now }).eq("user_id", user.id);
    if (id) query = query.eq("id", id); else query = query.is("read_at", null);
    await query;
    setNotifications((current) => current.map((item) => (!id || item.id === id) ? { ...item, read_at: item.read_at || now } : item));
  }

  function copyReferral() {
    const code = rewards?.referral_code;
    if (!code) return;
    const link = `${window.location.origin}/account/register?ref=${encodeURIComponent(code)}`;
    void navigator.clipboard.writeText(link);
    window.dispatchEvent(new CustomEvent("syntra:toast", { detail: "Referral link copied." }));
  }

  function clearLocalActivity() {
    ["syntra-recent-v8", "syntra-cart", "syntra-wishlist-v10"].forEach((key) => localStorage.removeItem(key));
    window.dispatchEvent(new CustomEvent("syntra:toast", { detail: "Local browsing and basket data cleared from this device." }));
  }

  if (!configured) return <section className="account-setup-state"><span className="kicker">CUSTOMER PLATFORM</span><h1>Account services need one final configuration step.</h1><p>Add the Supabase browser key and run the included V9 and V10 database migrations.</p></section>;
  if (loading) return <section className="account-loading"><span className="account-loader" /><p>Loading secure customer account…</p></section>;

  if (!user) {
    return <section className="account-guest-hero"><div><span className="kicker">SYNTRA MEMBER ACCESS</span><h1>One account.<br /><em>A complete customer workspace.</em></h1><p>Save delivery details, keep products, track orders and restore your basket across signed-in devices.</p><div className="account-guest-actions"><Link href="/account/register" className="button-primary">Create account · save 20% <span>→</span></Link><Link href="/account/sign-in" className="button-secondary">Sign in</Link></div></div><aside className="account-benefit-stack"><div><span>FIRST PAID ORDER</span><strong>20% OFF</strong></div><div><span>RETURNING ORDERS</span><strong>10% OFF</strong></div><div><span>SAVED PRODUCTS</span><strong>SYNCED</strong></div><div><span>UK SHIPPING</span><strong>FREE</strong></div></aside></section>;
  }

  return (
    <div className="v10-account-shell">
      <aside className="v10-account-sidebar">
        <div className="v10-account-identity"><span>{firstName.slice(0, 1).toUpperCase()}</span><div><small>SYNTRA MEMBER</small><strong>{firstName}</strong><p>{rewards?.tier || "Research Member"}</p></div></div>
        <nav>{tabs.map((item) => <button key={item.key} type="button" className={tab === item.key ? "active" : ""} onClick={() => changeTab(item.key)}><i>{item.icon}</i><span>{item.label}</span>{item.key === "notifications" && unread > 0 && <b>{unread}</b>}{item.key === "wishlist" && wishlist.length > 0 && <b>{wishlist.length}</b>}</button>)}</nav>
        <div className="v10-sidebar-foot"><small>MEMBER PRICING</small><strong>{discountPercent}% active</strong><p>{discountLabel}</p><button type="button" onClick={() => void signOut()}>Sign out</button></div>
      </aside>

      <div className="v10-account-main">
        <header className="v10-account-head"><div><span className="kicker">MY SYNTRA</span><h1>{tab === "overview" ? `Welcome back, ${firstName}.` : tabs.find((item) => item.key === tab)?.label}</h1><p>{tab === "overview" ? "Your orders, saved catalogue, rewards and account settings in one secure workspace." : "Manage this part of your customer account."}</p></div><div className="v10-tier-badge"><small>MEMBER TIER</small><strong>{rewards?.tier || "Research Member"}</strong></div></header>
        {notice && <div className="account-notice">{notice}</div>}

        {tab === "overview" && <>
          <section className="v10-stat-grid">
            <article><small>MEMBER PRICING</small><strong>{discountPercent}%</strong><span>{(rewards?.paid_order_count || 0) ? "Returning benefit" : "Welcome benefit"}</span></article>
            <article><small>PAID ORDERS</small><strong>{rewards?.paid_order_count || 0}</strong><span>{money(rewards?.lifetime_spend_pence)} lifetime spend</span></article>
            <article><small>SAVED PRODUCTS</small><strong>{wishlist.length}</strong><span>Synced with your account</span></article>
            <article><small>SYNTRA CREDIT</small><strong>{money(rewards?.store_credit_pence)}</strong><span>{rewards?.reward_points || 0} reward points</span></article>
          </section>
          <section className="v10-overview-grid">
            <article className="v10-dashboard-card v10-next-order"><div className="v10-card-heading"><div><small>MEMBERSHIP</small><h2>Your current benefits</h2></div><button type="button" onClick={() => changeTab("rewards")}>View rewards</button></div><div className="v10-benefit-rows"><div><span>Signed-in pricing</span><strong>{discountPercent}% OFF</strong></div><div><span>UK shipping</span><strong>FREE</strong></div><div><span>Weekday dispatch cutoff</span><strong>12:00</strong></div><div><span>Saved basket</span><strong>ACTIVE</strong></div></div></article>
            <article className="v10-dashboard-card"><div className="v10-card-heading"><div><small>RECENT ORDERS</small><h2>Latest activity</h2></div><button type="button" onClick={() => changeTab("orders")}>All orders</button></div>{orders.length === 0 ? <div className="v10-empty-state"><strong>No paid orders yet.</strong><p>Your completed orders will appear here automatically.</p><Link href="/shop">Explore catalogue →</Link></div> : <div className="v10-recent-orders">{orders.slice(0, 3).map((order) => <div key={order.id}><span><b>{orderRef(order)}</b><small>{formatDate(order.created_at)}</small></span><span><b>{order.status || "paid"}</b><strong>{money(order.amount_total)}</strong></span></div>)}</div>}</article>
          </section>
          {savedProducts.length > 0 && <section className="v10-dashboard-card"><div className="v10-card-heading"><div><small>YOUR CATALOGUE</small><h2>Saved products</h2></div><button type="button" onClick={() => changeTab("wishlist")}>Manage saved products</button></div><div className="v10-saved-strip">{savedProducts.slice(0, 4).map(({ product }) => <Link href={`/product/${product.slug}`} key={product.id}><Image src={product.image} width={110} height={110} alt="" /><span><strong>{displayProductName(product.name)}</strong><small>{product.strength}</small></span><b>£{product.price.toFixed(2)}</b></Link>)}</div></section>}
        </>}

        {tab === "orders" && <section className="v10-dashboard-card"><div className="v10-card-heading"><div><small>ORDER HISTORY</small><h2>Orders & tracking</h2></div><span>{orders.length} recorded</span></div>{orders.length === 0 ? <div className="v10-empty-state"><strong>No orders recorded yet.</strong><p>Paid orders are linked to your account by the verified Stripe webhook.</p></div> : <div className="v10-order-list">{orders.map((order) => <article key={order.id} className={`v10-order-card ${expandedOrder === order.id ? "open" : ""}`}><button type="button" className="v10-order-summary" onClick={() => void expandOrder(order.id)}><span><small>ORDER</small><strong>{orderRef(order)}</strong><p>{formatDate(order.created_at)}</p></span><span><small>STATUS</small><strong className={`v10-status ${order.status || "paid"}`}>{(order.status || "paid").replaceAll("_", " ")}</strong><p>{order.dispatch_window || "Processing"}</p></span><span><small>TOTAL</small><strong>{money(order.amount_total)}</strong><p>{order.discount_percent || 0}% member saving</p></span><b>{expandedOrder === order.id ? "−" : "+"}</b></button>{expandedOrder === order.id && <div className="v10-order-detail"><div className="v10-order-actions"><button type="button" onClick={() => void reorder(order.id)}>Reorder available items</button><span>You saved {money(Number(order.discount_amount || 0) + Number(order.credit_amount || 0))} including member pricing and account credit.</span></div><div className="v10-order-timeline">{(orderEvents[order.id] || []).length === 0 ? <div className="v10-timeline-loading">No tracking events have been added yet.</div> : (orderEvents[order.id] || []).map((event, index) => <div key={event.id} className="v10-timeline-event"><i className={index === (orderEvents[order.id] || []).length - 1 ? "latest" : ""} /><div><span><strong>{event.title}</strong><small>{new Date(event.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</small></span>{event.detail && <p>{event.detail}</p>}{event.tracking_number && <div className="v10-tracking-line"><b>Tracking: {event.tracking_number}</b>{event.tracking_url && <a href={event.tracking_url} target="_blank" rel="noreferrer">Open carrier tracking ↗</a>}</div>}</div></div>)}</div></div>}</article>)}</div>}</section>}

        {tab === "addresses" && <section className="v10-address-layout"><article className="v10-dashboard-card"><div className="v10-card-heading"><div><small>SAVED DELIVERY DETAILS</small><h2>Your addresses</h2></div><span>{addresses.length} saved</span></div><div className="v10-address-list">{addresses.length === 0 && <div className="v10-empty-state"><strong>No saved address yet.</strong><p>Add a UK delivery address for faster returning checkout.</p></div>}{addresses.map((address) => <div key={address.id} className="v10-address-card"><div><span>{address.label}{address.is_default && <b>DEFAULT</b>}</span><strong>{address.full_name}</strong><p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />{address.city}{address.county ? `, ${address.county}` : ""}<br />{address.postcode}</p></div><div><button type="button" onClick={() => editAddress(address)}>Edit</button><button type="button" onClick={() => void removeAddress(address.id)}>Remove</button></div></div>)}</div></article><article className="v10-dashboard-card"><div className="v10-card-heading"><div><small>{editingAddress ? "EDIT ADDRESS" : "NEW ADDRESS"}</small><h2>{editingAddress ? "Update delivery details" : "Add delivery address"}</h2></div>{editingAddress && <button type="button" onClick={resetAddress}>Cancel</button>}</div><form className="account-form" onSubmit={saveAddress}><label>Address label<input required value={addressForm.label} onChange={(e) => setAddressForm((v) => ({ ...v, label: e.target.value }))} /></label><label>Full name<input required autoComplete="name" value={addressForm.full_name} onChange={(e) => setAddressForm((v) => ({ ...v, full_name: e.target.value }))} /></label><label>Address line 1<input required autoComplete="address-line1" value={addressForm.line1} onChange={(e) => setAddressForm((v) => ({ ...v, line1: e.target.value }))} /></label><label>Address line 2<input autoComplete="address-line2" value={addressForm.line2} onChange={(e) => setAddressForm((v) => ({ ...v, line2: e.target.value }))} /></label><div className="auth-two-col"><label>City<input required autoComplete="address-level2" value={addressForm.city} onChange={(e) => setAddressForm((v) => ({ ...v, city: e.target.value }))} /></label><label>County<input autoComplete="address-level1" value={addressForm.county} onChange={(e) => setAddressForm((v) => ({ ...v, county: e.target.value }))} /></label></div><div className="auth-two-col"><label>Postcode<input required autoComplete="postal-code" value={addressForm.postcode} onChange={(e) => setAddressForm((v) => ({ ...v, postcode: e.target.value }))} /></label><label>Phone<input autoComplete="tel" value={addressForm.phone} onChange={(e) => setAddressForm((v) => ({ ...v, phone: e.target.value }))} /></label></div><label className="auth-consent"><input type="checkbox" checked={addressForm.is_default} onChange={(e) => setAddressForm((v) => ({ ...v, is_default: e.target.checked }))} /><span>Use as my default delivery address.</span></label><button type="submit" disabled={busy}>{busy ? "Saving…" : editingAddress ? "Update address" : "Save address"}</button></form></article></section>}

        {tab === "wishlist" && <section className="v10-dashboard-card"><div className="v10-card-heading"><div><small>SAVED PRODUCTS</small><h2>Wishlist & catalogue alerts</h2></div><span>{savedProducts.length} products</span></div>{savedProducts.length === 0 ? <div className="v10-empty-state"><strong>Your wishlist is empty.</strong><p>Use the heart on any product card to save it here.</p><Link href="/shop">Browse catalogue →</Link></div> : <div className="v10-wishlist-grid">{savedProducts.map(({ product, entry }) => <article key={product.id}><Link href={`/product/${product.slug}`} className="v10-wishlist-product"><Image src={product.image} width={170} height={170} alt="" /><div><small>{product.category} · {product.code}</small><strong>{displayProductName(product.name)}</strong><span>{product.strength}</span><b>£{product.price.toFixed(2)}</b></div></Link><div className="v10-alert-controls"><label><input type="checkbox" checked={entry.notify_restock} onChange={(e) => void setAlert(product.id, "notify_restock", e.target.checked)} /><span>Back-in-stock alert</span></label><label><input type="checkbox" checked={entry.notify_price_drop} onChange={(e) => void setAlert(product.id, "notify_price_drop", e.target.checked)} /><span>Price-drop alert</span></label></div><button type="button" className="v10-remove-saved" onClick={() => void toggleWishlist(product)}>Remove saved product</button></article>)}</div>}</section>}

        {tab === "rewards" && <div className="v10-rewards-layout"><section className="v10-reward-hero"><small>SYNTRA MEMBER STATUS</small><h2>{rewards?.tier || "Research Member"}</h2><p>Your tier is based on completed paid orders and recorded account spend.</p><div><span><small>REWARD POINTS</small><strong>{rewards?.reward_points || 0}</strong></span><span><small>STORE CREDIT</small><strong>{money(rewards?.store_credit_pence)}</strong></span><span><small>LIFETIME SPEND</small><strong>{money(rewards?.lifetime_spend_pence)}</strong></span></div></section><section className="v10-dashboard-card"><div className="v10-card-heading"><div><small>REFERRAL PROGRAMME</small><h2>Give 10% · earn £10 credit</h2></div></div><p className="v10-body-copy">Share your personal invitation link. When a referred member completes their first paid order, £10 account credit is recorded to your rewards balance. Their first-order member benefit remains separate.</p><div className="v10-referral-box"><span><small>YOUR REFERRAL CODE</small><strong>{rewards?.referral_code || "Generating…"}</strong></span><button type="button" onClick={copyReferral}>Copy invite link</button></div><small className="v10-terms-note">Referral rewards are applied after a verified paid order and may be reviewed for abuse or duplicate-account activity.</small></section><section className="v10-dashboard-card"><div className="v10-card-heading"><div><small>CREDIT LEDGER</small><h2>Account credit history</h2></div></div>{creditLedger.length === 0 ? <div className="v10-empty-state"><strong>No credit activity yet.</strong><p>Referral or support credits will appear here transparently.</p></div> : <div className="v10-credit-ledger">{creditLedger.map((entry) => <div key={entry.id}><span><strong>{entry.reason}</strong><small>{formatDate(entry.created_at)}</small></span><b className={entry.amount_pence >= 0 ? "positive" : "negative"}>{entry.amount_pence >= 0 ? "+" : ""}{money(entry.amount_pence)}</b></div>)}</div>}</section></div>}

        {tab === "notifications" && <section className="v10-dashboard-card"><div className="v10-card-heading"><div><small>NOTIFICATION CENTRE</small><h2>Account activity</h2></div>{unread > 0 && <button type="button" onClick={() => void markRead()}>Mark all read</button>}</div>{notifications.length === 0 ? <div className="v10-empty-state"><strong>No notifications yet.</strong><p>Order, wishlist and reward activity will appear here.</p></div> : <div className="v10-notification-centre">{notifications.map((item) => <button key={item.id} type="button" className={!item.read_at ? "unread" : ""} onClick={() => void markRead(item.id)}><i /><span><small>{item.type.toUpperCase()} · {formatDate(item.created_at)}</small><strong>{item.title}</strong><p>{item.body}</p></span>{!item.read_at && <b>NEW</b>}</button>)}</div>}</section>}

        {tab === "security" && <div className="v10-security-grid"><section className="v10-dashboard-card"><div className="v10-card-heading"><div><small>PROFILE</small><h2>Personal details</h2></div><span>{user.email}</span></div><form className="account-form" onSubmit={saveProfile}><div className="auth-two-col"><label>First name<input value={profileForm.first_name} onChange={(e) => setProfileForm((v) => ({ ...v, first_name: e.target.value }))} /></label><label>Last name<input value={profileForm.last_name} onChange={(e) => setProfileForm((v) => ({ ...v, last_name: e.target.value }))} /></label></div><label>Phone<input autoComplete="tel" value={profileForm.phone} onChange={(e) => setProfileForm((v) => ({ ...v, phone: e.target.value }))} /></label><label className="auth-consent"><input type="checkbox" checked={profileForm.marketing_opt_in} onChange={(e) => setProfileForm((v) => ({ ...v, marketing_opt_in: e.target.checked }))} /><span>Receive occasional catalogue, stock and offer updates.</span></label><button type="submit" disabled={busy}>Save profile</button></form></section><section className="v10-dashboard-card"><div className="v10-card-heading"><div><small>ACCOUNT SECURITY</small><h2>Password & local privacy</h2></div></div><div className="v10-security-actions"><Link href="/account/reset-password"><span><strong>Change password</strong><small>Update your current Supabase Auth credential.</small></span><b>→</b></Link><Link href="/account/forgot-password"><span><strong>Recovery email</strong><small>Send a secure reset link to your account email.</small></span><b>→</b></Link><button type="button" onClick={clearLocalActivity}><span><strong>Clear local activity</strong><small>Remove local cart and recently-viewed data from this device.</small></span><b>×</b></button><button type="button" onClick={() => void signOut()}><span><strong>Sign out</strong><small>End the current authenticated session.</small></span><b>→</b></button></div></section><section className="v10-dashboard-card v10-security-mfa-card"><SecurityMFA /></section></div>}
      </div>
    </div>
  );
}

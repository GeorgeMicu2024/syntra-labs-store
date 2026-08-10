import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase/server-auth";
import AdminNav from "@/components/AdminNav";
import AdminOrderManager from "@/components/AdminOrderManager";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const store = await cookies();
  if (!verifyAdminToken(store.get(COOKIE_NAME)?.value)) redirect("/admin/login");
  const admin = getAdminSupabase();
  const { data } = admin ? await admin.from("orders").select("id,customer_email,amount_total,discount_percent,status,dispatch_window,created_at").order("created_at", { ascending: false }).limit(150) : { data: [] } as any;
  return <main className="admin-page v10-admin-page"><p className="eyebrow">FULFILMENT OPERATIONS</p><h1>Orders</h1><p className="lead">Publish order status and optional carrier tracking. Updates create a customer timeline entry, in-app notification and email when Resend is configured.</p><AdminNav /><AdminOrderManager initialOrders={(data || []) as any} /></main>;
}

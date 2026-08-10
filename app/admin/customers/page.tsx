import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase/server-auth";
import AdminNav from "@/components/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const store = await cookies();
  if (!verifyAdminToken(store.get(COOKIE_NAME)?.value)) redirect("/admin/login");
  const admin = getAdminSupabase();
  let rows: any[] = [];
  if (admin) {
    const [{ data: profiles }, { data: rewards }] = await Promise.all([
      admin.from("profiles").select("id,email,first_name,last_name,phone,marketing_opt_in,created_at").order("created_at", { ascending: false }).limit(200),
      admin.from("customer_rewards").select("user_id,paid_order_count,lifetime_spend_pence,reward_points,tier,store_credit_pence,referral_code"),
    ]);
    const rewardMap = new Map((rewards || []).map((reward: any) => [reward.user_id, reward]));
    rows = (profiles || []).map((profile: any) => ({ ...profile, rewards: rewardMap.get(profile.id) || null }));
  }
  return <main className="admin-page v10-admin-page"><p className="eyebrow">CUSTOMER OPERATIONS</p><h1>Customers</h1><p className="lead">Read-only customer overview. Authentication credentials are never exposed to this dashboard.</p><AdminNav /><div className="v10-customer-table-wrap"><table className="v10-customer-table"><thead><tr><th>Customer</th><th>Tier</th><th>Orders</th><th>Lifetime spend</th><th>Points</th><th>Credit</th><th>Marketing</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><strong>{[row.first_name,row.last_name].filter(Boolean).join(" ") || "Unnamed member"}</strong><small>{row.email || "—"}</small></td><td><b>{row.rewards?.tier || "Research Member"}</b></td><td>{row.rewards?.paid_order_count || 0}</td><td>£{(Number(row.rewards?.lifetime_spend_pence || 0)/100).toFixed(2)}</td><td>{row.rewards?.reward_points || 0}</td><td>£{(Number(row.rewards?.store_credit_pence || 0)/100).toFixed(2)}</td><td>{row.marketing_opt_in ? "Opted in" : "No"}</td></tr>)}</tbody></table></div></main>;
}

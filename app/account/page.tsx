import type { Metadata } from "next";
import AccountDashboard from "@/components/AccountDashboard";

export const metadata: Metadata = { title: "My Account" };
export const dynamic = "force-dynamic";

export default function AccountPage() {
  return <AccountDashboard />;
}

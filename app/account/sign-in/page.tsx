import type { Metadata } from "next";
import Link from "next/link";
import SignInForm from "@/components/SignInForm";

export const metadata: Metadata = { title: "Sign In" };

export default function SignInPage() {
  return <section className="auth-page"><div className="auth-page-copy"><span className="kicker">SYNTRA MEMBER ACCESS</span><h1>Welcome back.</h1><p>Sign in to restore saved delivery details, order history and automatic 10% returning-customer pricing after your first paid order.</p><div className="auth-benefit-list"><span>Secure Supabase authentication</span><span>Saved UK addresses</span><span>Automatic member pricing</span><span>Free UK shipping</span></div></div><div className="auth-card"><div className="auth-card-head"><span>SECURE SIGN IN</span><h2>Customer account</h2></div><SignInForm /><p className="auth-card-foot">New to Syntra? <Link href="/account/register">Create an account and unlock 20% off your first paid order.</Link></p></div></section>;
}

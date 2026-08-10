import type { Metadata } from "next";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return <section className="auth-page register-page"><div className="auth-page-copy"><span className="kicker">CREATE SYNTRA ACCOUNT</span><h1>20% welcome pricing.<br /><em>10% when you return.</em></h1><p>Create a secure account for saved addresses, order history and automatic customer pricing. No coupon code is required.</p><div className="register-offer-panel"><div><span>FIRST PAID ORDER</span><strong>20% OFF</strong></div><div><span>FUTURE SIGNED-IN ORDERS</span><strong>10% OFF</strong></div><div><span>UK SHIPPING</span><strong>FREE</strong></div><div><span>DISPATCH CUTOFF</span><strong>12:00</strong></div></div></div><div className="auth-card"><div className="auth-card-head"><span>ACCOUNT REGISTRATION</span><h2>Create your profile</h2></div><RegisterForm /></div></section>;
}

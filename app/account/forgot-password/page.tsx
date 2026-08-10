import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset Password" };

export default function ForgotPasswordPage() {
  return <section className="auth-page compact-auth-page"><div className="auth-page-copy"><span className="kicker">ACCOUNT SECURITY</span><h1>Reset your password.</h1><p>Enter the email linked to your account. Supabase Auth will issue a secure recovery link.</p></div><div className="auth-card"><div className="auth-card-head"><span>PASSWORD RECOVERY</span><h2>Send recovery email</h2></div><ForgotPasswordForm /></div></section>;
}

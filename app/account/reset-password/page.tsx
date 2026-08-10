import type { Metadata } from "next";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata: Metadata = { title: "Set New Password" };

export default function ResetPasswordPage() {
  return <section className="auth-page compact-auth-page"><div className="auth-page-copy"><span className="kicker">SECURE RECOVERY</span><h1>Choose a new password.</h1><p>This page accepts the secure recovery session created by the password-reset email.</p></div><div className="auth-card"><div className="auth-card-head"><span>NEW PASSWORD</span><h2>Update credentials</h2></div><ResetPasswordForm /></div></section>;
}

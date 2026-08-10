import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./v6.css";
import "./v7.css";
import "./v8.css";
import "./v9.css";
import "./v10.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AgeGate from "@/components/AgeGate";
import QuickView from "@/components/QuickView";
import GlobalSearch from "@/components/GlobalSearch";
import ToastHost from "@/components/ToastHost";
import BackToTop from "@/components/BackToTop";
import { CartProvider } from "@/components/CartProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import ShippingStatusBar from "@/components/ShippingStatusBar";
import MembershipOffer from "@/components/MembershipOffer";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "Syntra Labs | Research Catalogue", template: "%s | Syntra Labs" },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: siteConfig.locale, url: siteConfig.url, siteName: siteConfig.name, title: siteConfig.name, description: siteConfig.description },
  twitter: { card: "summary_large_image", title: siteConfig.name, description: siteConfig.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#050914", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <WishlistProvider>
          <CartProvider>
          <AgeGate />
          <Header />
          <ShippingStatusBar />
          <MembershipOffer />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <QuickView />
          <GlobalSearch />
          <ToastHost />
          <BackToTop />
          </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

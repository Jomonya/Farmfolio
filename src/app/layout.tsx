import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FarmFolio: Farm records at your fingertips",
    template: "%s - FarmFolio",
  },
  description:
    "A farm management system for every farmer: keep records, sell in the market, and reach vets and agronomists in one platform.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSession();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <AuthProvider initialUser={user}>
          <CartProvider>
            <Navbar />
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

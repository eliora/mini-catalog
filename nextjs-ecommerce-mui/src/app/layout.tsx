import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import StyledJsxRegistry from "@/lib/registry";
import ThemeProvider from "@/providers/ThemeProvider";
import QueryProvider from "@/providers/QueryProvider";
import AppProviders from "@/providers/AppProviders";
import AppLayout from "@/components/layout/AppLayout";

const heebo = Heebo({
  subsets: ["latin", "hebrew"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "פורטל לקוסמטיקאיות - Mini Catalog",
  description: "מערכת הזמנות מתקדמת לקוסמטיקאיות עם קטלוג מוצרים, מערכת תשלומים ופאנל ניהול",
  keywords: "קוסמטיקה, הזמנות, קטלוג מוצרים, תשלומים",
  authors: [{ name: "Mini Catalog Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={heebo.variable}>
        <StyledJsxRegistry>
          <QueryProvider>
            <ThemeProvider>
              <AppProviders>
                <AppLayout>
                  {children}
                </AppLayout>
              </AppProviders>
            </ThemeProvider>
          </QueryProvider>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}

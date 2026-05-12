import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "الفجر للحج والعمرة - منصة إدارة التسكين",
  description: "نظام إدارة تسكين الحجاج - شركة الفجر للحج والعمرة",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}

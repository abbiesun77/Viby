import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Viby",
  description: "少抽卡，更稳地做出想要的视频。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "devanagari"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sanatan Krishi | सनातन कृषि - Organic Farming & Healthy Living",
  description:
    "Learn organic farming, healthy lifestyle and Sanatan Sanskriti. Join our training program. जैविक खेती, स्वस्थ जीवन और सनातन संस्कृति सीखें।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className="scroll-smooth">
      <body className={`${notoSans.variable} font-sans antialiased bg-zinc-950`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

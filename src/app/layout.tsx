import { Inter, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "みんなの精算",
  description: "家族向け立替・精算（kakeibo-share）",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-dvh bg-[#F8FAFC] font-sans text-slate-900 antialiased selection:bg-indigo-100">
        <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col border-x border-slate-100 bg-white shadow-2xl">
          <main className="flex-1 px-6 pb-10 pt-6">{children}</main>
        </div>
      </body>
    </html>
  );
}

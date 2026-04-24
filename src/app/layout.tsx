import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { LocaleProvider } from "@/contexts/locale-context";
import { ThemeProvider } from "@/components/theme-provider";
import { getLocale, getDictionary } from "@/i18n";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "RBAC System",
  description: "Role-based access control system",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <LocaleProvider locale={locale} dict={dict}>
            {children}
            <Toaster position="top-right" richColors />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Chakra_Petch } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { LocaleProvider } from "@/contexts/locale-context";
import { getLocale, getDictionary } from "@/i18n";

const ChakraPetchSans = Chakra_Petch({
  weight: "400",
  subsets: ["latin"],
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
      className={`${ChakraPetchSans.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LocaleProvider locale={locale} dict={dict}>
          {children}
          <Toaster position="top-right" richColors />
        </LocaleProvider>
      </body>
    </html>
  );
}

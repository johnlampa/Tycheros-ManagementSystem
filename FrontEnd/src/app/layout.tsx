import { ReactNode } from "react";

import "@/styles/globals.css";
import { pattaya, inter, pacifico } from "@/styles/fonts";

import { EdgeStoreProvider } from "../../lib/edgestore";

export const metadata = {
  title: "Tycheros Management System",
  description: "",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${pattaya.variable} ${inter.variable} ${pacifico.variable}`}
    >
      <body className={inter.className}>
        <EdgeStoreProvider>{children}</EdgeStoreProvider>
      </body>
    </html>
  );
}

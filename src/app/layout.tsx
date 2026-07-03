import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeContext";
import { DateProvider } from "@/components/DateContext";
import { SidebarProvider } from "@/components/SidebarContext";

export const metadata: Metadata = {
  title: "ORBYA TECH - Digital Campus SaaS Platform",
  description: "A premium modern college management ERP system supporting multi-role portals and Nepal Bikram Sambat (BS) date conversion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <DateProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </DateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

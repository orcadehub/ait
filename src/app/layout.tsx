import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "react-hot-toast";

const lato = Lato({ 
  subsets: ["latin"], 
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato" 
});

export const metadata: Metadata = {
  title: "All India Trainings (AIT) | Connect Trainers & Vendors",
  description: "The ultimate platform for training vendors to find top trainers across India based on skill requirements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lato.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <WhatsAppFloat />
          <Toaster 
            position="top-right" 
            containerStyle={{ top: 85 }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

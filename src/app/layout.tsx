import Navbar from "@/components/navbar";
import { AuthContextProvider } from "@/context/auth-context";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prabhawatt.vercel.app"),
  title: "PrabhaWatt - Smart Solar Solutions",
  description:
    "Discover PrabhaWatt, where innovative solar technology meets smart savings. Join us in transforming your energy consumption into sustainable savings.",
  openGraph: {
    title: "PrabhaWatt - Smart Solar Solutions",
    description:
      "Illuminate Your Savings with PrabhaWatt: Where Solar Meets Smart.",
    images: ["/preview.png"],
    url: "https://prabhawatt.vercel.app",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthContextProvider>
          <NextTopLoader showSpinner={false} color="#65a30d" />
          <CopilotKit runtimeUrl="/api/copilotkit">
            <Navbar />
            {children}
            <CopilotPopup
              instructions="You are Prabha, an AI-powered solar energy optimization and management platform. It helps you visualize your solar and grid energy data, and give insights on how to maximize your savings. With Prabhawatt, you can easily track your energy consumption, identify areas for improvement, and make informed decisions about your energy usage."
              labels={{
                title: "Prabha",
                initial: "Hello I am Prabha! How can I help you today?",
              }}
            />
          </CopilotKit>
          <Toaster />
        </AuthContextProvider>
      </body>
    </html>
  );
}

import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthContextProvider } from "@/context/auth-context";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
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
  metadataBase: new URL("https://ecowatt.vercel.app"),
  title: "Ecowatt - Smart Solar Solutions",
  description:
    "Discover Ecowatt, where innovative solar technology meets smart savings. Join us in transforming your energy consumption into sustainable savings.",
  openGraph: {
    title: "Ecowatt - Smart Solar Solutions",
    description:
      "Illuminate Your Savings with Ecowatt: Where Solar Meets Smart.",
    images: ["/preview.png"],
    url: "https://ecowatt.vercel.app",
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
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="Ecowatt" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthContextProvider>
            <NextTopLoader showSpinner={false} color="#22c55e" />
            <CopilotKit runtimeUrl="/api/copilotkit">
              <Navbar />
              {children}
              <CopilotPopup
                instructions="You are Ecowatt, an AI-powered solar energy optimization and management platform. It helps you visualize your solar and grid energy data, and give insights on how to maximize your savings. With Ecowatt, you can easily track your energy consumption, identify areas for improvement, and make informed decisions about your energy usage."
                labels={{
                  title: "Ecowatt",
                  initial: "Hello I am Ecowatt! How can I help you today?",
                }}
              />
            </CopilotKit>
            <Toaster position="top-right" />
          </AuthContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, PiggyBank, Smartphone, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white flex flex-col items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Illuminate Your Savings with PrabhaWatt
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                  Your all-in-one solution for optimizing solar energy usage,
                  reducing electricity bills, and contributing to a greener
                  future.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/onboarding">
                  <Button className="bg-green-600 text-white hover:bg-green-700">
                    Get Started
                  </Button>
                </Link>
                <Link href="/learn-more">
                  <Button
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 flex flex-col items-center justify-center">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-gray-900 sm:text-4xl text-center mb-12">
              Key Benefits
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-white shadow-sm">
                <PiggyBank className="h-12 w-12 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Increased Savings
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Optimized energy usage leads to lower electricity bills.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-white shadow-sm">
                <Leaf className="h-12 w-12 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Sustainability
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Efficient use of solar energy reduces carbon footprint.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-white shadow-sm">
                <Smartphone className="h-12 w-12 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  User Convenience
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Automation and notifications simplify energy management.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white flex flex-col items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter text-gray-900 sm:text-4xl">
                  Why Choose PrabhaWatt?
                </h2>
                <p className="max-w-[600px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  PrabhaWatt offers a comprehensive solution for solar energy
                  optimization, helping you maximize efficiency and minimize
                  costs.
                </p>
                <ul className="grid gap-4 mt-8">
                  <li className="flex items-center gap-2 text-gray-600">
                    <Sun className="h-5 w-5 text-green-600" /> Advanced solar
                    tracking algorithms
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <PiggyBank className="h-5 w-5 text-green-600" /> Predictive
                    maintenance to reduce downtime
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <Smartphone className="h-5 w-5 text-green-600" />{" "}
                    User-friendly mobile app for remote monitoring
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  alt="Solar panels"
                  className="aspect-video overflow-hidden rounded-lg object-cover object-center shadow-md"
                  height="310"
                  src="/solar.jpg"
                  width="550"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-900 text-white flex flex-col items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Ready to Optimize Your Solar Energy?
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-400 md:text-xl">
                  Join thousands of satisfied customers who have reduced their
                  energy costs with PrabhaWatt.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input
                    className="max-w-lg flex-1 bg-gray-800 text-white placeholder-gray-400 border-gray-700"
                    placeholder="Enter your email"
                    type="email"
                  />
                  <Button
                    className="bg-green-600 text-white hover:bg-green-700"
                    type="submit"
                  >
                    Get Started
                  </Button>
                </form>
                <p className="text-xs text-gray-400">
                  By signing up, you agree to our{" "}
                  <Link
                    className="underline underline-offset-2 hover:text-white"
                    href="#"
                  >
                    Terms & Conditions
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          © 2024 PrabhaWatt. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-xs text-gray-600 hover:underline underline-offset-4"
            href="#"
          >
            Terms of Service
          </Link>
          <Link
            className="text-xs text-gray-600 hover:underline underline-offset-4"
            href="#"
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}

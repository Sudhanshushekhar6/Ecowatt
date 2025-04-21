"use client";

import { CircleDollarSignIcon } from "@/components/icons/circle-dollar-sign";
import { SunIcon } from "@/components/icons/sun";
import { UsersIcon } from "@/components/icons/users";
import { NotJustIndia } from "@/components/landing/NotJustIndia";
import { SparkleText } from "@/components/landing/SparkleText";
import AnimatedGridPattern from "@/components/ui/animated-grid-pattern";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WordPullUp from "@/components/ui/word-pull-up";
import { useAuthContext } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { useCopilotReadable } from "@copilotkit/react-core";
import { useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { doc, getDoc } from "firebase/firestore";
import { ArrowRightIcon, PiggyBank, Smartphone, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    setIsLoading(true);
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        await router.push("/dashboard");
      } else {
        await router.push("/onboarding");
      }
    } else {
      await router.push("/sign-in");
    }
  };

  useCopilotChatSuggestions({
    instructions: `Help me understand how to use Ecowatt. I'm new to this platform and I'm not sure how to get started.`,
  });

  useCopilotReadable({
    description: "Key Benefits of Ecowatt",
    value: {
      "Increased Savings":
        "Optimized energy usage leads to lower electricity bills.",
      Sustainability: "Efficient use of solar energy reduces carbon footprint.",
      "User Convenience":
        "Automation and notifications simplify energy management.",
    },
  });

  useCopilotReadable({
    description: "Why Choose Ecowatt?",
    value: {
      "Better Savings":
        "Ecowatt offers a comprehensive solution for solar energy optimization, helping you maximize efficiency and minimize costs.",
      "Smart Home Integration":
        "Ecowatt integrates with your smart home devices, allowing you to control and monitor your energy usage from anywhere.",
      "Energy Goals":
        "Set specific energy goals and receive personalized recommendations to help you reach your targets.",
      Notifications:
        "Receive instant notifications for important updates and reminders.",
    },
  });

  useCopilotReadable({
    description: "Get Started with Ecowatt",
    value: {
      "Learn More":
        "Explore the features and benefits of Ecowatt to see how it can help you save money and reduce your carbon footprint.",
      "Guiding Users":
        "Ecowatt guides you through the process of optimizing your solar energy usage, reducing electricity bills, and contributing to a greener future.",
    },
  });

  useCopilotReadable({
    description: "What is Time of Use Tariff?",
    value: {
      "Time of Use Tariff":
        "Time of Use Tariff (ToU) is a pricing structure that charges different rates for electricity based on the time of day. It encourages consumers to shift their usage to off-peak hours when rates are lower, thereby balancing the load on the grid and reducing costs for everyone.",
    },
  });

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full bg-background flex flex-col items-center justify-center">
          <div className="relative flex h-[70vh] w-full items-center justify-center overflow-hidden rounded-lg bg-background">
            <div className="container px-4 md:px-6 max-w-7xl">
              <div className="flex flex-col items-center space-y-6 text-center">
                <div className="space-y-4">
                  <WordPullUp
                    className="text-4xl font-bold tracking-tighter text-foreground sm:text-4xl md:text-5xl lg:text-6xl max-w-4xl mx-auto"
                    words="Illuminate Your Savings with Ecowatt"
                  />
                  <SparkleText />
                  <p className="mx-auto max-w-2xl text-muted-foreground text-base md:text-lg lg:text-xl">
                    Your all-in-one solution for optimizing solar energy usage,
                    reducing electricity bills, and contributing to a greener
                    future.
                  </p>
                </div>
                <div className="flex flex-row gap-4 items-center justify-center">
                  <Link href="/learn-more" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto text-green-600 border-green-600 hover:bg-muted"
                    >
                      Learn More
                    </Button>
                  </Link>
                  <Button
                    variant="expandIcon"
                    Icon={() => (
                      <ArrowRightIcon className="w-4 h-4 text-white" />
                    )}
                    iconPlacement="right"
                    className="w-full sm:w-auto bg-green-600 text-white hover:bg-green-700"
                    onClick={handleGetStarted}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Get Started"}
                  </Button>
                </div>
              </div>
            </div>
            <AnimatedGridPattern
              numSquares={30}
              maxOpacity={0.1}
              duration={3}
              repeatDelay={1}
              className={cn(
                "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
                "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 opacity-50",
              )}
            />
          </div>
        </section>

        {/* Benefits Section */}
        <section
          id="benefits"
          className="w-full py-12 md:py-16 lg:py-20 bg-muted flex flex-col items-center justify-center"
        >
          <div className="container px-10 md:px-20 max-w-7xl">
            <h2 className="text-2xl font-bold tracking-tighter text-foreground sm:text-3xl md:text-4xl text-center mb-10">
              Key Benefits
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  Icon: CircleDollarSignIcon,
                  title: "Increased Savings",
                  description:
                    "Optimized energy usage leads to lower electricity bills.",
                },
                {
                  Icon: SunIcon,
                  title: "Sustainability",
                  description:
                    "Efficient use of solar energy reduces carbon footprint.",
                },
                {
                  Icon: UsersIcon,
                  title: "User Convenience",
                  description:
                    "Automation and notifications simplify energy management.",
                },
              ].map(({ Icon, title, description }, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-3 p-6 rounded-lg bg-background shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out"
                >
                  <Icon />
                  <h3 className="text-xl font-semibold text-foreground text-center">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <NotJustIndia />

        {/* Why Choose Section */}
        <section
          id="why-choose"
          className="w-full py-12 md:py-16 lg:py-20 bg-background flex flex-col items-center justify-center"
        >
          <div className="container px-10 md:px-20 max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tighter text-foreground sm:text-3xl md:text-4xl">
                  Why Choose Ecowatt?
                </h2>
                <p className="text-muted-foreground text-base md:text-lg lg:text-xl">
                  Ecowatt offers a comprehensive solution for solar energy
                  optimization, helping you maximize efficiency and minimize
                  costs.
                </p>
                <ul className="grid gap-4 mt-6">
                  {[
                    {
                      Icon: Sun,
                      text: "Advanced solar tracking algorithms",
                    },
                    {
                      Icon: PiggyBank,
                      text: "Predictive maintenance to reduce downtime",
                    },
                    {
                      Icon: Smartphone,
                      text: "User-friendly mobile app for remote monitoring",
                    },
                  ].map(({ Icon, text }, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-muted-foreground"
                    >
                      <Icon className="h-5 w-5 text-green-600" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative group flex justify-center">
                <div className="absolute -inset-4 bg-accent rounded-2xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-200" />
                <Image
                  alt="Solar panels"
                  className="relative max-h-[280px] md:max-h-[300px] max-w-full rounded-2xl shadow-2xl object-cover object-center aspect-[4/3]"
                  height="400"
                  src="/solar.jpg"
                  width="600"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Get Started Section */}
        <section
          id="get-started"
          className="w-full py-12 md:py-16 lg:py-20 bg-muted text-foreground flex flex-col items-center justify-center"
        >
          <div className="container px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                  Ready to Optimize Your Solar Energy?
                </h2>
                <p className="mx-auto max-w-2xl text-sm md:text-base text-muted-foreground">
                  Join thousands of satisfied customers who have reduced their
                  energy costs with Ecowatt.
                </p>
              </div>
              <div className="w-full max-w-md space-y-4">
                <form className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-center items-center">
                  <Input
                    className="w-full bg-background/90 placeholder-muted-foreground"
                    placeholder="Enter your email"
                    type="email"
                  />
                  <Button
                    className="w-fit bg-green-600 text-white hover:bg-green-700"
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      handleGetStarted();
                    }}
                  >
                    Get Started
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground">
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

      {/* Footer */}
      <footer className="bg-background border-t">
        <div className="container px-4 md:px-6 max-w-7xl py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <p className="text-xs text-muted-foreground mb-2 sm:mb-0">
              © 2024 Ecowatt. All rights reserved.
            </p>
            <nav className="flex gap-4">
              <Link
                className="text-xs text-muted-foreground hover:underline underline-offset-4"
                href="#"
              >
                Terms of Service
              </Link>
              <Link
                className="text-xs text-muted-foreground hover:underline underline-offset-4"
                href="#"
              >
                Privacy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

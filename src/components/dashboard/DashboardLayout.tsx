// components/dashboard/DashboardLayout.tsx
"use client";

import { Button } from "@/components/ui/button";
import { BarChart3, Settings } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {children}
          <div className="flex mt-6 justify-between items-center">
            <Button className="bg-green-600 text-white hover:bg-green-700">
              <BarChart3 className="mr-2 h-4 w-4" /> Generate Report
            </Button>
            <Link href="/settings">
              <Button
                variant="outline"
                className="text-gray-600 border-gray-300 hover:bg-gray-100"
              >
                <Settings className="mr-2 h-4 w-4" /> System Settings
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { CheckCircle2Icon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Email Verified",
};

export default function EmailVerifiedPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 text-center">
      <div className="space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2Icon className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Email Verified!</h1>
          <p className="text-muted-foreground">
            Your email has been verified successfully. You can now access all features.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard">Continue to Dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
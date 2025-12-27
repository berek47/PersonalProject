import { verifyCheckoutSession } from "@/actions/payments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircleIcon, PlayCircleIcon, XCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Payment Successful",
};

interface CheckoutSuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/courses");
  }

  let result;
  let error = null;

  try {
    result = await verifyCheckoutSession(session_id);
  } catch (e) {
    error = e instanceof Error ? e.message : "An error occurred";
  }

  if (error || !result?.success) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <XCircleIcon className="size-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Payment Verification Failed</CardTitle>
            <CardDescription>
              {error || "We couldn't verify your payment. Please contact support."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircleIcon className="size-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            You are now enrolled in <strong>{result.courseTitle}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Thank you for your purchase. You can now access all course materials
            and start learning right away.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href={`/learn/${result.courseSlug}`}>
                <PlayCircleIcon className="mr-2 size-4" />
                Start Learning
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/my-courses">View My Courses</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

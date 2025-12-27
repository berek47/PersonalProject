import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MailIcon, ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Check Your Email",
};

interface CheckEmailPageProps {
  searchParams: Promise<{
    email?: string;
  }>;
}

export default async function CheckEmailPage({ searchParams }: CheckEmailPageProps) {
  const params = await searchParams;
  const email = params.email;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <MailIcon className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl md:text-2xl">Check Your Email</CardTitle>
        <CardDescription className="text-sm md:text-base">
          We&apos;ve sent a verification link to
          {email && (
            <span className="mt-1 block font-medium text-foreground">{email}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          <p className="mb-2">
            Please check your inbox and click the verification link to activate your account.
          </p>
          <p>
            If you don&apos;t see the email, check your spam folder.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="outline" asChild className="w-full">
            <Link href="/sign-in">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

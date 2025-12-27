"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { MailIcon, ArrowLeftIcon, RefreshCwIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CheckEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isResending, setIsResending] = useState(false);

  async function handleResendEmail() {
    if (!email) return;

    setIsResending(true);
    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: "/email-verified",
      });
      toast.success("Verification email sent!");
    } catch {
      toast.error("Failed to resend email. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="overflow-hidden rounded-2xl border bg-card/80 backdrop-blur-xl shadow-2xl">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-8 pb-8 pt-10">
            {/* Floating sparkles */}
            <motion.div
              className="absolute right-8 top-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <SparklesIcon className="h-5 w-5 text-primary/40" />
            </motion.div>

            {/* Animated mail icon */}
            <div className="flex justify-center">
              <motion.div
                className="relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                {/* Icon container */}
                <motion.div
                  className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25"
                  animate={{
                    y: [-4, 4, -4],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <MailIcon className="h-10 w-10 text-primary-foreground" />
                </motion.div>
              </motion.div>
            </div>

            {/* Title */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-bold">Check Your Email</h1>
              <p className="mt-2 text-muted-foreground">
                We&apos;ve sent a verification link to
              </p>
              {email && (
                <motion.p
                  className="mt-1 font-semibold text-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {email}
                </motion.p>
              )}
            </motion.div>
          </div>

          {/* Content */}
          <div className="space-y-6 px-8 pb-8 pt-6">
            {/* Instructions */}
            <motion.div
              className="rounded-xl bg-muted/50 p-4 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  1
                </div>
                <p className="text-muted-foreground">
                  Open your email inbox and find the email from BT Learn
                </p>
              </div>
              <div className="mt-3 flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  2
                </div>
                <p className="text-muted-foreground">
                  Click the verification link to activate your account
                </p>
              </div>
              <div className="mt-3 flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  3
                </div>
                <p className="text-muted-foreground">
                  If you don&apos;t see it, check your spam folder
                </p>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {email && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleResendEmail}
                  disabled={isResending}
                >
                  <RefreshCwIcon className={`h-4 w-4 ${isResending ? "animate-spin" : ""}`} />
                  {isResending ? "Sending..." : "Resend Verification Email"}
                </Button>
              )}
              <Button variant="ghost" asChild className="w-full gap-2">
                <Link href="/sign-in">
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Footer note */}
        <motion.p
          className="mt-6 text-center text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Didn&apos;t request this? You can safely ignore this email.
        </motion.p>
      </motion.div>
    </div>
  );
}

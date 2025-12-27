"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2Icon, SparklesIcon, RocketIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function EmailVerifiedPage() {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti on mount
    if (!showConfetti) {
      setShowConfetti(true);
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ["#6366f1", "#8b5cf6", "#a855f7"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ["#6366f1", "#8b5cf6", "#a855f7"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [showConfetti]);

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-green-500/20 blur-3xl"
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
          className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="overflow-hidden rounded-2xl border bg-card/80 backdrop-blur-xl shadow-2xl">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent px-8 pb-8 pt-10">
            {/* Floating sparkles */}
            <motion.div
              className="absolute left-8 top-6"
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <SparklesIcon className="h-5 w-5 text-green-500/40" />
            </motion.div>
            <motion.div
              className="absolute right-8 top-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            >
              <SparklesIcon className="h-4 w-4 text-primary/40" />
            </motion.div>

            {/* Animated success icon */}
            <div className="flex justify-center">
              <motion.div
                className="relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                {/* Success ring animation */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-green-500/20"
                  initial={{ scale: 1, opacity: 0 }}
                  animate={{
                    scale: [1, 2, 2],
                    opacity: [0.8, 0.4, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.5,
                    ease: "easeOut",
                  }}
                />
                {/* Icon container */}
                <motion.div
                  className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/25"
                  animate={{
                    boxShadow: [
                      "0 10px 25px -5px rgba(34, 197, 94, 0.25)",
                      "0 10px 40px -5px rgba(34, 197, 94, 0.4)",
                      "0 10px 25px -5px rgba(34, 197, 94, 0.25)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
                  >
                    <CheckCircle2Icon className="h-12 w-12 text-white" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            {/* Title */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h1 className="text-2xl font-bold">Email Verified!</h1>
              <p className="mt-2 text-muted-foreground">
                Your account is now fully activated
              </p>
            </motion.div>
          </div>

          {/* Content */}
          <div className="space-y-6 px-8 pb-8 pt-6">
            {/* Success message */}
            <motion.div
              className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-sm text-green-700 dark:text-green-400">
                Congratulations! You now have full access to all BT Learn features. Start exploring courses and begin your learning journey.
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button asChild size="lg" className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                <Link href="/dashboard">
                  <RocketIcon className="h-5 w-5" />
                  Go to Dashboard
                </Link>
              </Button>
            </motion.div>

            {/* Quick links */}
            <motion.div
              className="flex justify-center gap-4 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Link href="/courses" className="text-muted-foreground hover:text-primary transition-colors">
                Browse Courses
              </Link>
              <span className="text-muted-foreground/50">|</span>
              <Link href="/profile" className="text-muted-foreground hover:text-primary transition-colors">
                Complete Profile
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Footer note */}
        <motion.p
          className="mt-6 text-center text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Welcome to BT Learn! We&apos;re excited to have you.
        </motion.p>
      </motion.div>
    </div>
  );
}

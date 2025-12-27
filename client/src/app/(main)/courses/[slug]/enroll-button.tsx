"use client";

import { enrollInCourse } from "@/actions/enrollments";
import { createCheckoutSession } from "@/actions/payments";
import { Button } from "@/components/ui/button";
import {
  CheckCircleIcon,
  CreditCardIcon,
  Loader2Icon,
  PlayCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

interface EnrollButtonProps {
  courseId: string;
  courseSlug: string;
  isEnrolled: boolean;
  isLoggedIn: boolean;
  price: number;
}

export function EnrollButton({
  courseId,
  courseSlug,
  isEnrolled,
  isLoggedIn,
  price,
}: EnrollButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isFree = price === 0;

  if (!isLoggedIn) {
    return (
      <Button className="w-full" asChild>
        <Link href={`/sign-in?callbackUrl=/courses/${courseSlug}`}>
          Sign in to Enroll
        </Link>
      </Button>
    );
  }

  if (isEnrolled) {
    return (
      <div className="space-y-2">
        <Button className="w-full" asChild>
          <Link href={`/learn/${courseSlug}`}>
            <PlayCircleIcon className="mr-2 size-4" />
            Continue Learning
          </Link>
        </Button>
        <p className="flex items-center justify-center gap-1 text-sm text-green-600">
          <CheckCircleIcon className="size-4" />
          You are enrolled
        </p>
      </div>
    );
  }

  function handleEnroll() {
    startTransition(async () => {
      try {
        if (isFree) {
          // Free course - enroll directly
          await enrollInCourse(courseId);
          toast.success("Successfully enrolled in the course!");
          router.refresh();
          router.push(`/learn/${courseSlug}`);
        } else {
          // Paid course - redirect to Stripe checkout
          const result = await createCheckoutSession(courseId);
          if (result.url) {
            window.location.href = result.url;
          } else {
            throw new Error("Failed to create checkout session");
          }
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to process request"
        );
      }
    });
  }

  return (
    <Button className="w-full" onClick={handleEnroll} disabled={isPending}>
      {isPending ? (
        <Loader2Icon className="mr-2 size-4 animate-spin" />
      ) : !isFree ? (
        <CreditCardIcon className="mr-2 size-4" />
      ) : null}
      {isFree ? "Enroll Now - Free" : "Buy Now"}
    </Button>
  );
}

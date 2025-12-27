import { getEnrollmentById } from "@/actions/enrollments";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth-helpers";
import { format } from "date-fns";
import { ArrowLeftIcon, AwardIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CertificateActions } from "./certificate-actions";

interface CertificatePageProps {
  params: Promise<{ enrollmentId: string }>;
}

export const metadata: Metadata = {
  title: "Certificate of Completion",
};

export default async function CertificatePage({ params }: CertificatePageProps) {
  const user = await requireAuth();
  const { enrollmentId } = await params;

  let enrollment;
  try {
    enrollment = await getEnrollmentById(enrollmentId);
  } catch {
    notFound();
  }

  // Verify the certificate belongs to the current user
  if (enrollment.userId !== user.id) {
    redirect("/my-courses");
  }

  // Must be completed to view certificate
  if (!enrollment.completedAt) {
    redirect(`/learn/${enrollment.course.slug}`);
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/my-courses">
            <ArrowLeftIcon className="mr-1 size-4" />
            Back to My Courses
          </Link>
        </Button>
      </div>

      {/* Certificate */}
      <Card className="overflow-hidden">
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 md:p-12">
          {/* Decorative Border */}
          <div className="absolute inset-4 border-2 border-primary/20 rounded-lg" />
          <div className="absolute inset-6 border border-primary/10 rounded-lg" />

          <div className="relative space-y-8 text-center">
            {/* Header */}
            <div>
              <AwardIcon className="mx-auto size-16 text-primary" />
              <h1 className="mt-4 text-3xl font-bold md:text-4xl">
                Certificate of Completion
              </h1>
              <p className="mt-2 text-muted-foreground">
                This certifies that
              </p>
            </div>

            {/* Recipient Name */}
            <div className="py-4">
              <p className="text-2xl font-semibold text-primary md:text-3xl">
                {enrollment.user.name}
              </p>
            </div>

            {/* Achievement */}
            <div>
              <p className="text-muted-foreground">
                has successfully completed the course
              </p>
              <p className="mt-2 text-xl font-semibold md:text-2xl">
                {enrollment.course.title}
              </p>
              <p className="mt-1 text-muted-foreground">
                taught by {enrollment.course.instructor.name}
              </p>
            </div>

            {/* Date & Details */}
            <div className="border-t pt-8">
              <p className="text-muted-foreground">
                Completed on{" "}
                <span className="font-medium text-foreground">
                  {format(new Date(enrollment.completedAt), "MMMM d, yyyy")}
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Certificate ID: {enrollment.id}
              </p>
            </div>

            {/* Signature */}
            <div className="flex justify-center gap-8 pt-4 md:gap-16">
              <div className="text-center">
                <div className="mb-2 h-px w-32 bg-border" />
                <p className="text-sm font-medium">
                  {enrollment.course.instructor.name}
                </p>
                <p className="text-xs text-muted-foreground">Instructor</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <CertificateActions courseTitle={enrollment.course.title} />
    </main>
  );
}

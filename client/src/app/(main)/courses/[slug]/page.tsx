import { getCourseBySlug, getCourseReviews } from "@/actions/courses";
import { getEnrollment } from "@/actions/enrollments";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import {
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  GraduationCapIcon,
  StarIcon,
  UserIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { EnrollButton } from "./enroll-button";
import { ReviewSection } from "./review-section";

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const course = await getCourseBySlug(slug);
    return {
      title: course.title,
      description: course.description.slice(0, 160),
    };
  } catch {
    return {
      title: "Course Not Found",
    };
  }
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { slug } = await params;

  let course;
  try {
    course = await getCourseBySlug(slug);
  } catch {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let enrollment = null;
  if (session?.user) {
    try {
      enrollment = await getEnrollment(course.id);
    } catch {
      // Not enrolled
    }
  }

  const reviews = await getCourseReviews(course.id);
  const price = Number(course.price);
  const totalDuration = course.lessons.reduce(
    (acc, lesson) => acc + (lesson.duration || 0),
    0
  );
  const publishedLessons = course.lessons.filter((l) => l.isPublished);
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-6">
            {course.category && (
              <Badge variant="secondary" className="mb-2">
                {course.category.name}
              </Badge>
            )}
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground mt-2">{course.description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                  {course.instructor.image ? (
                    <Image
                      src={course.instructor.image}
                      alt={course.instructor.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <UserIcon className="size-4" />
                  )}
                </div>
                <span>{course.instructor.name}</span>
              </div>

              <Badge>{course.difficulty}</Badge>

              {averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <StarIcon className="size-4 fill-yellow-400 text-yellow-400" />
                  <span>{averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({reviews.length} reviews)
                  </span>
                </div>
              )}

              <span className="flex items-center gap-1 text-muted-foreground">
                <UserIcon className="size-4" />
                {course._count.enrollments} students
              </span>
            </div>
          </div>

          {/* Thumbnail */}
          {course.thumbnail && (
            <div className="relative mb-8 aspect-video overflow-hidden rounded-lg">
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Course Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                {publishedLessons.length} lessons
                {totalDuration > 0 && ` • ${totalDuration} minutes`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {publishedLessons.length === 0 ? (
                <p className="text-muted-foreground">
                  No lessons available yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {publishedLessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {index + 1}
                        </span>
                        <span>{lesson.title}</span>
                      </div>
                      {lesson.duration && (
                        <span className="text-muted-foreground text-sm">
                          {lesson.duration} min
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          <ReviewSection
            courseId={course.id}
            reviews={reviews}
            isEnrolled={!!enrollment}
            currentUserId={session?.user?.id}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-2xl">
                {price === 0 ? "Free" : formatPrice(price)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EnrollButton
                courseId={course.id}
                courseSlug={course.slug}
                isEnrolled={!!enrollment}
                isLoggedIn={!!session?.user}
                price={price}
              />

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpenIcon className="size-4 text-muted-foreground" />
                  <span>{publishedLessons.length} lessons</span>
                </div>
                {totalDuration > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="size-4 text-muted-foreground" />
                    <span>{totalDuration} minutes of content</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCapIcon className="size-4 text-muted-foreground" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircleIcon className="size-4 text-muted-foreground" />
                  <span>Lifetime access</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

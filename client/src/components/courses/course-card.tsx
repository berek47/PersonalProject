import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { BookOpenIcon, StarIcon, UsersIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { Decimal } from "@prisma/client/runtime/library";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail: string | null;
    price: number | string | Decimal;
    difficulty: string;
    instructor: {
      name: string;
      image: string | null;
    };
    category: {
      name: string;
    } | null;
    _count: {
      lessons: number;
      enrollments: number;
    };
  };
}

const difficultyColors: Record<string, string> = {
  BEGINNER: "bg-green-500/10 text-green-600 border-green-500/20",
  INTERMEDIATE: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  ADVANCED: "bg-red-500/10 text-red-600 border-red-500/20",
};

export function CourseCard({ course }: CourseCardProps) {
  const price = Number(course.price);

  return (
    <Link href={`/courses/${course.slug}`} className="group">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <BookOpenIcon className="size-12 text-primary" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Difficulty Badge */}
          <div className="absolute left-3 top-3">
            <Badge
              variant="outline"
              className={`border ${difficultyColors[course.difficulty] || "bg-secondary"}`}
            >
              {course.difficulty.charAt(0) + course.difficulty.slice(1).toLowerCase()}
            </Badge>
          </div>

          {/* Price Badge */}
          <div className="absolute right-3 top-3">
            <Badge
              className={
                price === 0
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-primary text-primary-foreground"
              }
            >
              {price === 0 ? "Free" : formatPrice(price)}
            </Badge>
          </div>

          {/* Category on Hover */}
          {course.category && (
            <div className="absolute bottom-3 left-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <Badge variant="secondary" className="bg-white/90 text-foreground">
                {course.category.name}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          {/* Title */}
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
            {course.title}
          </h3>

          {/* Description */}
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {course.description}
          </p>

          {/* Instructor */}
          <div className="mb-4 flex items-center gap-3">
            <div className="relative size-8 overflow-hidden rounded-full bg-muted">
              {course.instructor.image ? (
                <Image
                  src={course.instructor.image}
                  alt={course.instructor.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                  {course.instructor.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {course.instructor.name}
            </span>
          </div>

          {/* Stats */}
          <div className="mt-auto flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <BookOpenIcon className="size-4" />
                {course._count.lessons} lessons
              </span>
              <span className="flex items-center gap-1">
                <UsersIcon className="size-4" />
                {course._count.enrollments.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1 text-yellow-500">
              <StarIcon className="size-4 fill-current" />
              <span className="font-medium">4.8</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

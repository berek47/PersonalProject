import { getCategories } from "@/actions/categories";
import { getPublishedCourses } from "@/actions/courses";
import { CourseCard } from "@/components/courses/course-card";
import { CourseFilters } from "@/components/courses/course-filters";
import { Button } from "@/components/ui/button";
import {
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

interface CoursesPageProps {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    difficulty?: string;
    cursor?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Browse Courses",
  description: "Discover courses to enhance your skills and knowledge",
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const categories = await getCategories();

  const { courses, nextCursor, prevCursor, hasMore, hasPrevious } =
    await getPublishedCourses({
      search: params.search,
      categoryId: params.categoryId,
      difficulty: params.difficulty,
      cursor: params.cursor,
      limit: 12,
    });

  function buildPaginationUrl(cursor: string | null) {
    const urlParams = new URLSearchParams();
    if (params.search) urlParams.set("search", params.search);
    if (params.categoryId) urlParams.set("categoryId", params.categoryId);
    if (params.difficulty) urlParams.set("difficulty", params.difficulty);
    if (cursor) urlParams.set("cursor", cursor);
    return `/courses?${urlParams.toString()}`;
  }

  const hasActiveFilters = params.search || params.categoryId || params.difficulty;

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9ImN1cnJlbnRDb2xvciIgZmlsbC1vcGFjaXR5PSIwLjAyIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <SparklesIcon className="size-4" />
              {courses.length}+ courses available
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Explore Our{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Course Catalog
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Discover expert-led courses designed to help you achieve your goals.
              Filter by category, difficulty, or search for specific topics.
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Content */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-8 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FilterIcon className="size-4" />
            Filter & Search
          </div>
          <CourseFilters
            categories={categories}
            currentFilters={{
              search: params.search,
              categoryId: params.categoryId,
              difficulty: params.difficulty,
            }}
          />
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {params.search && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                <SearchIcon className="size-3" />
                &ldquo;{params.search}&rdquo;
              </span>
            )}
            {params.categoryId && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                {categories.find((c) => c.id === params.categoryId)?.name || "Category"}
              </span>
            )}
            {params.difficulty && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                {params.difficulty.charAt(0) + params.difficulty.slice(1).toLowerCase()}
              </span>
            )}
          </div>
        )}

        {/* Results */}
        {courses.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-muted">
              <BookOpenIcon className="size-12 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold">No courses found</h2>
            <p className="mb-8 text-muted-foreground">
              Try adjusting your filters or search query to find what you&apos;re looking for
            </p>
            <Button asChild variant="outline">
              <Link href="/courses">Clear all filters</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground">
                Showing <span className="font-medium text-foreground">{courses.length}</span> courses
              </p>
            </div>

            {/* Course Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            {(hasPrevious || hasMore) && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  disabled={!hasPrevious}
                  asChild={hasPrevious}
                  className="gap-2"
                >
                  {hasPrevious ? (
                    <Link href={buildPaginationUrl(prevCursor)}>
                      <ChevronLeftIcon className="size-4" />
                      Previous
                    </Link>
                  ) : (
                    <>
                      <ChevronLeftIcon className="size-4" />
                      Previous
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  disabled={!hasMore}
                  asChild={hasMore}
                  className="gap-2"
                >
                  {hasMore ? (
                    <Link href={buildPaginationUrl(nextCursor)}>
                      Next
                      <ChevronRightIcon className="size-4" />
                    </Link>
                  ) : (
                    <>
                      Next
                      <ChevronRightIcon className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

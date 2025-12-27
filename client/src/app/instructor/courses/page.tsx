import { getInstructorCourses } from "@/actions/instructor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircleIcon,
  BookOpenIcon,
  UsersIcon,
  StarIcon,
  EditIcon,
  EyeIcon,
} from "lucide-react";
import Link from "next/link";

export default async function InstructorCoursesPage() {
  const courses = await getInstructorCourses();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-green-100 text-green-700">Published</Badge>;
      case "ARCHIVED":
        return <Badge className="bg-gray-100 text-gray-700">Archived</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">Manage and edit your courses</p>
        </div>
        <Button asChild>
          <Link href="/instructor/courses/new">
            <PlusCircleIcon className="mr-2 size-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpenIcon className="mb-4 size-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No courses yet</h3>
            <p className="mb-4 text-muted-foreground">
              Create your first course to start teaching
            </p>
            <Button asChild>
              <Link href="/instructor/courses/new">
                <PlusCircleIcon className="mr-2 size-4" />
                Create Course
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="flex items-center gap-6 p-6">
                {/* Thumbnail */}
                <div className="hidden size-32 flex-shrink-0 overflow-hidden rounded-lg bg-muted sm:block">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <BookOpenIcon className="size-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {course.category?.name || "No category"} • {course.difficulty}
                      </p>
                    </div>
                    {getStatusBadge(course.status)}
                  </div>

                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {course.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpenIcon className="size-4" />
                      {course._count.lessons} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <UsersIcon className="size-4" />
                      {course._count.enrollments} students
                    </span>
                    <span className="flex items-center gap-1">
                      <StarIcon className="size-4" />
                      {course._count.reviews} reviews
                    </span>
                    <span className="font-medium text-foreground">
                      {Number(course.price) === 0 ? "Free" : `$${Number(course.price).toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/instructor/courses/${course.id}`}>
                      <EditIcon className="mr-2 size-4" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/courses/${course.slug}`} target="_blank">
                      <EyeIcon className="mr-2 size-4" />
                      Preview
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

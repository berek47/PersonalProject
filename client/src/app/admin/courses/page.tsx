"use client";

import { useState, useEffect } from "react";
import { getAdminCourses, updateCourseStatus, deleteCourse } from "@/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  SearchIcon,
  BookOpenIcon,
  MoreVerticalIcon,
  EyeIcon,
  ArchiveIcon,
  TrashIcon,
  CheckCircleIcon,
  FileEditIcon,
  UsersIcon,
  StarIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: number;
  status: string;
  difficulty: string;
  createdAt: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  category: {
    id: string;
    name: string;
  } | null;
  _count: {
    lessons: number;
    enrollments: number;
    reviews: number;
  };
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [total, setTotal] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  useEffect(() => {
    fetchCourses();
  }, [search, statusFilter]);

  async function fetchCourses() {
    setLoading(true);
    try {
      const result = await getAdminCourses({
        search: search || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      });
      setCourses(result.courses);
      setTotal(result.total);
    } catch (error) {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(courseId: string, newStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
    try {
      await updateCourseStatus(courseId, newStatus);
      toast.success(`Course status updated to ${newStatus.toLowerCase()}`);
      fetchCourses();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  }

  async function handleDelete() {
    if (!courseToDelete) return;
    try {
      await deleteCourse(courseToDelete.id);
      toast.success("Course deleted successfully");
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
      fetchCourses();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete course");
    }
  }

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
      <div>
        <h1 className="text-3xl font-bold">Course Management</h1>
        <p className="text-muted-foreground">
          View and manage all courses on the platform ({total} total)
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap gap-4 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Courses List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading courses...</div>
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpenIcon className="mb-4 size-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No courses found</h3>
            <p className="text-muted-foreground">
              {search || statusFilter !== "ALL"
                ? "Try adjusting your filters"
                : "No courses have been created yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="flex items-center gap-6 p-4">
                {/* Thumbnail */}
                <div className="hidden size-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted sm:block">
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold truncate">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {course.instructor.name} • {course.category?.name || "No category"}
                      </p>
                    </div>
                    {getStatusBadge(course.status)}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVerticalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/courses/${course.slug}`} target="_blank">
                        <EyeIcon className="mr-2 size-4" />
                        View Course
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/instructor/courses/${course.id}`}>
                        <FileEditIcon className="mr-2 size-4" />
                        Edit Course
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {course.status !== "PUBLISHED" && (
                      <DropdownMenuItem onClick={() => handleStatusChange(course.id, "PUBLISHED")}>
                        <CheckCircleIcon className="mr-2 size-4" />
                        Publish
                      </DropdownMenuItem>
                    )}
                    {course.status !== "DRAFT" && (
                      <DropdownMenuItem onClick={() => handleStatusChange(course.id, "DRAFT")}>
                        <FileEditIcon className="mr-2 size-4" />
                        Set as Draft
                      </DropdownMenuItem>
                    )}
                    {course.status !== "ARCHIVED" && (
                      <DropdownMenuItem onClick={() => handleStatusChange(course.id, "ARCHIVED")}>
                        <ArchiveIcon className="mr-2 size-4" />
                        Archive
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        setCourseToDelete(course);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <TrashIcon className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{courseToDelete?.title}"? This action cannot be undone
              and will remove all lessons, enrollments, and reviews associated with this course.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getCourseWithLessons,
  updateCourse,
  deleteCourse,
  createLesson,
  updateLesson,
  deleteLesson,
} from "@/actions/instructor";
import { getCategories } from "@/actions/categories";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Loader2Icon,
  SaveIcon,
  TrashIcon,
  PlusCircleIcon,
  GripVerticalIcon,
  EditIcon,
  EyeIcon,
  VideoIcon,
} from "lucide-react";
import { toast } from "sonner";

type Category = { id: string; name: string };
type Lesson = {
  id: string;
  title: string;
  slug: string;
  content: string;
  videoUrl: string | null;
  duration: number;
  order: number;
  isPublished: boolean;
};
type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: any;
  difficulty: string;
  status: string;
  categoryId: string | null;
  category: Category | null;
  lessons: Lesson[];
};

export default function CourseEditorPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price: "0",
    difficulty: "BEGINNER",
    categoryId: "",
    thumbnail: "",
    status: "DRAFT",
  });

  // Lesson form
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    slug: "",
    content: "",
    videoUrl: "",
    duration: "0",
  });
  const [savingLesson, setSavingLesson] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [courseData, cats] = await Promise.all([
          getCourseWithLessons(courseId),
          getCategories(),
        ]);
        setCourse(courseData as Course);
        setCategories(cats);
        setFormData({
          title: courseData.title,
          slug: courseData.slug,
          description: courseData.description,
          price: String(courseData.price),
          difficulty: courseData.difficulty,
          categoryId: courseData.categoryId || "",
          thumbnail: courseData.thumbnail || "",
          status: courseData.status,
        });
      } catch (error: any) {
        toast.error(error.message || "Failed to load course");
        router.push("/instructor/courses");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId, router]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateCourse(courseId, {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        difficulty: formData.difficulty,
        categoryId: formData.categoryId || undefined,
        thumbnail: formData.thumbnail || undefined,
        status: formData.status,
      });
      toast.success("Course saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteCourse(courseId);
      toast.success("Course deleted");
      router.push("/instructor/courses");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete course");
    }
  }

  function openLessonDialog(lesson?: Lesson) {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        title: lesson.title,
        slug: lesson.slug,
        content: lesson.content,
        videoUrl: lesson.videoUrl || "",
        duration: String(lesson.duration),
      });
    } else {
      setEditingLesson(null);
      setLessonForm({
        title: "",
        slug: "",
        content: "",
        videoUrl: "",
        duration: "0",
      });
    }
    setLessonDialogOpen(true);
  }

  async function handleSaveLesson() {
    setSavingLesson(true);
    try {
      if (editingLesson) {
        await updateLesson(editingLesson.id, {
          title: lessonForm.title,
          slug: lessonForm.slug,
          content: lessonForm.content,
          videoUrl: lessonForm.videoUrl || undefined,
          duration: parseInt(lessonForm.duration) || 0,
        });
        toast.success("Lesson updated!");
      } else {
        await createLesson(courseId, {
          title: lessonForm.title,
          slug: lessonForm.slug,
          content: lessonForm.content,
          videoUrl: lessonForm.videoUrl || undefined,
          duration: parseInt(lessonForm.duration) || 0,
        });
        toast.success("Lesson created!");
      }
      setLessonDialogOpen(false);
      // Refresh course data
      const courseData = await getCourseWithLessons(courseId);
      setCourse(courseData as Course);
    } catch (error: any) {
      toast.error(error.message || "Failed to save lesson");
    } finally {
      setSavingLesson(false);
    }
  }

  async function handleDeleteLesson(lessonId: string) {
    try {
      await deleteLesson(lessonId);
      toast.success("Lesson deleted");
      // Refresh course data
      const courseData = await getCourseWithLessons(courseId);
      setCourse(courseData as Course);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete lesson");
    }
  }

  async function handleToggleLessonPublish(lesson: Lesson) {
    try {
      await updateLesson(lesson.id, { isPublished: !lesson.isPublished });
      toast.success(lesson.isPublished ? "Lesson unpublished" : "Lesson published");
      const courseData = await getCourseWithLessons(courseId);
      setCourse(courseData as Course);
    } catch (error: any) {
      toast.error(error.message || "Failed to update lesson");
    }
  }

  // Auto-generate lesson slug
  useEffect(() => {
    if (!editingLesson) {
      const slug = lessonForm.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setLessonForm((prev) => ({ ...prev, slug }));
    }
  }, [lessonForm.title, editingLesson]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Course</h1>
          <p className="text-muted-foreground">{course.title}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/courses/${course.slug}`} target="_blank">
              <EyeIcon className="mr-2 size-4" />
              Preview
            </a>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2Icon className="mr-2 size-4 animate-spin" />
            ) : (
              <SaveIcon className="mr-2 size-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="lessons">
            Lessons ({course.lessons.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(v) => setFormData({ ...formData, difficulty: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for this course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <TrashIcon className="mr-2 size-4" />
                    Delete Course
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Course</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the course
                      and all its lessons, enrollments, and reviews.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Course Lessons</CardTitle>
                <CardDescription>Manage your course content</CardDescription>
              </div>
              <Button onClick={() => openLessonDialog()}>
                <PlusCircleIcon className="mr-2 size-4" />
                Add Lesson
              </Button>
            </CardHeader>
            <CardContent>
              {course.lessons.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No lessons yet. Add your first lesson to get started.
                </div>
              ) : (
                <div className="space-y-2">
                  {course.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-4 rounded-lg border p-4"
                    >
                      <GripVerticalIcon className="size-5 text-muted-foreground" />
                      <span className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{lesson.title}</p>
                          {lesson.videoUrl && <VideoIcon className="size-4 text-muted-foreground" />}
                          <Badge variant={lesson.isPublished ? "default" : "outline"}>
                            {lesson.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {lesson.duration} min
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleLessonPublish(lesson)}
                        >
                          {lesson.isPublished ? "Unpublish" : "Publish"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openLessonDialog(lesson)}
                        >
                          <EditIcon className="size-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-600">
                              <TrashIcon className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{lesson.title}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
            <DialogDescription>
              {editingLesson ? "Update lesson details" : "Create a new lesson for this course"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lessonTitle">Title</Label>
                <Input
                  id="lessonTitle"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="Lesson title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lessonSlug">Slug</Label>
                <Input
                  id="lessonSlug"
                  value={lessonForm.slug}
                  onChange={(e) => setLessonForm({ ...lessonForm, slug: e.target.value })}
                  placeholder="lesson-slug"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonContent">Content</Label>
              <Textarea
                id="lessonContent"
                value={lessonForm.content}
                onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                placeholder="Lesson content and description..."
                rows={4}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lessonVideo">Video URL</Label>
                <Input
                  id="lessonVideo"
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lessonDuration">Duration (minutes)</Label>
                <Input
                  id="lessonDuration"
                  type="number"
                  min="0"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLesson} disabled={savingLesson}>
              {savingLesson ? (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              ) : null}
              {editingLesson ? "Update Lesson" : "Create Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { getInstructorStats } from "@/actions/instructor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpenIcon,
  UsersIcon,
  DollarSignIcon,
  StarIcon,
  TrendingUpIcon,
  PlusCircleIcon,
  ClockIcon,
} from "lucide-react";
import Link from "next/link";

export default async function InstructorDashboard() {
  const stats = await getInstructorStats();

  const statCards = [
    {
      title: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpenIcon,
      description: `${stats.publishedCourses} published`,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: UsersIcon,
      description: "Enrolled in your courses",
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Total Revenue",
      value: `$${Number(stats.totalRevenue).toFixed(2)}`,
      icon: DollarSignIcon,
      description: "Lifetime earnings",
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Average Rating",
      value: stats.averageRating ? stats.averageRating.toFixed(1) : "N/A",
      icon: StarIcon,
      description: "Based on student reviews",
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Manage your courses and track performance</p>
        </div>
        <Button asChild>
          <Link href="/instructor/courses/new">
            <PlusCircleIcon className="mr-2 size-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bg}`}>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="size-5" />
              Recent Enrollments
            </CardTitle>
            <CardDescription>Students who recently enrolled in your courses</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentEnrollments.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">No enrollments yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{enrollment.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        enrolled in {enrollment.course.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ClockIcon className="size-3" />
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for instructors</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/instructor/courses/new">
                <PlusCircleIcon className="mr-2 size-4" />
                Create a new course
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/instructor/courses">
                <BookOpenIcon className="mr-2 size-4" />
                Manage existing courses
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/instructor/analytics">
                <TrendingUpIcon className="mr-2 size-4" />
                View detailed analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

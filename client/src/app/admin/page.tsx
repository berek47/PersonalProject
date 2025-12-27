import { getAdminStats } from "@/actions/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UsersIcon,
  BookOpenIcon,
  GraduationCapIcon,
  DollarSignIcon,
  TrendingUpIcon,
  FileTextIcon,
  UserPlusIcon,
  ClockIcon,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: UsersIcon,
      description: `${stats.totalStudents} students, ${stats.totalInstructors} instructors`,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpenIcon,
      description: `${stats.publishedCourses} published`,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Enrollments",
      value: stats.totalEnrollments,
      icon: GraduationCapIcon,
      description: "Total course enrollments",
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Revenue",
      value: `$${Number(stats.totalRevenue).toFixed(2)}`,
      icon: DollarSignIcon,
      description: "Total earnings",
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform</p>
      </div>

      {/* Pending Applications Alert */}
      {stats.pendingApplications > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-orange-100">
              <FileTextIcon className="size-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {stats.pendingApplications} pending instructor application{stats.pendingApplications > 1 ? "s" : ""}
              </p>
              <p className="text-sm text-muted-foreground">
                Review applications to grow your instructor team
              </p>
            </div>
            <Link
              href="/admin/applications"
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
            >
              Review Now
            </Link>
          </CardContent>
        </Card>
      )}

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

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlusIcon className="size-5" />
              Recent Users
            </CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={user.role === "ADMIN" ? "default" : user.role === "INSTRUCTOR" ? "secondary" : "outline"}>
                      {user.role}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/admin/users"
              className="mt-4 inline-block text-sm text-primary hover:underline"
            >
              View all users →
            </Link>
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="size-5" />
              Recent Enrollments
            </CardTitle>
            <CardDescription>Latest course enrollments</CardDescription>
          </CardHeader>
          <CardContent>
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
              {stats.recentEnrollments.length === 0 && (
                <p className="text-sm text-muted-foreground">No enrollments yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

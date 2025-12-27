"use client";

import { useState, useEffect } from "react";
import { getInstructorStats } from "@/actions/instructor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpenIcon,
  UsersIcon,
  DollarSignIcon,
  StarIcon,
  TrendingUpIcon,
  EyeIcon,
  PlayCircleIcon,
  ClockIcon,
} from "lucide-react";

type Stats = {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  recentEnrollments: any[];
};

export default function InstructorAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getInstructorStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your performance and student engagement
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpenIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCourses || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.publishedCourses || 0} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <UsersIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled in your courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSignIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats?.totalRevenue || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From course sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <StarIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageRating ? stats.averageRating.toFixed(1) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on student reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Engagement Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="size-5" />
              Engagement Overview
            </CardTitle>
            <CardDescription>
              How students interact with your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EyeIcon className="size-4 text-muted-foreground" />
                  <span className="text-sm">Course Views</span>
                </div>
                <span className="font-medium">Coming soon</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlayCircleIcon className="size-4 text-muted-foreground" />
                  <span className="text-sm">Video Completions</span>
                </div>
                <span className="font-medium">Coming soon</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClockIcon className="size-4 text-muted-foreground" />
                  <span className="text-sm">Avg. Watch Time</span>
                </div>
                <span className="font-medium">Coming soon</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="size-5" />
              Recent Enrollments
            </CardTitle>
            <CardDescription>
              Latest students who enrolled in your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentEnrollments && stats.recentEnrollments.length > 0 ? (
              <div className="space-y-4">
                {stats.recentEnrollments.slice(0, 5).map((enrollment: any) => (
                  <div key={enrollment.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{enrollment.user?.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{enrollment.course?.title}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent enrollments</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Tips to Improve Performance</CardTitle>
          <CardDescription>
            Suggestions to increase your course engagement and revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">1.</span>
              Add preview videos to give students a taste of your teaching style
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">2.</span>
              Keep lessons under 15 minutes for better engagement
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">3.</span>
              Respond to student reviews and questions promptly
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">4.</span>
              Update your course content regularly to keep it relevant
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">5.</span>
              Use high-quality thumbnails to attract more students
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

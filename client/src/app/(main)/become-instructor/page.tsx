"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitInstructorApplication, getMyApplication } from "@/actions/instructor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCapIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  BookOpenIcon,
  UsersIcon,
  DollarSignIcon,
  TrendingUpIcon,
  Loader2Icon,
} from "lucide-react";
import { toast } from "sonner";

const benefits = [
  {
    icon: BookOpenIcon,
    title: "Share Your Knowledge",
    description: "Create courses on topics you're passionate about and help others learn.",
  },
  {
    icon: UsersIcon,
    title: "Reach Global Audience",
    description: "Connect with thousands of students from around the world.",
  },
  {
    icon: DollarSignIcon,
    title: "Earn Revenue",
    description: "Get paid for every enrollment in your courses.",
  },
  {
    icon: TrendingUpIcon,
    title: "Build Your Brand",
    description: "Establish yourself as an expert in your field.",
  },
];

type Application = {
  id: string;
  status: string;
  reviewNotes: string | null;
  createdAt: Date;
};

export default function BecomeInstructorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);

  const [formData, setFormData] = useState({
    expertise: "",
    experience: "",
    bio: "",
    courseTopic: "",
    sampleVideo: "",
    linkedin: "",
    website: "",
  });

  useEffect(() => {
    async function checkApplication() {
      try {
        const app = await getMyApplication();
        setApplication(app as Application | null);
      } catch (error) {
        // User might not be logged in
      } finally {
        setLoading(false);
      }
    }
    checkApplication();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await submitInstructorApplication({
        expertise: formData.expertise,
        experience: formData.experience,
        bio: formData.bio,
        courseTopic: formData.courseTopic,
        sampleVideo: formData.sampleVideo || undefined,
        linkedin: formData.linkedin || undefined,
        website: formData.website || undefined,
      });

      if (result.reapplied) {
        toast.success("Application resubmitted successfully!");
      } else {
        toast.success("Application submitted successfully!");
      }

      // Refresh to show status
      const app = await getMyApplication();
      setApplication(app as Application | null);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show application status if exists
  if (application) {
    return (
      <main className="py-12">
        <div className="mx-auto max-w-2xl px-4">
          <Card>
            <CardHeader className="text-center">
              {application.status === "PENDING" && (
                <>
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-yellow-100">
                    <ClockIcon className="size-8 text-yellow-600" />
                  </div>
                  <CardTitle>Application Under Review</CardTitle>
                  <CardDescription>
                    Your application was submitted on{" "}
                    {new Date(application.createdAt).toLocaleDateString()}
                  </CardDescription>
                </>
              )}
              {application.status === "APPROVED" && (
                <>
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircleIcon className="size-8 text-green-600" />
                  </div>
                  <CardTitle>Application Approved!</CardTitle>
                  <CardDescription>
                    Congratulations! You are now an instructor.
                  </CardDescription>
                </>
              )}
              {application.status === "REJECTED" && (
                <>
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
                    <XCircleIcon className="size-8 text-red-600" />
                  </div>
                  <CardTitle>Application Not Approved</CardTitle>
                  <CardDescription>
                    Unfortunately, your application was not approved at this time.
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="text-center">
              {application.status === "PENDING" && (
                <div className="space-y-4">
                  <Badge className="bg-yellow-100 text-yellow-700">Pending Review</Badge>
                  <p className="text-muted-foreground">
                    Our team is reviewing your application. You'll be notified once a decision is made.
                    This usually takes 2-3 business days.
                  </p>
                </div>
              )}
              {application.status === "APPROVED" && (
                <div className="space-y-4">
                  <Badge className="bg-green-100 text-green-700">Approved</Badge>
                  <p className="text-muted-foreground">
                    You can now access your instructor dashboard and start creating courses!
                  </p>
                  <Button onClick={() => router.push("/instructor")}>
                    Go to Instructor Dashboard
                  </Button>
                </div>
              )}
              {application.status === "REJECTED" && (
                <div className="space-y-4">
                  <Badge className="bg-red-100 text-red-700">Rejected</Badge>
                  {application.reviewNotes && (
                    <div className="rounded-lg bg-muted p-4 text-left">
                      <p className="text-sm font-medium">Feedback from reviewer:</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {application.reviewNotes}
                      </p>
                    </div>
                  )}
                  <p className="text-muted-foreground">
                    You can submit a new application with updated information.
                  </p>
                  <Button
                    onClick={() => setApplication(null)}
                    variant="outline"
                  >
                    Submit New Application
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <GraduationCapIcon className="size-8 text-primary" />
          </div>
          <h1 className="mb-4 text-4xl font-bold">Become an Instructor</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Share your expertise with thousands of eager learners. Create courses,
            build your brand, and earn revenue while making a difference.
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <Card key={benefit.title}>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <benefit.icon className="size-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Instructor Application</CardTitle>
            <CardDescription>
              Tell us about yourself and what you'd like to teach
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bio">Short Bio *</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself in 2-3 sentences..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expertise">Areas of Expertise *</Label>
                <Textarea
                  id="expertise"
                  placeholder="What subjects are you an expert in? (e.g., Web Development, Data Science, Digital Marketing)"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Teaching/Professional Experience *</Label>
                <Textarea
                  id="experience"
                  placeholder="Describe your relevant experience (teaching, work, projects, certifications)..."
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseTopic">Proposed Course Topic *</Label>
                <Textarea
                  id="courseTopic"
                  placeholder="What would you like to teach? Describe your first course idea..."
                  value={formData.courseTopic}
                  onChange={(e) => setFormData({ ...formData, courseTopic: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="sampleVideo">Sample Video URL</Label>
                  <Input
                    id="sampleVideo"
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={formData.sampleVideo}
                    onChange={(e) => setFormData({ ...formData, sampleVideo: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Optional: Link to a teaching sample</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website/Portfolio</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://..."
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  By submitting this application, you agree to our instructor terms and
                  conditions. Our team will review your application and get back to you
                  within 2-3 business days.
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

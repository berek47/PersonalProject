import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AwardIcon,
  BookOpenIcon,
  GlobeIcon,
  HeartIcon,
  RocketIcon,
  TargetIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about BT Learn's mission to make quality education accessible to everyone around the world.",
};

const stats = [
  { label: "Active Learners", value: "500K+" },
  { label: "Expert Instructors", value: "1,000+" },
  { label: "Courses Available", value: "10,000+" },
  { label: "Countries Reached", value: "150+" },
];

const values = [
  {
    icon: TargetIcon,
    title: "Quality First",
    description:
      "Every course is carefully reviewed to ensure it meets our high standards for content and delivery.",
  },
  {
    icon: UsersIcon,
    title: "Community Driven",
    description:
      "We believe in the power of community. Learn together, grow together, succeed together.",
  },
  {
    icon: GlobeIcon,
    title: "Accessible Education",
    description:
      "Quality education should be available to everyone, regardless of location or background.",
  },
  {
    icon: ZapIcon,
    title: "Continuous Innovation",
    description:
      "We constantly evolve our platform to provide the best learning experience possible.",
  },
];

const team = [
  {
    name: "Sarah Johnson",
    role: "CEO & Founder",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  },
  {
    name: "Michael Chen",
    role: "CTO",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Content",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  },
  {
    name: "David Kim",
    role: "Head of Engineering",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
  },
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Empowering Learners{" "}
              <span className="text-primary">Worldwide</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              BT Learn was founded with a simple mission: to make quality
              education accessible to everyone. We believe that learning should
              be engaging, affordable, and available to all who seek it.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  BT Learn started in 2020 when a group of educators and
                  technologists came together with a shared vision: to
                  democratize education and make world-class learning accessible
                  to everyone.
                </p>
                <p>
                  What began as a small collection of courses has grown into a
                  thriving global learning community. Today, millions of
                  learners from over 150 countries use BT Learn to develop new
                  skills, advance their careers, and pursue their passions.
                </p>
                <p>
                  We partner with leading experts, universities, and companies
                  to create courses that are not just informative, but truly
                  transformative. Our commitment to quality means every course
                  is carefully curated and continuously improved based on
                  learner feedback.
                </p>
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
                alt="Team collaboration"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Our Values</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              These core values guide everything we do at BT Learn
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Card key={value.title} className="border-0 shadow-md">
                <CardHeader>
                  <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <value.icon className="size-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Meet Our Team</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              The passionate people behind BT Learn
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="relative mx-auto mb-4 size-32 overflow-hidden rounded-full">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20">
        {/* Gradient Orbs */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-slate-300">
            Join millions of learners who are already building the skills they
            need to succeed.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild className="shadow-lg shadow-primary/25">
              <Link href="/courses">Browse Courses</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/sign-up">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

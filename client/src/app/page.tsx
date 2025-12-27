import { getCategories } from "@/actions/categories";
import { getPublishedCourses } from "@/actions/courses";
import {
  AnimatedCounter,
  AnimatedGradientText,
  BlurIn,
  FadeIn,
  FadeInWhenVisible,
  FloatingElement,
  MorphingBlob,
  ScaleOnHover,
  SlideIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/motion";
import { CourseCard } from "@/components/courses/course-card";
import { Button } from "@/components/ui/button";
import { getServerSession } from "@/lib/get-session";
import {
  AwardIcon,
  BookOpenIcon,
  GraduationCapIcon,
  PlayCircleIcon,
  RocketIcon,
  SparklesIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession();
  const categories = await getCategories();
  const { courses: featuredCourses } = await getPublishedCourses({ limit: 4 });

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9ImN1cnJlbnRDb2xvciIgZmlsbC1vcGFjaXR5PSIwLjAzIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

        {/* Morphing Blobs */}
        <MorphingBlob className="left-10 top-20 h-72 w-72 bg-primary/20" />
        <MorphingBlob className="bottom-20 right-10 h-96 w-96 bg-accent/20" />

        {/* Floating Sparkles */}
        <FloatingElement className="absolute left-[15%] top-[20%]" duration={4} distance={15}>
          <div className="size-3 rounded-full bg-primary/40 blur-sm" />
        </FloatingElement>
        <FloatingElement className="absolute right-[20%] top-[30%]" duration={5} distance={20}>
          <div className="size-4 rounded-full bg-accent/40 blur-sm" />
        </FloatingElement>
        <FloatingElement className="absolute left-[30%] bottom-[25%]" duration={3.5} distance={12}>
          <div className="size-2 rounded-full bg-primary/50 blur-sm" />
        </FloatingElement>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <FadeIn delay={0.1}>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                  <SparklesIcon className="size-4 animate-pulse" />
                  Start learning today
                </div>
              </FadeIn>

              <BlurIn delay={0.2}>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Unlock Your{" "}
                  <AnimatedGradientText>Potential</AnimatedGradientText>
                </h1>
              </BlurIn>

              <FadeIn delay={0.4}>
                <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
                  Master new skills with expert-led courses. From programming to design,
                  find the perfect course to accelerate your career.
                </p>
              </FadeIn>

              <FadeIn delay={0.6}>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                  <ScaleOnHover>
                    <Button size="lg" asChild className="gap-2 shadow-lg shadow-primary/25">
                      <Link href="/courses">
                        <RocketIcon className="size-5" />
                        Explore Courses
                      </Link>
                    </Button>
                  </ScaleOnHover>
                  {!session?.user && (
                    <ScaleOnHover>
                      <Button size="lg" variant="outline" asChild>
                        <Link href="/sign-up">Create Free Account</Link>
                      </Button>
                    </ScaleOnHover>
                  )}
                  {session?.user && (
                    <ScaleOnHover>
                      <Button size="lg" variant="outline" asChild>
                        <Link href="/my-courses">Continue Learning</Link>
                      </Button>
                    </ScaleOnHover>
                  )}
                </div>
              </FadeIn>

              {/* Trust Indicators */}
              <FadeIn delay={0.8}>
                <div className="mt-12 flex flex-wrap items-center justify-center gap-8 lg:justify-start">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        >
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">10,000+</span> learners
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg
                        key={i}
                        className="size-5 fill-yellow-400 text-yellow-400 drop-shadow-sm"
                        viewBox="0 0 20 20"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">4.9/5</span> rating
                    </span>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Hero Image/Illustration */}
            <SlideIn direction="right" delay={0.3} className="relative hidden lg:block">
              <FloatingElement duration={6} distance={8}>
                <div className="relative mx-auto aspect-square max-w-md">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 blur-xl" />
                  <div className="absolute inset-4 rounded-2xl bg-card shadow-2xl">
                    <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
                      <div className="rounded-full bg-primary/10 p-6">
                        <GraduationCapIcon className="size-16 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">Learn Anywhere</p>
                        <p className="text-muted-foreground">On any device, anytime</p>
                      </div>
                      <div className="grid w-full grid-cols-2 gap-4">
                        <div className="rounded-lg bg-muted p-4 text-center">
                          <p className="text-2xl font-bold text-primary">50+</p>
                          <p className="text-xs text-muted-foreground">Courses</p>
                        </div>
                        <div className="rounded-lg bg-muted p-4 text-center">
                          <p className="text-2xl font-bold text-primary">100%</p>
                          <p className="text-xs text-muted-foreground">Online</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FloatingElement>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-2 gap-8 md:grid-cols-4" staggerDelay={0.15}>
            {[
              { label: "Active Students", value: 10000, suffix: "+", icon: UsersIcon },
              { label: "Expert Instructors", value: 50, suffix: "+", icon: AwardIcon },
              { label: "Video Hours", value: 500, suffix: "+", icon: PlayCircleIcon },
              { label: "Completion Rate", value: 94, suffix: "%", icon: TrendingUpIcon },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
                    <stat.icon className="size-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold">
                    <AnimatedCounter value={stat.value} />
                    {stat.suffix}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeInWhenVisible className="text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Browse by Category
              </h2>
              <p className="mt-4 text-muted-foreground">
                Find the perfect course in your area of interest
              </p>
            </FadeInWhenVisible>

            <StaggerContainer
              className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
              staggerDelay={0.1}
              delayChildren={0.2}
            >
              {categories.slice(0, 6).map((category, index) => {
                const icons = [
                  BookOpenIcon,
                  RocketIcon,
                  SparklesIcon,
                  TrendingUpIcon,
                  AwardIcon,
                  GraduationCapIcon,
                ];
                const Icon = icons[index % icons.length];
                return (
                  <StaggerItem key={category.id}>
                    <ScaleOnHover scale={1.05}>
                      <Link
                        href={`/courses?categoryId=${category.id}`}
                        className="group flex flex-col items-center gap-4 rounded-xl border bg-card p-6 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
                      >
                        <div className="rounded-full bg-primary/10 p-4 transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
                          <Icon className="size-8 text-primary transition-colors group-hover:text-primary-foreground" />
                        </div>
                        <span className="text-center font-medium">
                          {category.name}
                        </span>
                      </Link>
                    </ScaleOnHover>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* Featured Courses Section */}
      {featuredCourses.length > 0 && (
        <section className="bg-muted/50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeInWhenVisible>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-bold sm:text-4xl">
                    Featured Courses
                  </h2>
                  <p className="mt-4 text-muted-foreground">
                    Hand-picked courses to help you get started
                  </p>
                </div>
                <ScaleOnHover>
                  <Button variant="outline" asChild className="hidden sm:flex">
                    <Link href="/courses">View All Courses</Link>
                  </Button>
                </ScaleOnHover>
              </div>
            </FadeInWhenVisible>

            <StaggerContainer
              className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
              staggerDelay={0.1}
              delayChildren={0.3}
            >
              {featuredCourses.map((course) => (
                <StaggerItem key={course.id}>
                  <ScaleOnHover scale={1.02}>
                    <CourseCard course={course} />
                  </ScaleOnHover>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <FadeInWhenVisible className="mt-8 text-center sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/courses">View All Courses</Link>
              </Button>
            </FadeInWhenVisible>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Why Learn With Us?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to succeed in your learning journey
            </p>
          </FadeInWhenVisible>

          <StaggerContainer
            className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            staggerDelay={0.1}
            delayChildren={0.2}
          >
            {[
              {
                icon: PlayCircleIcon,
                title: "Learn at Your Pace",
                description:
                  "Access courses anytime, anywhere. Watch on your schedule and learn at a pace that works for you.",
              },
              {
                icon: AwardIcon,
                title: "Expert Instructors",
                description:
                  "Learn from industry professionals with real-world experience and proven teaching methods.",
              },
              {
                icon: GraduationCapIcon,
                title: "Earn Certificates",
                description:
                  "Complete courses and earn certificates to showcase your skills and boost your career.",
              },
              {
                icon: UsersIcon,
                title: "Community Support",
                description:
                  "Join a community of learners. Ask questions, share insights, and grow together.",
              },
              {
                icon: TrendingUpIcon,
                title: "Track Your Progress",
                description:
                  "Monitor your learning journey with detailed progress tracking and achievements.",
              },
              {
                icon: RocketIcon,
                title: "Career Advancement",
                description:
                  "Gain skills that employers value. Open doors to new opportunities and career growth.",
              },
            ].map((feature) => (
              <StaggerItem key={feature.title}>
                <ScaleOnHover scale={1.02}>
                  <div className="group relative rounded-2xl border bg-card p-8 transition-all hover:shadow-xl hover:shadow-primary/5">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative">
                      <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
                        <feature.icon className="size-6 text-primary transition-colors group-hover:text-primary-foreground" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </ScaleOnHover>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 py-16 sm:py-24">
        {/* Decorative Elements */}
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

        {/* Subtle Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9ImN1cnJlbnRDb2xvciIgZmlsbC1vcGFjaXR5PSIwLjAzIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

        <FadeInWhenVisible className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <SparklesIcon className="size-4" />
            Transform your career today
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Ready to Start Learning?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Join thousands of learners already building their future.
            Start your journey today.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <ScaleOnHover>
              <Button
                size="lg"
                asChild
                className="gap-2 shadow-lg shadow-primary/25"
              >
                <Link href="/courses">
                  <BookOpenIcon className="size-5" />
                  Browse Courses
                </Link>
              </Button>
            </ScaleOnHover>
            {!session?.user && (
              <ScaleOnHover>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                >
                  <Link href="/sign-up">Get Started Free</Link>
                </Button>
              </ScaleOnHover>
            )}
          </div>
        </FadeInWhenVisible>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <FadeIn delay={0.1}>
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
                  <GraduationCapIcon className="size-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">BT Learn</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <nav className="flex flex-wrap justify-center gap-6">
                <Link href="/courses" className="text-muted-foreground transition-colors hover:text-primary">
                  Courses
                </Link>
                <Link href="/about" className="text-muted-foreground transition-colors hover:text-primary">
                  About
                </Link>
                <Link href="/contact" className="text-muted-foreground transition-colors hover:text-primary">
                  Contact
                </Link>
                <Link href="/privacy" className="text-muted-foreground transition-colors hover:text-primary">
                  Privacy
                </Link>
              </nav>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} BT Learn. All rights reserved.
              </p>
            </FadeIn>
          </div>
        </div>
      </footer>
    </main>
  );
}

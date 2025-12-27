import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Get the first user to be the instructor (or create one if needed)
  let instructor = await prisma.user.findFirst({
    where: { role: "INSTRUCTOR" },
  });

  if (!instructor) {
    // Check if there's any user we can make an instructor
    const anyUser = await prisma.user.findFirst();
    if (anyUser) {
      instructor = await prisma.user.update({
        where: { id: anyUser.id },
        data: { role: "INSTRUCTOR" },
      });
      console.log(`✅ Updated user ${instructor.firstName} ${instructor.lastName} to INSTRUCTOR role`);
    }
  }

  if (!instructor) {
    console.log("❌ No users found. Creating a default instructor...");
    instructor = await prisma.user.create({
      data: {
        email: "instructor@learnhub.com",
        password: "$2a$10$rQnM.KfJKcKzBTW.EB7BxeZ8vC2V.N5E6n1kMVhF2r5c5L5r5r5r5", // hashed "password123"
        firstName: "John",
        lastName: "Doe",
        role: "INSTRUCTOR",
        bio: "Senior Software Engineer with 10+ years of experience teaching web development.",
      },
    });
    console.log(`✅ Created instructor: ${instructor.firstName} ${instructor.lastName}`);
  }

  console.log(`👤 Using instructor: ${instructor.firstName} ${instructor.lastName} (${instructor.email})`);

  // Create categories
  const categories = [
    { name: "Web Development", slug: "web-development", description: "Learn to build modern websites and web applications" },
    { name: "Mobile Development", slug: "mobile-development", description: "Build iOS and Android applications" },
    { name: "Data Science", slug: "data-science", description: "Analyze data and build machine learning models" },
    { name: "DevOps", slug: "devops", description: "Learn cloud computing, CI/CD, and infrastructure" },
    { name: "UI/UX Design", slug: "ui-ux-design", description: "Design beautiful and user-friendly interfaces" },
    { name: "Cybersecurity", slug: "cybersecurity", description: "Protect systems and networks from threats" },
  ];

  console.log("📁 Creating categories...");
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ Created ${categories.length} categories`);

  // Fetch created categories
  const webDev = await prisma.category.findUnique({ where: { slug: "web-development" } });
  const mobileDev = await prisma.category.findUnique({ where: { slug: "mobile-development" } });
  const dataScience = await prisma.category.findUnique({ where: { slug: "data-science" } });
  const devops = await prisma.category.findUnique({ where: { slug: "devops" } });
  const uiux = await prisma.category.findUnique({ where: { slug: "ui-ux-design" } });
  const security = await prisma.category.findUnique({ where: { slug: "cybersecurity" } });

  // Real courses with actual content
  const courses = [
    {
      title: "The Complete 2024 Web Development Bootcamp",
      slug: "complete-web-development-bootcamp",
      description: "Become a full-stack web developer with just ONE course. HTML, CSS, Javascript, Node, React, PostgreSQL, Web3 and DApps. This comprehensive course covers everything you need to know to become a professional web developer.",
      thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop",
      price: 84.99,
      categoryId: webDev?.id!,
      lessons: [
        { title: "Introduction to Web Development", slug: "intro-web-dev", content: "Welcome to the complete web development bootcamp! In this lesson, we'll cover what web development is and the technologies we'll learn.", duration: 15 },
        { title: "HTML Fundamentals", slug: "html-fundamentals", content: "Learn the building blocks of the web. HTML (HyperText Markup Language) is the standard markup language for creating web pages.", duration: 45 },
        { title: "CSS Styling Basics", slug: "css-basics", content: "Make your websites beautiful with CSS. Learn selectors, properties, the box model, and responsive design.", duration: 60 },
        { title: "JavaScript Essentials", slug: "javascript-essentials", content: "Add interactivity to your websites with JavaScript. Learn variables, functions, DOM manipulation, and events.", duration: 90 },
        { title: "React.js Introduction", slug: "react-intro", content: "Build modern user interfaces with React. Learn components, props, state, and hooks.", duration: 120 },
        { title: "Node.js & Express Backend", slug: "nodejs-express", content: "Create powerful backend APIs with Node.js and Express. Learn routing, middleware, and RESTful design.", duration: 90 },
        { title: "Database with PostgreSQL", slug: "postgresql-database", content: "Store and manage data with PostgreSQL. Learn SQL queries, relationships, and database design.", duration: 75 },
        { title: "Full-Stack Project", slug: "fullstack-project", content: "Put it all together by building a complete full-stack application from scratch.", duration: 180 },
      ],
    },
    {
      title: "React - The Complete Guide 2024",
      slug: "react-complete-guide",
      description: "Dive in and learn React.js from scratch! Learn React, Hooks, Redux, React Router, Next.js, Best Practices and way more!",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
      price: 94.99,
      categoryId: webDev?.id!,
      lessons: [
        { title: "What is React?", slug: "what-is-react", content: "Understanding React.js and why it's the most popular frontend library.", duration: 20 },
        { title: "React Components Deep Dive", slug: "react-components", content: "Master functional and class components, props, and component composition.", duration: 60 },
        { title: "State Management with Hooks", slug: "state-hooks", content: "Learn useState, useEffect, useContext, and custom hooks.", duration: 90 },
        { title: "Redux for State Management", slug: "redux-state", content: "Manage complex application state with Redux Toolkit.", duration: 75 },
        { title: "React Router v6", slug: "react-router", content: "Build single-page applications with client-side routing.", duration: 45 },
        { title: "Next.js Fundamentals", slug: "nextjs-fundamentals", content: "Server-side rendering and static site generation with Next.js.", duration: 120 },
      ],
    },
    {
      title: "Python for Data Science and Machine Learning",
      slug: "python-data-science-ml",
      description: "Learn how to use NumPy, Pandas, Seaborn, Matplotlib, Plotly, Scikit-Learn, Machine Learning, Tensorflow, and more!",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
      price: 129.99,
      categoryId: dataScience?.id!,
      lessons: [
        { title: "Python Crash Course", slug: "python-crash-course", content: "Quick refresher on Python fundamentals for data science.", duration: 60 },
        { title: "NumPy for Numerical Computing", slug: "numpy-computing", content: "Efficient numerical operations with NumPy arrays.", duration: 45 },
        { title: "Pandas for Data Analysis", slug: "pandas-analysis", content: "Data manipulation and analysis with Pandas DataFrames.", duration: 90 },
        { title: "Data Visualization", slug: "data-visualization", content: "Create beautiful visualizations with Matplotlib and Seaborn.", duration: 60 },
        { title: "Machine Learning with Scikit-Learn", slug: "sklearn-ml", content: "Build ML models: regression, classification, clustering.", duration: 120 },
        { title: "Deep Learning with TensorFlow", slug: "tensorflow-deep-learning", content: "Neural networks and deep learning fundamentals.", duration: 150 },
      ],
    },
    {
      title: "iOS & Swift - The Complete iOS App Development",
      slug: "ios-swift-development",
      description: "From Beginner to iOS App Developer with Just One Course! Fully Updated with a Comprehensive Module Dedicated to SwiftUI!",
      thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop",
      price: 99.99,
      categoryId: mobileDev?.id!,
      lessons: [
        { title: "Getting Started with Xcode", slug: "xcode-setup", content: "Set up your development environment and learn Xcode basics.", duration: 30 },
        { title: "Swift Programming Language", slug: "swift-basics", content: "Learn Swift syntax, variables, control flow, and functions.", duration: 90 },
        { title: "UIKit Fundamentals", slug: "uikit-fundamentals", content: "Build user interfaces with UIKit components.", duration: 75 },
        { title: "SwiftUI Modern Development", slug: "swiftui-modern", content: "Declarative UI development with SwiftUI.", duration: 120 },
        { title: "Networking & APIs", slug: "ios-networking", content: "Fetch data from REST APIs and handle JSON.", duration: 60 },
        { title: "Core Data & Persistence", slug: "core-data", content: "Save and manage local data with Core Data.", duration: 45 },
        { title: "Publishing to App Store", slug: "app-store-publishing", content: "Prepare and submit your app to the App Store.", duration: 30 },
      ],
    },
    {
      title: "Docker & Kubernetes: The Practical Guide",
      slug: "docker-kubernetes-guide",
      description: "Learn Docker, Docker Compose, Multi-Container Projects, Deployment and all about Kubernetes from the ground up!",
      thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=450&fit=crop",
      price: 89.99,
      categoryId: devops?.id!,
      lessons: [
        { title: "Docker Fundamentals", slug: "docker-fundamentals", content: "Understand containers, images, and the Docker ecosystem.", duration: 45 },
        { title: "Building Docker Images", slug: "building-images", content: "Create custom Docker images with Dockerfiles.", duration: 60 },
        { title: "Docker Compose", slug: "docker-compose", content: "Orchestrate multi-container applications.", duration: 45 },
        { title: "Kubernetes Architecture", slug: "k8s-architecture", content: "Understand pods, services, deployments, and more.", duration: 60 },
        { title: "Deploying to Kubernetes", slug: "k8s-deployment", content: "Deploy and scale applications on Kubernetes.", duration: 90 },
        { title: "CI/CD with Docker & K8s", slug: "cicd-docker-k8s", content: "Automate deployments with continuous integration.", duration: 75 },
      ],
    },
    {
      title: "Complete Figma UI/UX Design Masterclass",
      slug: "figma-ui-ux-masterclass",
      description: "Learn UI/UX Design from scratch. Master Figma, Design Systems, Prototyping, and land your dream design job!",
      thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop",
      price: 79.99,
      categoryId: uiux?.id!,
      lessons: [
        { title: "Introduction to UI/UX Design", slug: "intro-ui-ux", content: "Understand the principles of user interface and user experience design.", duration: 30 },
        { title: "Figma Interface Mastery", slug: "figma-interface", content: "Navigate Figma and learn all the essential tools.", duration: 45 },
        { title: "Design Fundamentals", slug: "design-fundamentals", content: "Color theory, typography, spacing, and visual hierarchy.", duration: 60 },
        { title: "Components & Design Systems", slug: "design-systems", content: "Build reusable components and maintain consistency.", duration: 75 },
        { title: "Prototyping & Interactions", slug: "prototyping", content: "Create interactive prototypes and animations.", duration: 60 },
        { title: "Real-World Project", slug: "design-project", content: "Design a complete mobile app from start to finish.", duration: 120 },
      ],
    },
    {
      title: "Ethical Hacking & Penetration Testing",
      slug: "ethical-hacking-pentest",
      description: "Learn ethical hacking, penetration testing, web hacking & wifi hacking using Kali Linux. Become a cybersecurity expert!",
      thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop",
      price: 119.99,
      categoryId: security?.id!,
      lessons: [
        { title: "Introduction to Ethical Hacking", slug: "intro-ethical-hacking", content: "Understand the ethical and legal aspects of penetration testing.", duration: 30 },
        { title: "Kali Linux Setup", slug: "kali-linux-setup", content: "Set up your hacking lab with Kali Linux.", duration: 45 },
        { title: "Network Scanning & Enumeration", slug: "network-scanning", content: "Discover hosts, services, and vulnerabilities.", duration: 60 },
        { title: "Web Application Hacking", slug: "web-app-hacking", content: "Find and exploit web vulnerabilities: SQL injection, XSS, etc.", duration: 90 },
        { title: "Wireless Network Hacking", slug: "wifi-hacking", content: "Crack WPA/WPA2 and understand wireless security.", duration: 60 },
        { title: "Post-Exploitation", slug: "post-exploitation", content: "Maintain access and cover your tracks.", duration: 45 },
      ],
    },
    {
      title: "JavaScript Algorithms and Data Structures",
      slug: "javascript-algorithms-ds",
      description: "Master the Coding Interview! Data Structures + Algorithms. This is the ultimate course to ace your coding interviews.",
      thumbnail: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop",
      price: 0,
      categoryId: webDev?.id!,
      lessons: [
        { title: "Big O Notation", slug: "big-o-notation", content: "Understand time and space complexity analysis.", duration: 45 },
        { title: "Arrays & Strings", slug: "arrays-strings", content: "Master array manipulation and string algorithms.", duration: 60 },
        { title: "Linked Lists", slug: "linked-lists", content: "Implement and traverse linked lists.", duration: 45 },
        { title: "Stacks & Queues", slug: "stacks-queues", content: "LIFO and FIFO data structures in action.", duration: 30 },
        { title: "Trees & Graphs", slug: "trees-graphs", content: "Binary trees, BST, BFS, and DFS algorithms.", duration: 90 },
        { title: "Sorting Algorithms", slug: "sorting-algorithms", content: "Quick sort, merge sort, and when to use each.", duration: 60 },
        { title: "Dynamic Programming", slug: "dynamic-programming", content: "Solve complex problems by breaking them down.", duration: 90 },
      ],
    },
  ];

  console.log("📚 Creating courses and lessons...");
  for (const courseData of courses) {
    const { lessons, ...course } = courseData;

    const existingCourse = await prisma.course.findUnique({
      where: { slug: course.slug },
    });

    if (existingCourse) {
      console.log(`⏭️  Course "${course.title}" already exists, skipping...`);
      continue;
    }

    const createdCourse = await prisma.course.create({
      data: {
        ...course,
        instructorId: instructor.id,
        status: "PUBLISHED",
      },
    });

    // Create lessons for this course
    for (let i = 0; i < lessons.length; i++) {
      await prisma.lesson.create({
        data: {
          ...lessons[i],
          courseId: createdCourse.id,
          order: i + 1,
          videoUrl: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`, // Placeholder
        },
      });
    }

    console.log(`✅ Created course: ${course.title} with ${lessons.length} lessons`);
  }

  console.log("\n🎉 Seed completed successfully!");
  console.log(`📊 Summary:`);

  const categoryCount = await prisma.category.count();
  const courseCount = await prisma.course.count();
  const lessonCount = await prisma.lesson.count();

  console.log(`   - Categories: ${categoryCount}`);
  console.log(`   - Courses: ${courseCount}`);
  console.log(`   - Lessons: ${lessonCount}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

// Use direct URL for seeding (more reliable than pooled connection)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("Starting seed...");

  // Get the first user to be the instructor (or create one if needed)
  let instructor = await prisma.user.findFirst({
    where: { role: "INSTRUCTOR" },
  });

  if (!instructor) {
    // Check if there's any user we can make an instructor
    instructor = await prisma.user.findFirst();
    if (instructor) {
      instructor = await prisma.user.update({
        where: { id: instructor.id },
        data: { role: "INSTRUCTOR" },
      });
      console.log(`Updated user ${instructor.name} to INSTRUCTOR role`);
    }
  }

  if (!instructor) {
    console.log("No users found. Please create a user first by signing up.");
    return;
  }

  console.log(`Using instructor: ${instructor.name} (${instructor.email})`);

  // Create categories
  const categories = [
    { name: "Web Development", slug: "web-development", description: "Learn to build modern websites and web applications" },
    { name: "Mobile Development", slug: "mobile-development", description: "Build iOS and Android applications" },
    { name: "Data Science", slug: "data-science", description: "Analyze data and build machine learning models" },
    { name: "DevOps", slug: "devops", description: "Learn cloud computing, CI/CD, and infrastructure" },
    { name: "UI/UX Design", slug: "ui-ux-design", description: "Design beautiful and user-friendly interfaces" },
    { name: "Cybersecurity", slug: "cybersecurity", description: "Protect systems and networks from threats" },
  ];

  console.log("Creating categories...");
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`Created ${categories.length} categories`);

  // Fetch created categories
  const webDev = await prisma.category.findUnique({ where: { slug: "web-development" } });
  const mobileDev = await prisma.category.findUnique({ where: { slug: "mobile-development" } });
  const dataScience = await prisma.category.findUnique({ where: { slug: "data-science" } });
  const devops = await prisma.category.findUnique({ where: { slug: "devops" } });
  const uiux = await prisma.category.findUnique({ where: { slug: "ui-ux-design" } });
  const security = await prisma.category.findUnique({ where: { slug: "cybersecurity" } });

  // Real courses with ACTUAL educational YouTube videos
  const courses = [
    {
      title: "The Complete 2024 Web Development Bootcamp",
      slug: "complete-web-development-bootcamp",
      description: "Become a full-stack web developer with just ONE course. HTML, CSS, Javascript, Node, React, PostgreSQL, Web3 and DApps. This comprehensive course covers everything you need to know to become a professional web developer.",
      thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop",
      price: 84.99,
      difficulty: "BEGINNER",
      categoryId: webDev?.id,
      lessons: [
        {
          title: "Introduction to Web Development",
          slug: "intro-web-dev",
          content: "Welcome to the complete web development bootcamp! In this lesson, we'll cover what web development is, the technologies we'll learn, and how the web works. You'll understand the difference between frontend and backend development.",
          videoUrl: "https://www.youtube.com/watch?v=ysEN5RaKOlA", // Fireship - How the Web Works
          duration: 12
        },
        {
          title: "HTML Fundamentals",
          slug: "html-fundamentals",
          content: "Learn the building blocks of the web. HTML (HyperText Markup Language) is the standard markup language for creating web pages. We'll cover all the essential tags, attributes, and semantic HTML5 elements.",
          videoUrl: "https://www.youtube.com/watch?v=UB1O30fR-EE", // Traversy Media - HTML Crash Course
          duration: 60
        },
        {
          title: "CSS Styling Basics",
          slug: "css-basics",
          content: "Make your websites beautiful with CSS. Learn selectors, properties, the box model, flexbox, CSS Grid, and responsive design principles.",
          videoUrl: "https://www.youtube.com/watch?v=yfoY53QXEnI", // Traversy Media - CSS Crash Course
          duration: 85
        },
        {
          title: "JavaScript Essentials",
          slug: "javascript-essentials",
          content: "Add interactivity to your websites with JavaScript. Learn variables, data types, functions, DOM manipulation, events, and ES6+ features.",
          videoUrl: "https://www.youtube.com/watch?v=hdI2bqOjy3c", // Traversy Media - JS Crash Course
          duration: 100
        },
        {
          title: "React.js Introduction",
          slug: "react-intro",
          content: "Build modern user interfaces with React. Learn components, props, state, hooks, and the React ecosystem.",
          videoUrl: "https://www.youtube.com/watch?v=LDB4uaJ87e0", // Traversy Media - React Crash Course 2024
          duration: 70
        },
        {
          title: "Node.js & Express Backend",
          slug: "nodejs-express",
          content: "Create powerful backend APIs with Node.js and Express. Learn routing, middleware, RESTful API design, and error handling.",
          videoUrl: "https://www.youtube.com/watch?v=Oe421EPjeBE", // freeCodeCamp - Node.js and Express
          duration: 480
        },
        {
          title: "Database with PostgreSQL",
          slug: "postgresql-database",
          content: "Store and manage data with PostgreSQL. Learn SQL queries, relationships, joins, and database design best practices.",
          videoUrl: "https://www.youtube.com/watch?v=qw--VYLpxG4", // freeCodeCamp - PostgreSQL Tutorial
          duration: 240
        },
        {
          title: "Full-Stack Project",
          slug: "fullstack-project",
          content: "Put it all together by building a complete full-stack application from scratch. We'll build a real-world project using everything you've learned.",
          videoUrl: "https://www.youtube.com/watch?v=ngc9gnGgUdA", // JavaScript Mastery - Full Stack
          duration: 180
        },
      ],
    },
    {
      title: "React - The Complete Guide 2024",
      slug: "react-complete-guide",
      description: "Dive in and learn React.js from scratch! Learn React, Hooks, Redux, React Router, Next.js, Best Practices and way more!",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
      price: 94.99,
      difficulty: "INTERMEDIATE",
      categoryId: webDev?.id,
      lessons: [
        {
          title: "What is React?",
          slug: "what-is-react",
          content: "Understanding React.js and why it's the most popular frontend library. Learn about virtual DOM, component-based architecture, and React's philosophy.",
          videoUrl: "https://www.youtube.com/watch?v=Tn6-PIqc4UM", // Fireship - React in 100 Seconds
          duration: 3
        },
        {
          title: "React Components Deep Dive",
          slug: "react-components",
          content: "Master functional components, props, children, and component composition patterns. Learn how to think in React.",
          videoUrl: "https://www.youtube.com/watch?v=S4VH8hddg8c", // Web Dev Simplified - React Components
          duration: 15
        },
        {
          title: "State Management with Hooks",
          slug: "state-hooks",
          content: "Learn useState, useEffect, useContext, useRef, useMemo, useCallback, and custom hooks.",
          videoUrl: "https://www.youtube.com/watch?v=O6P86uwfdR0", // Web Dev Simplified - React Hooks
          duration: 30
        },
        {
          title: "Redux for State Management",
          slug: "redux-state",
          content: "Manage complex application state with Redux Toolkit. Learn actions, reducers, store, and async operations.",
          videoUrl: "https://www.youtube.com/watch?v=iBUJVy8phqw", // Traversy Media - Redux Toolkit
          duration: 70
        },
        {
          title: "React Router v6",
          slug: "react-router",
          content: "Build single-page applications with client-side routing. Learn routes, navigation, params, and protected routes.",
          videoUrl: "https://www.youtube.com/watch?v=Ul3y1LXxzdU", // Web Dev Simplified - React Router
          duration: 40
        },
        {
          title: "Next.js Fundamentals",
          slug: "nextjs-fundamentals",
          content: "Server-side rendering and static site generation with Next.js. Learn pages, API routes, and deployment.",
          videoUrl: "https://www.youtube.com/watch?v=mTz0GXj8NN0", // Traversy Media - Next.js Crash Course
          duration: 60
        },
      ],
    },
    {
      title: "Python for Data Science and Machine Learning",
      slug: "python-data-science-ml",
      description: "Learn how to use NumPy, Pandas, Seaborn, Matplotlib, Plotly, Scikit-Learn, Machine Learning, Tensorflow, and more!",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
      price: 129.99,
      difficulty: "INTERMEDIATE",
      categoryId: dataScience?.id,
      lessons: [
        {
          title: "Python Crash Course",
          slug: "python-crash-course",
          content: "Quick refresher on Python fundamentals for data science. Learn variables, data types, functions, loops, and object-oriented programming.",
          videoUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw", // freeCodeCamp - Python Full Course
          duration: 260
        },
        {
          title: "NumPy for Numerical Computing",
          slug: "numpy-computing",
          content: "Efficient numerical operations with NumPy arrays. Learn array creation, manipulation, broadcasting, and vectorized operations.",
          videoUrl: "https://www.youtube.com/watch?v=QUT1VHiLmmI", // freeCodeCamp - NumPy Tutorial
          duration: 60
        },
        {
          title: "Pandas for Data Analysis",
          slug: "pandas-analysis",
          content: "Data manipulation and analysis with Pandas DataFrames. Learn data loading, cleaning, filtering, grouping, and merging.",
          videoUrl: "https://www.youtube.com/watch?v=vmEHCJofslg", // Keith Galli - Pandas Tutorial
          duration: 60
        },
        {
          title: "Data Visualization",
          slug: "data-visualization",
          content: "Create beautiful visualizations with Matplotlib and Seaborn. Learn line plots, bar charts, histograms, scatter plots, and heatmaps.",
          videoUrl: "https://www.youtube.com/watch?v=UO98lJQ3QGI", // Corey Schafer - Matplotlib
          duration: 35
        },
        {
          title: "Machine Learning with Scikit-Learn",
          slug: "sklearn-ml",
          content: "Build ML models: linear regression, logistic regression, decision trees, random forests, and model evaluation.",
          videoUrl: "https://www.youtube.com/watch?v=7eh4d6sabA0", // freeCodeCamp - Machine Learning Course
          duration: 540
        },
        {
          title: "Deep Learning with TensorFlow",
          slug: "tensorflow-deep-learning",
          content: "Neural networks and deep learning fundamentals. Build image classifiers, natural language models, and more.",
          videoUrl: "https://www.youtube.com/watch?v=tPYj3fFJGjk", // freeCodeCamp - TensorFlow 2.0
          duration: 420
        },
      ],
    },
    {
      title: "iOS & Swift - The Complete iOS App Development",
      slug: "ios-swift-development",
      description: "From Beginner to iOS App Developer with Just One Course! Fully Updated with a Comprehensive Module Dedicated to SwiftUI!",
      thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop",
      price: 99.99,
      difficulty: "BEGINNER",
      categoryId: mobileDev?.id,
      lessons: [
        {
          title: "Getting Started with Xcode",
          slug: "xcode-setup",
          content: "Set up your development environment and learn Xcode basics. Navigate the IDE, create projects, and use the simulator.",
          videoUrl: "https://www.youtube.com/watch?v=09TeUXjzpKs", // CodeWithChris - Xcode Tutorial
          duration: 25
        },
        {
          title: "Swift Programming Language",
          slug: "swift-basics",
          content: "Learn Swift syntax, variables, constants, control flow, functions, optionals, and object-oriented programming.",
          videoUrl: "https://www.youtube.com/watch?v=comQ1-x2a1Q", // freeCodeCamp - Swift Programming Tutorial
          duration: 210
        },
        {
          title: "UIKit Fundamentals",
          slug: "uikit-fundamentals",
          content: "Build user interfaces with UIKit components. Learn view controllers, table views, collection views, and auto layout.",
          videoUrl: "https://www.youtube.com/watch?v=iqpAP7s3b-8", // Sean Allen - UIKit Fundamentals
          duration: 45
        },
        {
          title: "SwiftUI Modern Development",
          slug: "swiftui-modern",
          content: "Declarative UI development with SwiftUI. Build modern, responsive interfaces with less code.",
          videoUrl: "https://www.youtube.com/watch?v=F2ojC6TNwws", // CodeWithChris - SwiftUI Tutorial
          duration: 60
        },
        {
          title: "Networking & APIs",
          slug: "ios-networking",
          content: "Fetch data from REST APIs and handle JSON. Learn URLSession, async/await, and Codable protocol.",
          videoUrl: "https://www.youtube.com/watch?v=MBCX1atOvdA", // Sean Allen - Networking in Swift
          duration: 30
        },
        {
          title: "Core Data & Persistence",
          slug: "core-data",
          content: "Save and manage local data with Core Data. Learn data modeling, CRUD operations, and data relationships.",
          videoUrl: "https://www.youtube.com/watch?v=O7u9nYWjvKk", // iOS Academy - Core Data
          duration: 45
        },
        {
          title: "Publishing to App Store",
          slug: "app-store-publishing",
          content: "Prepare and submit your app to the App Store. Learn about app signing, certificates, and App Store Connect.",
          videoUrl: "https://www.youtube.com/watch?v=p-LK5F2Iuo8", // CodeWithChris - App Store Tutorial
          duration: 20
        },
      ],
    },
    {
      title: "Docker & Kubernetes: The Practical Guide",
      slug: "docker-kubernetes-guide",
      description: "Learn Docker, Docker Compose, Multi-Container Projects, Deployment and all about Kubernetes from the ground up!",
      thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=450&fit=crop",
      price: 89.99,
      difficulty: "INTERMEDIATE",
      categoryId: devops?.id,
      lessons: [
        {
          title: "Docker Fundamentals",
          slug: "docker-fundamentals",
          content: "Understand containers, images, and the Docker ecosystem. Learn why Docker matters and how it solves deployment problems.",
          videoUrl: "https://www.youtube.com/watch?v=3c-iBn73dDE", // TechWorld with Nana - Docker Tutorial
          duration: 166
        },
        {
          title: "Building Docker Images",
          slug: "building-images",
          content: "Create custom Docker images with Dockerfiles. Learn best practices for efficient and secure images.",
          videoUrl: "https://www.youtube.com/watch?v=WmcdMiyqfZs", // TechWorld with Nana - Dockerfile Tutorial
          duration: 15
        },
        {
          title: "Docker Compose",
          slug: "docker-compose",
          content: "Orchestrate multi-container applications with Docker Compose. Define and run complex application stacks.",
          videoUrl: "https://www.youtube.com/watch?v=SXwC9fSwct8", // TechWorld with Nana - Docker Compose
          duration: 20
        },
        {
          title: "Kubernetes Architecture",
          slug: "k8s-architecture",
          content: "Understand pods, services, deployments, and the Kubernetes control plane. Learn how K8s manages containerized applications.",
          videoUrl: "https://www.youtube.com/watch?v=X48VuDVv0do", // TechWorld with Nana - Kubernetes Full Course
          duration: 240
        },
        {
          title: "Deploying to Kubernetes",
          slug: "k8s-deployment",
          content: "Deploy and scale applications on Kubernetes. Learn kubectl commands, YAML manifests, and rolling updates.",
          videoUrl: "https://www.youtube.com/watch?v=EQNO_kM96Mo", // TechWorld with Nana - K8s Deployment
          duration: 45
        },
        {
          title: "CI/CD with Docker & K8s",
          slug: "cicd-docker-k8s",
          content: "Automate deployments with continuous integration and delivery. Build CI/CD pipelines with GitHub Actions.",
          videoUrl: "https://www.youtube.com/watch?v=R8_veQiYBjI", // TechWorld with Nana - CI/CD Tutorial
          duration: 60
        },
      ],
    },
    {
      title: "Complete Figma UI/UX Design Masterclass",
      slug: "figma-ui-ux-masterclass",
      description: "Learn UI/UX Design from scratch. Master Figma, Design Systems, Prototyping, and land your dream design job!",
      thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop",
      price: 79.99,
      difficulty: "BEGINNER",
      categoryId: uiux?.id,
      lessons: [
        {
          title: "Introduction to UI/UX Design",
          slug: "intro-ui-ux",
          content: "Understand the principles of user interface and user experience design. Learn the difference between UI and UX.",
          videoUrl: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU", // Flux Academy - UI/UX Design
          duration: 12
        },
        {
          title: "Figma Interface Mastery",
          slug: "figma-interface",
          content: "Navigate Figma and learn all the essential tools. Master frames, layers, shapes, and the toolbar.",
          videoUrl: "https://www.youtube.com/watch?v=FTFaQWZBqQ8", // Figma - Getting Started
          duration: 20
        },
        {
          title: "Design Fundamentals",
          slug: "design-fundamentals",
          content: "Color theory, typography, spacing, and visual hierarchy. Learn the core principles that make designs look professional.",
          videoUrl: "https://www.youtube.com/watch?v=_Hp_dI0DzY4", // Juxtopposed - UI Design Fundamentals
          duration: 15
        },
        {
          title: "Components & Design Systems",
          slug: "design-systems",
          content: "Build reusable components and maintain consistency with design systems. Learn variants, auto layout, and tokens.",
          videoUrl: "https://www.youtube.com/watch?v=k8y9SRPB78Q", // Figma - Components Tutorial
          duration: 25
        },
        {
          title: "Prototyping & Interactions",
          slug: "prototyping",
          content: "Create interactive prototypes and animations. Learn triggers, actions, smart animate, and user flows.",
          videoUrl: "https://www.youtube.com/watch?v=lTIeZ2ahEkQ", // Figma - Prototyping Basics
          duration: 30
        },
        {
          title: "Real-World Project",
          slug: "design-project",
          content: "Design a complete mobile app from start to finish. Apply everything you've learned in a portfolio-worthy project.",
          videoUrl: "https://www.youtube.com/watch?v=5IanQIwhA4E", // DesignCode - Figma App Design
          duration: 120
        },
      ],
    },
    {
      title: "Ethical Hacking & Penetration Testing",
      slug: "ethical-hacking-pentest",
      description: "Learn ethical hacking, penetration testing, web hacking & wifi hacking using Kali Linux. Become a cybersecurity expert!",
      thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop",
      price: 119.99,
      difficulty: "ADVANCED",
      categoryId: security?.id,
      lessons: [
        {
          title: "Introduction to Ethical Hacking",
          slug: "intro-ethical-hacking",
          content: "Understand the ethical and legal aspects of penetration testing. Learn about career paths in cybersecurity.",
          videoUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", // NetworkChuck - Ethical Hacking
          duration: 15
        },
        {
          title: "Kali Linux Setup",
          slug: "kali-linux-setup",
          content: "Set up your hacking lab with Kali Linux. Install and configure VirtualBox and essential tools.",
          videoUrl: "https://www.youtube.com/watch?v=lZAoFs75_cs", // NetworkChuck - Kali Linux Setup
          duration: 20
        },
        {
          title: "Network Scanning & Enumeration",
          slug: "network-scanning",
          content: "Discover hosts, services, and vulnerabilities with Nmap, Netcat, and other reconnaissance tools.",
          videoUrl: "https://www.youtube.com/watch?v=4t4kBkMsDbQ", // HackerSploit - Network Scanning
          duration: 45
        },
        {
          title: "Web Application Hacking",
          slug: "web-app-hacking",
          content: "Find and exploit web vulnerabilities: SQL injection, XSS, CSRF, and OWASP Top 10.",
          videoUrl: "https://www.youtube.com/watch?v=2_lswM1S264", // freeCodeCamp - Web Security
          duration: 135
        },
        {
          title: "Wireless Network Hacking",
          slug: "wifi-hacking",
          content: "Understand wireless security and learn about WPA/WPA2 vulnerabilities and testing methods.",
          videoUrl: "https://www.youtube.com/watch?v=hNe1zOPaCgE", // David Bombal - WiFi Hacking
          duration: 30
        },
        {
          title: "Post-Exploitation",
          slug: "post-exploitation",
          content: "Learn privilege escalation, persistence, and lateral movement techniques for comprehensive security testing.",
          videoUrl: "https://www.youtube.com/watch?v=WnN6dbos5u8", // TCM Security - Post Exploitation
          duration: 60
        },
      ],
    },
    {
      title: "JavaScript Algorithms and Data Structures",
      slug: "javascript-algorithms-ds",
      description: "Master the Coding Interview! Data Structures + Algorithms. This is the ultimate course to ace your coding interviews.",
      thumbnail: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop",
      price: 0,
      difficulty: "INTERMEDIATE",
      categoryId: webDev?.id,
      lessons: [
        {
          title: "Big O Notation",
          slug: "big-o-notation",
          content: "Understand time and space complexity analysis. Learn to analyze algorithm efficiency using Big O notation.",
          videoUrl: "https://www.youtube.com/watch?v=Mo4vesaut8g", // freeCodeCamp - Big O Notation
          duration: 120
        },
        {
          title: "Arrays & Strings",
          slug: "arrays-strings",
          content: "Master array manipulation and string algorithms. Learn two-pointer technique, sliding window, and common patterns.",
          videoUrl: "https://www.youtube.com/watch?v=oBt53YbR9Kk", // freeCodeCamp - Dynamic Programming (covers arrays)
          duration: 300
        },
        {
          title: "Linked Lists",
          slug: "linked-lists",
          content: "Implement and traverse linked lists. Learn singly linked, doubly linked, and circular linked lists.",
          videoUrl: "https://www.youtube.com/watch?v=njTh_OwMljA", // freeCodeCamp - Linked Lists
          duration: 20
        },
        {
          title: "Stacks & Queues",
          slug: "stacks-queues",
          content: "LIFO and FIFO data structures in action. Implement stacks and queues and solve related problems.",
          videoUrl: "https://www.youtube.com/watch?v=wjI1WNcIntg", // freeCodeCamp - Stacks and Queues
          duration: 20
        },
        {
          title: "Trees & Graphs",
          slug: "trees-graphs",
          content: "Binary trees, BST, BFS, and DFS algorithms. Learn tree traversal and graph algorithms.",
          videoUrl: "https://www.youtube.com/watch?v=fAAZixBzIAI", // freeCodeCamp - Binary Trees
          duration: 120
        },
        {
          title: "Sorting Algorithms",
          slug: "sorting-algorithms",
          content: "Quick sort, merge sort, heap sort, and when to use each. Understand sorting algorithm trade-offs.",
          videoUrl: "https://www.youtube.com/watch?v=pkkFqlG0Hds", // CS Dojo - Sorting Algorithms
          duration: 25
        },
        {
          title: "Dynamic Programming",
          slug: "dynamic-programming",
          content: "Solve complex problems by breaking them down. Master memoization and tabulation techniques.",
          videoUrl: "https://www.youtube.com/watch?v=oBt53YbR9Kk", // freeCodeCamp - Dynamic Programming
          duration: 300
        },
      ],
    },
  ];

  console.log("Creating courses and lessons...");
  for (const courseData of courses) {
    const { lessons, ...course } = courseData;

    const existingCourse = await prisma.course.findUnique({
      where: { slug: course.slug },
    });

    if (existingCourse) {
      // Update existing lessons with new video URLs and durations
      console.log(`Updating lessons for "${course.title}"...`);
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        await prisma.lesson.updateMany({
          where: {
            courseId: existingCourse.id,
            slug: lesson.slug
          },
          data: {
            videoUrl: lesson.videoUrl,
            duration: lesson.duration,
            content: lesson.content,
          },
        });
      }
      console.log(`Updated ${lessons.length} lessons for "${course.title}"`);
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
          title: lessons[i].title,
          slug: lessons[i].slug,
          content: lessons[i].content,
          videoUrl: lessons[i].videoUrl,
          duration: lessons[i].duration,
          courseId: createdCourse.id,
          order: i + 1,
          isPublished: true,
        },
      });
    }

    console.log(`Created course: ${course.title} with ${lessons.length} lessons`);
  }

  console.log("\nSeed completed successfully!");
  console.log(`Summary:`);

  const categoryCount = await prisma.category.count();
  const courseCount = await prisma.course.count();
  const lessonCount = await prisma.lesson.count();

  console.log(`   - Categories: ${categoryCount}`);
  console.log(`   - Courses: ${courseCount}`);
  console.log(`   - Lessons: ${lessonCount}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

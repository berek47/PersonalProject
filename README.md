# Learning Platform

A modern, full-stack learning management system (LMS) built with Next.js 15, Express.js, and PostgreSQL. This platform enables instructors to create and sell courses while providing students with an intuitive learning experience.

## Features

### For Students
- Browse and search courses by category, difficulty, and price
- Secure checkout with Stripe integration
- Track learning progress across enrolled courses
- Leave reviews and ratings for completed courses
- Responsive design for learning on any device

### For Instructors
- Apply to become an instructor
- Create and manage courses with rich content
- Add video lessons with drag-and-drop reordering
- View analytics: enrollments, revenue, and ratings
- Manage course status (draft, published, archived)

### For Administrators
- Review and approve instructor applications
- Manage users, courses, and categories
- Platform-wide analytics and insights
- Content moderation tools

## Tech Stack

### Frontend (Client)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Better Auth
- **Payments**: Stripe
- **Email**: Resend

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT

### Infrastructure
- **Client Hosting**: Vercel
- **Server Hosting**: Railway
- **Database**: Supabase
- **Email Service**: Resend
- **Payments**: Stripe

## Project Structure

```
learning-platform/
├── client/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App router pages and layouts
│   │   ├── components/    # Reusable UI components
│   │   ├── actions/       # Server actions
│   │   ├── lib/           # Utilities and configurations
│   │   └── hooks/         # Custom React hooks
│   ├── prisma/            # Database schema and migrations
│   └── public/            # Static assets
│
├── server/                 # Express.js backend API
│   ├── src/
│   │   ├── config/        # App configuration
│   │   ├── domain/        # Business entities and interfaces
│   │   ├── infrastructure/# Database and external services
│   │   ├── presentation/  # Controllers, routes, middleware
│   │   └── shared/        # Utilities and error handling
│   └── prisma/            # Database schema
│
└── docs/                   # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (or Supabase account)
- Stripe account (for payments)
- Resend account (for emails)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/berek47/PersonalProject.git
   cd PersonalProject
   ```

2. **Set up the client**
   ```bash
   cd client
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the server**
   ```bash
   cd ../server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize the database**
   ```bash
   cd client
   npx prisma generate
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Client
   cd client && npm run dev

   # Terminal 2 - Server
   cd server && npm run dev
   ```

6. **Open in browser**
   - Client: http://localhost:3000
   - Server API: http://localhost:4000

## Environment Variables

### Client (.env)
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
BETTER_AUTH_SECRET="your-64-char-secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@yourdomain.com"
```

### Server (.env)
```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://..."
JWT_SECRET="your-64-char-secret"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"
```

## Available Scripts

### Client
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma database GUI |

### Server
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (instructor)
- `PUT /api/courses/:id` - Update course (instructor)
- `DELETE /api/courses/:id` - Delete course (instructor)

### Enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments/my` - Get user's enrollments

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category (admin)

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

1. **Vercel (Client)**
   - Connect GitHub repo
   - Set root directory to `client`
   - Add environment variables
   - Deploy

2. **Railway (Server)**
   - Connect GitHub repo
   - Set root directory to `server`
   - Add environment variables
   - Deploy

3. **Configure DNS**
   - Point your domain to Vercel
   - Point API subdomain to Railway

## Security Features

- Password hashing with bcrypt
- JWT authentication with HTTP-only cookies
- CORS protection
- Rate limiting on sensitive endpoints
- Helmet security headers
- Input validation with Zod
- Role-based access control (RBAC)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Bereket Tadesse**
- Website: [berekettadesse.com](https://berekettadesse.com)
- GitHub: [@berek47](https://github.com/berek47)

---

Built with Next.js, Express, and Prisma

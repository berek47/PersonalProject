# Learning Management System (LMS) Backend

A complete Express.js backend built with Clean Architecture principles for a Learning Management System.

## Features

- **Clean Architecture**: Separation of concerns with domain, infrastructure, and presentation layers
- **User Authentication**: JWT-based authentication with cookie storage
- **Role-Based Access Control**: Three user roles (ADMIN, INSTRUCTOR, STUDENT)
- **Course Management**: Create, update, and manage courses with different statuses
- **Lesson System**: Organize lessons within courses with ordering
- **Enrollment Tracking**: Track student enrollments and progress
- **Review System**: Rate and review courses (1-5 stars)
- **Category Organization**: Organize courses by categories
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Logging**: Structured logging with Pino
- **Database**: PostgreSQL with Prisma ORM

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with bcryptjs
- **Validation**: Zod
- **Logging**: Pino
- **Security**: Helmet, CORS, express-rate-limit

## Project Structure

```
server/
├── src/
│   ├── config/                    # Configuration files
│   │   └── index.ts
│   ├── domain/                    # Business logic layer
│   │   ├── entities/              # Domain entities
│   │   │   ├── user.entity.ts
│   │   │   ├── course.entity.ts
│   │   │   ├── lesson.entity.ts
│   │   │   ├── enrollment.entity.ts
│   │   │   ├── review.entity.ts
│   │   │   └── category.entity.ts
│   │   └── repositories/          # Repository interfaces
│   ├── infrastructure/            # External services layer
│   │   ├── database/
│   │   │   ├── prisma.service.ts
│   │   │   └── repositories/      # Prisma implementations
│   │   └── services/
│   │       └── jwt.service.ts
│   ├── presentation/              # API layer
│   │   ├── controllers/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── rate-limit.middleware.ts
│   │   └── routes/
│   ├── shared/                    # Shared utilities
│   │   ├── errors/
│   │   │   └── app-error.ts
│   │   └── utils/
│   │       ├── logger.ts
│   │       ├── pagination.ts
│   │       └── slugify.ts
│   ├── app.ts                     # Express app setup
│   └── index.ts                   # Server entry point
├── prisma/
│   └── schema.prisma              # Prisma schema
├── .env.example                   # Environment variables example
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository and navigate to the server directory**

```bash
cd /Users/agent47/Desktop/Projectnew/learning-platform/server
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL="postgresql://user:password@localhost:5432/lms_db?schema=public"

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000
```

4. **Generate Prisma client**

```bash
npm run db:generate
```

5. **Run database migrations**

```bash
npm run db:migrate
```

6. **Start the development server**

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Users (Admin only)

- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Categories

- `GET /api/categories` - Get all categories (paginated)
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/slug/:slug` - Get category by slug
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Courses

- `GET /api/courses` - Get all courses (with filters)
- `GET /api/courses/my-courses` - Get instructor's courses
- `GET /api/courses/:id` - Get course by ID
- `GET /api/courses/slug/:slug` - Get course by slug
- `POST /api/courses` - Create course (Instructor/Admin)
- `PUT /api/courses/:id` - Update course (Instructor/Admin)
- `DELETE /api/courses/:id` - Delete course (Instructor/Admin)

### Lessons

- `GET /api/lessons/course/:courseId` - Get all lessons for a course
- `GET /api/lessons/:id` - Get lesson by ID
- `GET /api/lessons/course/:courseId/slug/:slug` - Get lesson by slug
- `POST /api/lessons/course/:courseId` - Create lesson (Instructor/Admin)
- `PUT /api/lessons/:id` - Update lesson (Instructor/Admin)
- `DELETE /api/lessons/:id` - Delete lesson (Instructor/Admin)
- `PUT /api/lessons/course/:courseId/reorder` - Reorder lessons (Instructor/Admin)

### Enrollments

- `GET /api/enrollments/my-enrollments` - Get current user's enrollments
- `GET /api/enrollments/course/:courseId` - Get course enrollments (Instructor/Admin)
- `GET /api/enrollments/:id` - Get enrollment by ID
- `POST /api/enrollments` - Create enrollment (enroll in a course)
- `PUT /api/enrollments/:id` - Update enrollment progress
- `DELETE /api/enrollments/:id` - Delete enrollment

### Reviews

- `GET /api/reviews/course/:courseId` - Get course reviews (paginated)
- `GET /api/reviews/:id` - Get review by ID
- `POST /api/reviews/course/:courseId` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## User Roles

- **STUDENT**: Can enroll in courses, track progress, and leave reviews
- **INSTRUCTOR**: Can create and manage their own courses and lessons
- **ADMIN**: Full access to all resources

## Course Status

- **DRAFT**: Course is being created (not visible to students)
- **PUBLISHED**: Course is available for enrollment
- **ARCHIVED**: Course is no longer accepting enrollments

## Rate Limiting

- Auth endpoints: 5 requests per 15 minutes
- Create endpoints: 10 requests per minute
- General API: 100 requests per minute

## Security Features

- Password hashing with bcryptjs
- JWT authentication with HTTP-only cookies
- Helmet for security headers
- CORS configuration
- Rate limiting
- Input validation with Zod
- SQL injection protection with Prisma

## Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and apply migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

## Build and Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [] // Optional validation errors
}
```

## Response Format

Successful responses follow this format:

```json
{
  "success": true,
  "message": "Optional success message",
  "data": {},
  "pagination": {} // For paginated endpoints
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 5000 |
| DATABASE_URL | PostgreSQL connection string | Required |
| JWT_SECRET | JWT signing secret | Required |
| JWT_EXPIRES_IN | JWT expiration time | 7d |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:3000 |

## License

ISC

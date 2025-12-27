# Quick Start Guide

## Setup in 5 Minutes

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Update the database URL in `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lms_db?schema=public"
JWT_SECRET=your-secret-key-here
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:5000`

## Test the API

### Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "INSTRUCTOR"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "instructor@example.com",
    "password": "password123"
  }'
```

### Create a Category (Admin only)

First, create an admin user, then:

```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Web Development",
    "description": "Learn web development"
  }'
```

### Create a Course (Instructor/Admin)

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Complete JavaScript Course",
    "description": "Learn JavaScript from scratch",
    "categoryId": "category-id-here",
    "price": 49.99,
    "status": "PUBLISHED"
  }'
```

### Get All Courses

```bash
curl http://localhost:5000/api/courses
```

## Database Schema Overview

### User
- id, email, password, firstName, lastName, role, avatar, bio
- Roles: ADMIN, INSTRUCTOR, STUDENT

### Course
- id, title, slug, description, thumbnail, price, status, instructorId, categoryId
- Status: DRAFT, PUBLISHED, ARCHIVED

### Lesson
- id, title, slug, content, videoUrl, duration, order, courseId

### Enrollment
- id, userId, courseId, progress, completedAt, enrolledAt

### Review
- id, rating (1-5), comment, userId, courseId

### Category
- id, name, slug, description

## Common Tasks

### Create Admin User

After registering, manually update the user role in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

Or use Prisma Studio:

```bash
npm run db:studio
```

### View Logs

The application uses Pino for structured logging. In development mode, logs are prettified.

### Reset Database

```bash
# Delete all data
npx prisma migrate reset

# Or drop and recreate
dropdb lms_db
createdb lms_db
npm run db:migrate
```

## Troubleshooting

### Port Already in Use

Change the port in `.env`:

```env
PORT=5001
```

### Database Connection Failed

Ensure PostgreSQL is running:

```bash
# macOS (Homebrew)
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Check connection
psql -U postgres -h localhost
```

### Prisma Client Not Generated

```bash
npm run db:generate
```

### JWT Secret Missing

Make sure `JWT_SECRET` is set in `.env`

## Next Steps

1. Implement file upload for course thumbnails and lesson videos
2. Add email verification
3. Implement forgot password functionality
4. Add course categories filters
5. Create course preview system
6. Add course completion certificates
7. Implement payment integration
8. Add search functionality
9. Create analytics dashboard
10. Add real-time notifications

## API Documentation

Visit `http://localhost:5000/health` to verify the server is running.

For detailed API documentation, see README.md

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Build the project: `npm run build`
3. Run migrations: `npm run db:migrate`
4. Start server: `npm start`

Make sure to:
- Use strong JWT secret
- Enable HTTPS
- Set secure CORS origins
- Configure rate limiting appropriately
- Set up proper logging and monitoring
- Use environment-specific database

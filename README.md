# Student Registration Management System

Vanilla JavaScript frontend with a PHP 8.x API and MongoDB backend.

## Prerequisites

- Node.js
- PHP 8.x
- MongoDB Server
- PHP MongoDB extension enabled

## Run Locally

1. Install frontend dependencies:
   `npm install`
2. Start MongoDB.
3. Start the PHP API:
   `npm run api`
4. In a second terminal, start the frontend:
   `npm run dev`
5. Open `http://localhost:3000`.

Default admin credentials:

- Username: `admin`
- Password: `admin123`

The PHP API seeds the `admin` and `students` collections automatically on first request.

## Environment

Optional PHP API environment variables:

- `MONGODB_URI`, default `mongodb://127.0.0.1:27017`
- `MONGODB_DATABASE`, default `student_registration_system`

Optional development server environment variable:

- `VITE_PHP_API_TARGET`, default `http://127.0.0.1:8000`

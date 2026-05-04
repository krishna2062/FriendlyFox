# FriendlyFox 🦊

A TikTok-like short-video social media platform built with React, Node.js, Express, and MongoDB.

## Features

- **Authentication** — Register/Login with JWT-based auth and bcrypt password hashing
- **Video Feed** — Vertical scrollable feed with auto-play (reverse chronological order)
- **Video Upload** — Upload short videos (MP4, WebM, MOV · max 50MB)
- **Likes & Comments** — Like/unlike videos and leave comments
- **User Profiles** — View and edit profiles, see user's videos
- **Mobile-first** — Responsive design optimized for mobile screens

## Tech Stack

| Layer       | Technology                  |
| ----------- | --------------------------- |
| Frontend    | React + Vite + Tailwind CSS |
| Backend     | Node.js + Express           |
| Database    | MongoDB + Mongoose          |
| Auth        | JWT + bcrypt                |
| Storage     | Local file storage          |
| Video       | HTML5 `<video>` element     |

## Project Structure

```
friendlyfox/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── CommentModal.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── VideoCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Feed.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Upload.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── server/                   # Express backend
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   └── Video.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── videos.js
│   ├── uploads/              # Video file storage
│   └── index.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- npm or yarn

### 1. Clone the repository

```bash
git clone <repo-url>
cd friendlyfox
```

### 2. Set up the backend

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

The server starts on `http://localhost:5000`.

### 3. Set up the frontend

```bash
cd client
npm install
npm run dev
```

The client starts on `http://localhost:5173` and proxies API requests to the backend.

### Environment Variables

Create a `server/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/friendlyfox
JWT_SECRET=your_jwt_secret_here_change_in_production
```

## API Endpoints

### Auth

| Method | Endpoint             | Auth | Description        |
| ------ | -------------------- | ---- | ------------------ |
| POST   | `/api/auth/register` | No   | Register new user  |
| POST   | `/api/auth/login`    | No   | Login              |

### Users

| Method | Endpoint             | Auth | Description        |
| ------ | -------------------- | ---- | ------------------ |
| GET    | `/api/users/:id`     | No   | Get user profile   |
| PUT    | `/api/users/update`  | Yes  | Update own profile |

### Videos

| Method | Endpoint                   | Auth | Description          |
| ------ | -------------------------- | ---- | -------------------- |
| POST   | `/api/videos/upload`       | Yes  | Upload a video       |
| GET    | `/api/videos/feed`         | No   | Get video feed       |
| GET    | `/api/videos/user/:userId` | No   | Get user's videos    |
| POST   | `/api/videos/:id/like`     | Yes  | Like/unlike a video  |
| POST   | `/api/videos/:id/comment`  | Yes  | Add a comment        |

## API Testing (Postman)

### 1. Register a user

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### 2. Login

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

Save the `token` from the response.

### 3. Upload a video

```
POST http://localhost:5000/api/videos/upload
Authorization: Bearer <your_token>
Content-Type: multipart/form-data

Form fields:
- video: <select a video file>
- caption: "My first video!"
```

### 4. Get feed

```
GET http://localhost:5000/api/videos/feed?page=1&limit=10
```

### 5. Like a video

```
POST http://localhost:5000/api/videos/<video_id>/like
Authorization: Bearer <your_token>
```

### 6. Comment on a video

```
POST http://localhost:5000/api/videos/<video_id>/comment
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "text": "Great video!"
}
```

## Database Schemas

### User
```json
{
  "_id": "ObjectId",
  "username": "string (unique, 3-30 chars)",
  "email": "string (unique)",
  "password": "string (hashed)",
  "bio": "string (max 200 chars)",
  "profilePic": "string (URL)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Video
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: User)",
  "videoUrl": "string",
  "caption": "string (max 300 chars)",
  "likes": ["ObjectId (ref: User)"],
  "comments": [{
    "userId": "ObjectId (ref: User)",
    "text": "string (max 500 chars)",
    "createdAt": "Date"
  }],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Deployment

| Component | Recommended Platform       |
| --------- | -------------------------- |
| Frontend  | Vercel / Netlify           |
| Backend   | Render / Railway           |
| Database  | MongoDB Atlas              |

For production deployment, update the frontend API base URL and configure CORS on the backend accordingly.

## Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 7-day expiry
- Input validation via express-validator
- Protected routes with auth middleware
- Environment variables for secrets

# 📺 VideoTube — Backend

A production-ready, feature-rich **YouTube-clone backend** built with Node.js, Express, and MongoDB. This project covers everything from user authentication to video management, playlists, subscriptions, tweets, likes, comments, and a creator dashboard — all following REST API best practices.

> Built as part of [Chai aur Code](https://www.youtube.com/@chaiaurcode) by Hitesh Choudhary.

---

## 🔗 Live API

```
https://your-render-app.onrender.com/api/v1/healthcheck
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB Atlas |
| **ODM** | Mongoose |
| **Authentication** | JWT (Access + Refresh Tokens) |
| **File Storage** | Cloudinary |
| **File Uploads** | Multer |
| **Password Hashing** | Bcrypt |
| **API Pagination** | mongoose-aggregate-paginate-v2 |
| **Dev Tools** | Nodemon, Prettier |

---

## ✨ Features

- 🔐 **JWT Authentication** — Access token + Refresh token flow with HTTP-only cookies
- 👤 **User Management** — Register, login, logout, update profile, avatar & cover image upload
- 📹 **Video Management** — Upload, update, delete, publish/unpublish videos with Cloudinary storage
- 💬 **Comments** — Add, edit, delete comments on videos with pagination
- ❤️ **Likes** — Toggle likes on videos, comments, and tweets
- 🔔 **Subscriptions** — Subscribe/unsubscribe to channels, view subscriber & subscription lists
- 🐦 **Tweets** — Create, update, delete short posts (community posts)
- 📋 **Playlists** — Create playlists, add/remove videos, update and delete playlists
- 📊 **Dashboard** — Channel stats (total views, subscribers, videos, likes) and video management
- 🏥 **Healthcheck** — Server status endpoint for monitoring
- 🛡️ **Authorization** — Owner-only access for update/delete operations on all resources
- 📄 **Pagination** — All list endpoints support page & limit query params

---

## 📁 Project Structure

```
chai-backend/
├── src/
│   ├── controllers/          # Business logic
│   │   ├── user.controller.js
│   │   ├── video.controller.js
│   │   ├── comment.controller.js
│   │   ├── like.controller.js
│   │   ├── subscription.controller.js
│   │   ├── tweet.controller.js
│   │   ├── playlist.controller.js
│   │   ├── dashboard.controller.js
│   │   └── healthcheck.controller.js
│   ├── models/               # Mongoose schemas
│   │   ├── user.model.js
│   │   ├── video.model.js
│   │   ├── comment.model.js
│   │   ├── like.model.js
│   │   ├── subscription.model.js
│   │   ├── tweet.model.js
│   │   └── playlist.model.js
│   ├── routes/               # Express routers
│   │   ├── user.routes.js
│   │   ├── video.routes.js
│   │   ├── comment.routes.js
│   │   ├── like.routes.js
│   │   ├── subscription.routes.js
│   │   ├── tweet.routes.js
│   │   ├── playlist.routes.js
│   │   ├── dashboard.routes.js
│   │   └── healthcheck.routes.js
│   ├── middlewares/
│   │   ├── auth.middleware.js    # JWT verification
│   │   └── multer.middleware.js  # File upload handling
│   ├── utils/
│   │   ├── ApiError.js           # Custom error class
│   │   ├── ApiResponse.js        # Standard response format
│   │   ├── asyncHandler.js       # Async try/catch wrapper
│   │   └── cloudinary.js         # Cloudinary upload helper
│   ├── db/
│   │   └── index.js              # MongoDB connection
│   ├── app.js                    # Express app setup
│   └── index.js                  # Server entry point
├── public/
│   └── temp/                     # Temporary file storage (multer)
├── .env.sample
├── .gitignore
├── .prettierrc
└── package.json
```

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the repository

```bash
git clone https://github.com/abhinawsingh8235/chai-backend.git
cd chai-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

```bash
cp .env.sample .env
```

Fill in all the values in `.env` (see [Environment Variables](#-environment-variables) section below).

### 4. Run the development server

```bash
npm run dev
```

Server will start at `http://localhost:8000`

### 5. Verify it's working

```
GET http://localhost:8000/api/v1/healthcheck
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=8000

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net

# CORS
CORS_ORIGIN=*

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📡 API Endpoints

Base URL: `/api/v1`

> 🔒 = Requires JWT authentication (Bearer token or cookie)

### 🏥 Healthcheck

| Method | Endpoint | Description |
|---|---|---|
| GET | `/healthcheck` | Server status check |

---

### 👤 Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/users/register` | ❌ | Register new user (avatar + coverImage upload) |
| POST | `/users/login` | ❌ | Login and get tokens |
| POST | `/users/logout` | 🔒 | Logout and clear cookies |
| POST | `/users/refresh-token` | ❌ | Get new access token using refresh token |
| GET | `/users/current-user` | 🔒 | Get logged-in user details |
| POST | `/users/change-password` | 🔒 | Change current password |
| PATCH | `/users/update-account` | 🔒 | Update fullName and email |
| PATCH | `/users/avatar` | 🔒 | Update profile avatar |
| PATCH | `/users/cover-image` | 🔒 | Update cover image |
| GET | `/users/c/:username` | 🔒 | Get channel profile with subscriber count |
| GET | `/users/history` | 🔒 | Get watch history |

---

### 📹 Videos

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/videos` | 🔒 | Get all videos (search, filter, sort, paginate) |
| POST | `/videos` | 🔒 | Publish a new video (videoFile + thumbnail upload) |
| GET | `/videos/:videoId` | 🔒 | Get video by ID (increments view count) |
| PATCH | `/videos/:videoId` | 🔒 | Update video title, description, or thumbnail |
| DELETE | `/videos/:videoId` | 🔒 | Delete video (owner only) |
| PATCH | `/videos/toggle/publish/:videoId` | 🔒 | Toggle publish/unpublish status |

**Query params for GET /videos:**
```
page, limit, query, sortBy, sortType, userId
```

---

### 💬 Comments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/comments/:videoId` | 🔒 | Get all comments on a video (paginated) |
| POST | `/comments/:videoId` | 🔒 | Add a comment to a video |
| PATCH | `/comments/c/:commentId` | 🔒 | Update a comment (owner only) |
| DELETE | `/comments/c/:commentId` | 🔒 | Delete a comment (owner only) |

---

### ❤️ Likes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/likes/toggle/v/:videoId` | 🔒 | Toggle like on a video |
| POST | `/likes/toggle/c/:commentId` | 🔒 | Toggle like on a comment |
| POST | `/likes/toggle/t/:tweetId` | 🔒 | Toggle like on a tweet |
| GET | `/likes/videos` | 🔒 | Get all videos liked by current user |

---

### 🔔 Subscriptions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/subscriptions/c/:channelId` | 🔒 | Toggle subscribe/unsubscribe to a channel |
| GET | `/subscriptions/c/:channelId` | 🔒 | Get list of channels a user has subscribed to |
| GET | `/subscriptions/u/:subscriberId` | 🔒 | Get list of subscribers of a channel |

---

### 🐦 Tweets

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/tweets` | 🔒 | Create a new tweet |
| GET | `/tweets/user/:userId` | 🔒 | Get all tweets of a user |
| PATCH | `/tweets/:tweetId` | 🔒 | Update a tweet (owner only) |
| DELETE | `/tweets/:tweetId` | 🔒 | Delete a tweet (owner only) |

---

### 📋 Playlists

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/playlists` | 🔒 | Create a new playlist |
| GET | `/playlists/:playlistId` | 🔒 | Get playlist by ID with all video details |
| PATCH | `/playlists/:playlistId` | 🔒 | Update playlist name/description (owner only) |
| DELETE | `/playlists/:playlistId` | 🔒 | Delete a playlist (owner only) |
| PATCH | `/playlists/add/:videoId/:playlistId` | 🔒 | Add a video to playlist |
| PATCH | `/playlists/remove/:videoId/:playlistId` | 🔒 | Remove a video from playlist |
| GET | `/playlists/user/:userId` | 🔒 | Get all playlists of a user |

---

### 📊 Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard/stats` | 🔒 | Get channel stats (views, subscribers, videos, likes) |
| GET | `/dashboard/videos` | 🔒 | Get all videos of logged-in channel with stats |

---

## ☁️ Deployment on Render

### 1. Push your code to GitHub

```bash
git add .
git commit -m "feat: complete backend implementation"
git push origin main
```

### 2. Create a new Web Service on Render

- Go to [render.com](https://render.com) → New → Web Service
- Connect your GitHub repository

### 3. Configure build settings

| Setting | Value |
|---|---|
| **Environment** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node -r dotenv/config --experimental-json-modules src/index.js` |

### 4. Add Environment Variables

In Render dashboard → Environment → Add all variables from your `.env` file.

### 5. Deploy

Click **Deploy Web Service**. Once deployed, test your live API:

```
GET https://your-app.onrender.com/api/v1/healthcheck
```

---

## 🧪 Testing with Postman

Import the base URL and test endpoints in this order:

1. `POST /users/register` — create a user
2. `POST /users/login` — get access token
3. `POST /videos` — upload a video
4. `GET /videos` — fetch all videos
5. `POST /likes/toggle/v/:videoId` — like a video
6. `POST /comments/:videoId` — add a comment
7. `GET /dashboard/stats` — check channel stats

---

## 👨‍💻 Author

**Abhinaw** — B.Tech CSE, Galgotias University

- GitHub: [@abhinawsingh8235](https://github.com/abhinawsingh8235)
- LinkedIn: [Abhinaw Singh](https://www.linkedin.com/in/abhinaw-singh-4b4658249/)

---

## 📄 License

This project is licensed under the **ISC License**.

# Full-Stack Node.js + Express + MongoDB Project

Complete backend covering Authentication, User Profiles, Real-time Chat, File Uploads, Payments, Admin Dashboard, and Deployment.

---

## Folder Structure

```
fullstack-project/
├── server.js              ← Entry point
├── package.json
├── .env.example           ← Copy this to .env and fill values
├── .gitignore
├── config/
│   ├── db.js              ← MongoDB connection
│   └── cloudinary.js      ← Cloudinary + Multer setup
├── middleware/
│   ├── auth.js            ← JWT protect + adminOnly guards
│   └── rateLimiter.js     ← Rate limiting
├── models/
│   ├── User.js
│   ├── Message.js
│   └── Transaction.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── chatController.js  ← REST + Socket.io
│   ├── uploadController.js
│   ├── paymentController.js
│   └── adminController.js
├── routes/
│   ├── auth.js
│   ├── user.js
│   ├── chat.js
│   ├── upload.js
│   ├── payment.js
│   └── admin.js
└── utils/
    └── logger.js
```

---

## Step-by-Step Setup in VS Code

### Step 1 — Install prerequisites

Download and install these before anything else:

- **Node.js** → https://nodejs.org (choose LTS version)
- **VS Code** → https://code.visualstudio.com
- **Git** → https://git-scm.com

Verify in terminal:
```bash
node -v     # should show v18+ or v20+
npm -v      # should show 9+
```

---

### Step 2 — Open the project in VS Code

1. Open VS Code
2. Click **File → Open Folder**
3. Select the `fullstack-project` folder
4. Open the integrated terminal: **Terminal → New Terminal** (or press `` Ctrl+` ``)

---

### Step 3 — Install dependencies

In the VS Code terminal, run:

```bash
npm install
```

This installs Express, Mongoose, JWT, bcrypt, Socket.io, Stripe, Multer, and all other packages.

---

### Step 4 — Set up environment variables

1. In VS Code, find `.env.example` in the file explorer
2. Right-click → **Copy**, then paste and rename it to `.env`
3. Fill in each value:

```env
PORT=5000
MONGO_URI=mongodb+srv://...      ← from MongoDB Atlas (see Step 5)
JWT_SECRET=make_this_a_long_random_string
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=...        ← from cloudinary.com
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
STRIPE_SECRET_KEY=sk_test_...    ← from stripe.com dashboard
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:3000
```

---

### Step 5 — Set up MongoDB Atlas (free cloud database)

1. Go to https://cloud.mongodb.com and create a free account
2. Click **Build a Database** → choose the free tier (M0)
3. Create a username and password (save these!)
4. Under **Network Access**, click **Add IP Address → Allow Access From Anywhere**
5. Click **Connect → Connect your application**
6. Copy the connection string — it looks like:
   `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`
7. Replace `<password>` with your password and paste it as `MONGO_URI` in your `.env`

---

### Step 6 — Run the server

```bash
npm run dev
```

You should see:
```
[timestamp] INFO: MongoDB connected
[timestamp] INFO: Server running on port 5000
```

If you see this, the server is working! 🎉

---

### Step 7 — Test the API with Thunder Client

1. In VS Code, click the **Extensions** icon (left sidebar)
2. Search for **Thunder Client** and install it
3. Click the Thunder Client icon in the sidebar
4. Test your endpoints:

**Signup:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/signup`
- Body (JSON):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

**Login:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/login`
- Body (JSON):
```json
{
  "email": "john@example.com",
  "password": "123456"
}
```
- Copy the `token` from the response

**Protected route (get your profile):**
- Method: `GET`
- URL: `http://localhost:5000/api/auth/me`
- Headers: `Authorization: Bearer YOUR_TOKEN_HERE`

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/signup | No | Register new user |
| POST | /api/auth/login | No | Login, get token |
| GET | /api/auth/logout | Yes | Logout |
| GET | /api/auth/me | Yes | Get current user |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/users/:id | Yes | Get user profile |
| PUT | /api/users/profile | Yes | Update name, bio, avatar |
| PUT | /api/users/change-password | Yes | Change password |
| DELETE | /api/users/delete | Yes | Delete account |

### Chat (REST)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/chat/:room | Yes | Get message history |

### Socket.io Events
| Event (emit) | Payload | Description |
|-------------|---------|-------------|
| join_room | `room` (string) | Join a chat room |
| send_message | `{ room, text }` | Send a message |
| typing | `{ room }` | Broadcast typing indicator |
| mark_read | `{ room }` | Mark messages as read |

| Event (listen) | Description |
|---------------|-------------|
| receive_message | New message in room |
| user_typing | Someone is typing |
| online_users | Updated list of online user IDs |

### Uploads
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/upload | Yes | Upload file (form-data, key: `file`) |
| DELETE | /api/upload/:publicId | Yes | Delete file |

### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/payments/create-checkout | Yes | Create Stripe checkout session |
| POST | /api/payments/webhook | No (Stripe signs it) | Stripe webhook |
| GET | /api/payments/history | Yes | Get transaction history |
| POST | /api/payments/refund | Yes | Request refund |

### Admin (admin role required)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/admin/users | Admin | List all users |
| PUT | /api/admin/users/:id/ban | Admin | Ban or unban user |
| DELETE | /api/admin/users/:id | Admin | Delete user |
| GET | /api/admin/analytics | Admin | Platform stats |

---

## Recommended VS Code Extensions

Install these from the Extensions panel (`Ctrl+Shift+X`):

- **Thunder Client** — test API endpoints without leaving VS Code
- **ESLint** — catch code errors as you type
- **Prettier** — auto-format your code
- **MongoDB for VS Code** — browse your database visually
- **DotENV** — syntax highlighting for .env files
- **GitLens** — supercharged Git inside VS Code

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `MongoServerError: bad auth` | Wrong password in MONGO_URI |
| `Cannot find module 'express'` | Run `npm install` again |
| `JWT malformed` | Make sure you send `Bearer TOKEN` in the Authorization header |
| `EADDRINUSE port 5000` | Change PORT in .env to 5001 |
| `Multer: unexpected field` | File upload key must be `file` in form-data |

---

## Production Deployment (Render.com — free tier)

1. Push code to GitHub (make sure `.env` is in `.gitignore`)
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Set **Start Command**: `node server.js`
5. Add all environment variables from your `.env`
6. Click **Deploy**

Your API will be live at `https://your-app.onrender.com` 🚀

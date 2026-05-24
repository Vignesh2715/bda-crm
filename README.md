# BDA CRM — Sales Pipeline Management System

A production-ready full-stack MERN application for managing leads, sales pipelines, follow-ups, tasks, and team performance — built for Business Development Associates and Sales Teams in manufacturing companies.

---

## 🚀 Features

- **JWT Authentication** with Role-Based Access Control (Admin / Manager / BDA)
- **Lead Management** — CRUD, search, filter, pagination, assignment
- **Kanban Pipeline** — Drag-and-drop status board (dnd-kit)
- **Communication Timeline** — Activity history per lead
- **Follow-Up Scheduler** — Today's, upcoming, and overdue follow-ups
- **Task Management** — Priority-based task assignment
- **Dashboard & Reports** — KPI cards, charts (Recharts), team leaderboard
- **AI Lead Insights** — Gemini API integration for lead scoring & recommendations
- **Notifications** — In-app notification center
- **Dark Mode** — Fully supported
- **Responsive Design** — Mobile & desktop

---

## 🛠 Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, TypeScript, Tailwind CSS, Vite |
| State     | TanStack Query (React Query)            |
| Charts    | Recharts                                |
| DnD       | dnd-kit                                 |
| Backend   | Node.js, Express.js                     |
| Database  | MongoDB Atlas, Mongoose                 |
| Auth      | JWT, bcryptjs                           |
| AI        | Google Gemini API                       |

---

## 📁 Folder Structure

```
bda-crm/
├── client/                 # React Frontend (Vite + TypeScript)
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       ├── context/        # Auth & Theme contexts
│       ├── services/       # Axios API service
│       ├── types/          # TypeScript interfaces
│       └── utils/          # Helpers, formatters
├── server/                 # Node.js + Express Backend
│   ├── controllers/        # Business logic
│   ├── routes/             # API route definitions
│   ├── models/             # Mongoose schemas
│   ├── middleware/         # Auth, error handling
│   ├── config/             # DB connection
│   └── utils/              # Seed script
└── package.json
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key (optional, for AI features)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/bda-crm.git
cd bda-crm
```

### 2. Install dependencies
```bash
# Install all (root + server + client)
npm run install:all

# Or individually:
cd server && npm install
cd ../client && npm install
```

### 3. Configure environment variables

**Server** — copy `server/.env.example` to `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/bda-crm
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key  # optional
NODE_ENV=development
```

**Client** — copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed the database
```bash
cd server
node utils/seed.js
```

This creates sample users, leads, activities, follow-ups, and tasks.

**Demo credentials:**
| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@bdacrm.com       | Admin@123   |
| Manager | manager@bdacrm.com     | Manager@123 |
| BDA     | bda@bdacrm.com         | Bda@123     |

### 5. Start development servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open http://localhost:5173

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint                    | Description       |
|--------|-----------------------------|-------------------|
| POST   | /api/auth/register          | Register user     |
| POST   | /api/auth/login             | Login             |
| GET    | /api/auth/me                | Get current user  |
| PUT    | /api/auth/profile           | Update profile    |
| PUT    | /api/auth/change-password   | Change password   |

### Leads
| Method | Endpoint                    | Description         |
|--------|-----------------------------|---------------------|
| GET    | /api/leads                  | List leads          |
| POST   | /api/leads                  | Create lead         |
| GET    | /api/leads/:id              | Get lead detail     |
| PUT    | /api/leads/:id              | Update lead         |
| DELETE | /api/leads/:id              | Archive lead        |
| PUT    | /api/leads/:id/assign       | Assign lead         |
| GET    | /api/leads/pipeline         | Get kanban data     |

### Activities
| Method | Endpoint                    | Description         |
|--------|-----------------------------|---------------------|
| GET    | /api/activities?leadId=:id  | Get lead activities |
| POST   | /api/activities             | Add activity        |
| PUT    | /api/activities/:id         | Update activity     |
| DELETE | /api/activities/:id         | Delete activity     |

### Follow-Ups
| Method | Endpoint                    | Description         |
|--------|-----------------------------|---------------------|
| GET    | /api/followups              | List follow-ups     |
| GET    | /api/followups/today        | Today's follow-ups  |
| POST   | /api/followups              | Schedule follow-up  |
| PUT    | /api/followups/:id          | Update follow-up    |
| DELETE | /api/followups/:id          | Delete follow-up    |

### Tasks
| Method | Endpoint                    | Description         |
|--------|-----------------------------|---------------------|
| GET    | /api/tasks                  | List tasks          |
| POST   | /api/tasks                  | Create task         |
| PUT    | /api/tasks/:id              | Update task         |
| DELETE | /api/tasks/:id              | Delete task         |

### Dashboard & AI
| Method | Endpoint                    | Description         |
|--------|-----------------------------|---------------------|
| GET    | /api/dashboard/stats        | Dashboard metrics   |
| POST   | /api/ai/insights/:leadId    | Generate AI insights|

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Push to GitHub, connect repo to Vercel
# Set VITE_API_URL=https://your-render-url.onrender.com/api
```

### Backend → Render
1. Push server to GitHub (or same repo)
2. Create a new Web Service on Render
3. Set environment variables (MONGO_URI, JWT_SECRET, CLIENT_URL, GEMINI_API_KEY)
4. Build command: `npm install`
5. Start command: `node index.js`

### Database → MongoDB Atlas
1. Create free cluster at mongodb.com/atlas
2. Add IP whitelist: `0.0.0.0/0`
3. Create database user
4. Copy connection string to `MONGO_URI`

---

## 🔐 Environment Variables Reference

| Variable         | Required | Description                          |
|------------------|----------|--------------------------------------|
| MONGO_URI        | ✅       | MongoDB Atlas connection string       |
| JWT_SECRET       | ✅       | Secret key for JWT signing (32+ chars)|
| JWT_EXPIRE       | ✅       | Token expiry (e.g., 7d)               |
| CLIENT_URL       | ✅       | Frontend URL for CORS                 |
| PORT             | ❌       | Server port (default: 5000)           |
| GEMINI_API_KEY   | ❌       | Google Gemini API key for AI features |
| NODE_ENV         | ❌       | development or production             |

---

## 📄 License

MIT License — free to use for personal and commercial projects.

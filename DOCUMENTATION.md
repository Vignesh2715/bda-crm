# BDA CRM — Technical Documentation

## 1. Abstract

BDA CRM is a full-stack web application designed for manufacturing companies to manage their sales pipeline, lead lifecycle, follow-ups, tasks, and team performance. It eliminates spreadsheet-based workflows by providing a centralized, role-aware platform with real-time pipeline visualization, communication tracking, AI-powered lead scoring, and analytics dashboards.

---

## 2. Problem Statement

Manufacturing companies managing B2B sales face critical operational challenges:

- **Fragmented Data**: Lead information scattered across Excel files, emails, and WhatsApp
- **Missed Follow-Ups**: No centralized reminder or scheduling system
- **No Pipeline Visibility**: Managers cannot see deal stages or team progress in real time
- **Poor Accountability**: No way to track which BDA worked on which lead
- **Low Conversion Rates**: Without structured workflows, qualified leads go cold
- **No Analytics**: Decisions made on intuition rather than data

---

## 3. Proposed Solution

BDA CRM provides a unified platform with:

- Role-based access for Admin, Manager, and BDA
- Full lead lifecycle management from New to Won/Lost
- Kanban-style sales pipeline with drag-and-drop
- Communication timeline for every lead
- Follow-up scheduling with overdue alerts
- Task assignment and tracking
- Recharts-powered dashboards with KPIs and team leaderboard
- AI-powered lead scoring using Google Gemini API
- Notification center with real-time updates

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Vercel)                       │
│  React 18 + TypeScript + Tailwind CSS + TanStack Query  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Dashboard │ │  Leads   │ │ Pipeline │ │ Reports  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS / REST API
┌───────────────────────▼─────────────────────────────────┐
│                    SERVER (Render)                       │
│  Node.js + Express.js                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Auth    │ │  Leads   │ │FollowUps │ │    AI    │  │
│  │  Routes  │ │Controller│ │Controller│ │Controller│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  Middleware: JWT Auth | Rate Limiting | Helmet | CORS   │
└───────────────────────┬─────────────────────────────────┘
                        │ Mongoose ODM
┌───────────────────────▼─────────────────────────────────┐
│                MongoDB Atlas (Cloud)                     │
│  Users | Leads | Activities | FollowUps | Tasks | Notifs│
└─────────────────────────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│              Google Gemini API (AI)                      │
│  Lead scoring | Priority rating | Next best action      │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Database Design

### Users Collection
```json
{
  "_id": "ObjectId",
  "name": "String (required)",
  "email": "String (unique, required)",
  "passwordHash": "String (bcrypt hashed)",
  "role": "Enum: admin | manager | bda",
  "phone": "String",
  "department": "String",
  "avatar": "String",
  "isActive": "Boolean (default: true)",
  "lastLogin": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Leads Collection
```json
{
  "_id": "ObjectId",
  "companyName": "String (required)",
  "contactPerson": "String (required)",
  "email": "String (required)",
  "phone": "String (required)",
  "industry": "String",
  "source": "Enum: Website | LinkedIn | Referral | Trade Show | Cold Calling | Email Campaign | Social Media | Other",
  "estimatedDealValue": "Number",
  "status": "Enum: New | Contacted | Qualified | Proposal Sent | Negotiation | Won | Lost",
  "assignedTo": "ObjectId (ref: User)",
  "notes": "String",
  "tags": "[String]",
  "aiScore": "Number",
  "aiInsights": "String (JSON)",
  "aiLastGeneratedAt": "Date",
  "isArchived": "Boolean",
  "createdAt": "Date"
}
```

### Activities Collection
```json
{
  "_id": "ObjectId",
  "leadId": "ObjectId (ref: Lead, required)",
  "activityType": "Enum: Phone Call | Email | Meeting | Product Demo | Proposal Sent | Follow-Up | Note | Status Change",
  "description": "String (required)",
  "outcome": "String",
  "performedBy": "ObjectId (ref: User, required)",
  "duration": "Number (minutes)",
  "createdAt": "Date"
}
```

### FollowUps Collection
```json
{
  "_id": "ObjectId",
  "leadId": "ObjectId (ref: Lead, required)",
  "scheduledDate": "Date (required)",
  "purpose": "String (required)",
  "remarks": "String",
  "outcome": "String",
  "status": "Enum: Pending | Completed | Missed | Rescheduled",
  "createdBy": "ObjectId (ref: User, required)",
  "completedAt": "Date",
  "createdAt": "Date"
}
```

### Tasks Collection
```json
{
  "_id": "ObjectId",
  "title": "String (required)",
  "description": "String",
  "taskType": "Enum: Call Client | Schedule Demo | Send Quotation | Follow-Up | Documentation | Other",
  "assignedTo": "ObjectId (ref: User, required)",
  "assignedBy": "ObjectId (ref: User, required)",
  "leadId": "ObjectId (ref: Lead)",
  "dueDate": "Date (required)",
  "priority": "Enum: Low | Medium | High",
  "status": "Enum: Pending | In Progress | Completed",
  "completedAt": "Date",
  "createdAt": "Date"
}
```

### Notifications Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: User, required)",
  "title": "String (required)",
  "message": "String (required)",
  "type": "Enum: lead_assigned | followup_reminder | followup_overdue | task_assigned | task_due | general",
  "relatedId": "ObjectId",
  "relatedModel": "String",
  "isRead": "Boolean (default: false)",
  "createdAt": "Date"
}
```

---

## 6. API Endpoints

| Method | Endpoint                       | Auth | Role            | Description                  |
|--------|--------------------------------|------|-----------------|------------------------------|
| POST   | /api/auth/register             | ❌   | —               | Register new user            |
| POST   | /api/auth/login                | ❌   | —               | Login and receive JWT        |
| GET    | /api/auth/me                   | ✅   | All             | Get authenticated user       |
| PUT    | /api/auth/profile              | ✅   | All             | Update profile               |
| PUT    | /api/auth/change-password      | ✅   | All             | Change password              |
| GET    | /api/users                     | ✅   | Admin, Manager  | List all users               |
| POST   | /api/users                     | ✅   | Admin           | Create user                  |
| PUT    | /api/users/:id                 | ✅   | Admin           | Update user                  |
| DELETE | /api/users/:id                 | ✅   | Admin           | Deactivate user              |
| GET    | /api/users/bdas                | ✅   | All             | List active BDAs             |
| GET    | /api/leads                     | ✅   | All             | List leads (filtered)        |
| POST   | /api/leads                     | ✅   | All             | Create lead                  |
| GET    | /api/leads/:id                 | ✅   | All             | Lead detail                  |
| PUT    | /api/leads/:id                 | ✅   | All             | Update lead                  |
| DELETE | /api/leads/:id                 | ✅   | Admin, Manager  | Archive lead                 |
| PUT    | /api/leads/:id/assign          | ✅   | Admin, Manager  | Assign lead to BDA           |
| GET    | /api/leads/pipeline            | ✅   | All             | Pipeline grouped by status   |
| GET    | /api/activities?leadId=:id     | ✅   | All             | Get activities for lead      |
| POST   | /api/activities                | ✅   | All             | Add activity                 |
| DELETE | /api/activities/:id            | ✅   | All             | Delete activity              |
| GET    | /api/followups                 | ✅   | All             | List follow-ups              |
| GET    | /api/followups/today           | ✅   | All             | Today's follow-ups           |
| POST   | /api/followups                 | ✅   | All             | Schedule follow-up           |
| PUT    | /api/followups/:id             | ✅   | All             | Update follow-up             |
| DELETE | /api/followups/:id             | ✅   | All             | Delete follow-up             |
| GET    | /api/tasks                     | ✅   | All             | List tasks                   |
| POST   | /api/tasks                     | ✅   | Admin, Manager  | Assign task                  |
| PUT    | /api/tasks/:id                 | ✅   | All             | Update task                  |
| DELETE | /api/tasks/:id                 | ✅   | Admin, Manager  | Delete task                  |
| GET    | /api/notifications             | ✅   | All             | Get notifications            |
| PUT    | /api/notifications/mark-all-read | ✅ | All             | Mark all as read             |
| PUT    | /api/notifications/:id/read    | ✅   | All             | Mark one as read             |
| GET    | /api/dashboard/stats           | ✅   | All             | Dashboard metrics & charts   |
| POST   | /api/ai/insights/:leadId       | ✅   | All             | Generate AI insights         |

---

## 7. Authentication Flow

```
1. User submits email + password → POST /api/auth/login
2. Server verifies credentials with bcrypt.compare()
3. If valid → generates JWT: jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
4. JWT returned to client
5. Client stores JWT in localStorage
6. Every subsequent request sends: Authorization: Bearer <token>
7. protect middleware: verifies token → attaches req.user
8. authorize middleware: checks req.user.role against allowed roles
9. Token expiry → 401 response → client clears localStorage → redirects to /login
```

---

## 8. Module Descriptions

### Authentication Module
Handles JWT-based stateless authentication. Passwords hashed with bcrypt (12 salt rounds). Tokens expire in 7 days. Role-based route protection via middleware.

### Lead Management Module
Full CRUD with text search indexes on companyName, contactPerson, email. Supports pagination (20 per page), multi-field filtering, and soft delete (isArchived). Auto-creates activity on status change.

### Sales Pipeline Module
Kanban board built with dnd-kit. Leads grouped by status server-side. Drag-end triggers optimistic UI update + API PATCH. Status transitions auto-create Activity records.

### Communication Timeline Module
Chronological activity feed per lead. Supports 8 activity types. Activities stored with performedBy reference. Displayed in reverse chronological order with emoji icons.

### Follow-Up Module
Scheduling system with date/time, purpose, status tracking. Overdue detection on the client side. "Today's Follow-Ups" endpoint uses date range query. Status transitions: Pending → Completed/Missed/Rescheduled.

### Task Management Module
Manager-to-BDA task assignment. Priority levels (Low/Medium/High). Overdue detection. Status progression: Pending → In Progress → Completed.

### Dashboard Module
MongoDB Aggregation Pipeline for:
- `$group` by source, status, and month
- `$lookup` for user details in team performance
- Real-time KPI calculation (conversion rate, revenue)

### AI Insights Module
Uses Google Gemini API (`gemini-pro` model). Prompt engineering includes lead details, communication history, and follow-up history. Structured JSON response parsed and stored back to lead document. Falls back to mock data if no API key.

---

## 9. AI Integration

### Implementation
- **Model**: Google Gemini Pro (`gemini-pro`)
- **Trigger**: "Generate AI Insights" button on Lead Detail page
- **Input**: Lead fields + last 20 activities + last 10 follow-ups
- **Output**: Structured JSON with 9 fields
- **Storage**: Results cached in lead.aiInsights field with timestamp

### Output Schema
```json
{
  "leadScore": 85,
  "priority": "High",
  "conversionProbability": 72,
  "summary": "...",
  "strengths": ["...", "..."],
  "risks": ["...", "..."],
  "nextBestAction": "...",
  "followUpRecommendation": "...",
  "talkingPoints": ["...", "...", "..."]
}
```

### Fallback
If `GEMINI_API_KEY` is not set, the system returns deterministic mock insights so the UI remains functional during development.

---

## 10. Security Measures

| Measure              | Implementation                                        |
|----------------------|-------------------------------------------------------|
| Password Hashing     | bcryptjs with 12 salt rounds                          |
| JWT Authentication   | Stateless tokens with 7-day expiry                    |
| Role Authorization   | Middleware enforcing admin/manager/bda scopes          |
| Rate Limiting        | express-rate-limit: 200 req/15min per IP              |
| HTTP Headers         | Helmet.js sets security headers                       |
| CORS                 | Restricted to CLIENT_URL origin                       |
| Input Validation     | Mongoose schema validation + required fields          |
| Soft Deletes         | isArchived/isActive flags instead of hard delete      |
| Token Storage        | localStorage (with XSS awareness)                    |

---

## 11. Deployment Architecture

```
GitHub Repository
       │
       ├──► Vercel (Frontend)
       │    - Vite build output (/dist)
       │    - SPA rewrite rules (vercel.json)
       │    - Env: VITE_API_URL
       │
       └──► Render (Backend)
            - Node.js web service
            - Auto-deploy on push
            - Env: MONGO_URI, JWT_SECRET, CLIENT_URL, GEMINI_API_KEY
                    │
                    └──► MongoDB Atlas
                         - M0 Free cluster
                         - Indexed collections
                         - Network access: 0.0.0.0/0
```

---

## 12. Future Enhancements

1. **Real-time Notifications** — WebSocket/SSE for instant updates
2. **Email Integration** — Send emails directly from lead timeline
3. **WhatsApp Integration** — Twilio API for follow-up reminders
4. **Mobile App** — React Native version for field BDAs
5. **Document Management** — Upload and attach PDFs (proposals, contracts)
6. **Advanced Analytics** — Custom date-range reports, exportable CSV
7. **CRM Integrations** — Sync with HubSpot, Salesforce
8. **Quotation Builder** — Generate formatted PDF quotations
9. **Multi-language** — i18n for regional languages
10. **Audit Trail** — Complete change log for compliance

---

## 13. Viva Questions & Answers

**Q1. What is MERN stack? Why did you choose it?**

MERN stands for MongoDB, Express.js, React, Node.js. It enables full-stack JavaScript development with a single language across frontend and backend. MongoDB's flexible document model suits CRM data with varying fields. React's component model enables complex UI like Kanban boards. Node.js provides high-performance non-blocking I/O for API requests.

**Q2. How does JWT authentication work in your application?**

Upon login, the server verifies credentials using bcrypt.compare(), then signs a JWT with `jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })`. The client stores this token in localStorage and attaches it as `Authorization: Bearer <token>` on every API request. The `protect` middleware verifies the token using `jwt.verify()` and attaches the user to `req.user`. If the token is expired or invalid, a 401 is returned and the client redirects to login.

**Q3. What is Role-Based Access Control and how is it implemented?**

RBAC restricts system access based on user roles. We have three roles: admin, manager, bda. The `authorize(...roles)` middleware checks `req.user.role` against allowed roles. For example, only admins can create users, only admins and managers can delete leads and assign them. BDAs can only see leads assigned to them (query filtered by `assignedTo: req.user._id`).

**Q4. Explain the Kanban pipeline implementation.**

The pipeline uses `@dnd-kit/core` and `@dnd-kit/sortable`. When a drag starts, `DragStartEvent` captures the lead ID. `findContainer()` identifies the current column by scanning each status array. On `DragEndEvent`, if the column changed, we optimistically update local state (React useState), then fire `api.put('/leads/:id', { status: newColumn })`. If the API call fails, TanStack Query invalidates the cache to refetch the correct state.

**Q5. How does TanStack Query improve performance?**

TanStack Query provides automatic caching, background refetching, and deduplication. Once `['leads']` is fetched, subsequent component renders use cached data instantly. `staleTime: 30000` prevents unnecessary refetches within 30 seconds. `keepPreviousData` on the leads table prevents content flicker during pagination. `invalidateQueries` is called after mutations to sync the cache.

**Q6. What MongoDB indexes did you create and why?**

- `Lead`: Text index on `{companyName, contactPerson, email}` for full-text search. Compound index on `{status, assignedTo}` for pipeline and BDA-filtered queries.
- `Activity`: Compound index on `{leadId, createdAt: -1}` for efficient chronological timeline queries.
- `FollowUp`: Indexes on `{scheduledDate, status}` for today's/overdue queries, `{createdBy, status}` for BDA-specific views.
- `Notification`: Index on `{userId, isRead, createdAt: -1}` for fast unread count queries.

**Q7. How does the AI insights feature work?**

When "Generate AI Insights" is clicked, the frontend calls `POST /api/ai/insights/:leadId`. The controller fetches the lead, its last 20 activities, and last 10 follow-ups, then constructs a detailed prompt for Google Gemini Pro. The prompt instructs the model to respond in strict JSON format with fields including leadScore, priority, conversionProbability, nextBestAction, etc. The response is parsed and saved back to the lead document's `aiInsights` field with a timestamp. If no API key is configured, mock data is returned.

**Q8. What is Mongoose and what are its advantages?**

Mongoose is an ODM (Object Document Mapper) for MongoDB. It provides schema definition with type validation, middleware hooks (pre-save for password hashing), virtual fields, and model methods (matchPassword). Mongoose adds structure to MongoDB's schemaless nature while retaining flexibility. It also handles population (joining documents), and provides query builders.

**Q9. Explain the dashboard aggregation pipeline.**

The dashboard uses MongoDB's `$group`, `$match`, and `$lookup` stages. For team performance: `$match` filters non-archived leads with assignedTo set, `$group` calculates total, won counts per user, `$lookup` joins the Users collection for names, `$project` calculates conversion rate percentage. For monthly trends: `$match` filters last 6 months, `$group` by `{year, month}` counts leads and won deals, `$sort` ensures chronological order.

**Q10. How is password security handled?**

Passwords are hashed using bcryptjs with 12 salt rounds before storage — never stored in plain text. A Mongoose `pre('save')` hook runs `bcrypt.hash()` only when `passwordHash` is modified. The `matchPassword()` method uses `bcrypt.compare()` for verification. The `toJSON()` method strips `passwordHash` from all API responses. JWT secrets are stored as environment variables, never in code.

**Q11. What is the difference between `useQuery` and `useMutation` in TanStack Query?**

`useQuery` is for data fetching — it manages loading/error states, caches results, and auto-refetches. `useMutation` is for data modification (POST/PUT/DELETE) — it doesn't cache but provides `onSuccess`/`onError` callbacks. After a mutation succeeds, we call `queryClient.invalidateQueries()` to tell useQuery caches to refetch. This pattern ensures the UI always reflects the latest server state.

**Q12. How do you handle CORS in your application?**

The `cors` middleware is configured with `{ origin: process.env.CLIENT_URL, credentials: true }`. This allows requests only from the configured frontend URL. In development, `CLIENT_URL=http://localhost:5173`. In production, it's set to the Vercel deployment URL. Preflight OPTIONS requests are handled automatically by the cors package.

**Q13. What are Helmet.js and express-rate-limit? Why use them?**

Helmet.js sets HTTP security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Content-Security-Policy`, etc. These protect against common web vulnerabilities like clickjacking and MIME sniffing. `express-rate-limit` limits each IP to 200 API requests per 15 minutes, preventing brute-force attacks and DDoS abuse.

**Q14. Explain the lead soft-delete mechanism.**

Rather than permanently deleting leads (which would break related activities, follow-ups, and reports), we set `isArchived: true`. All list queries include `{ isArchived: false }` in their filter. This preserves historical data integrity while hiding archived leads from normal views. The DELETE endpoint is restricted to admin/manager roles only.

**Q15. How does notification creation work?**

Notifications are created server-side when specific events occur: lead assignment (in leadController after `assignedTo` is set), task assignment (in taskController after task creation). The `Notification.create()` call runs after the main operation succeeds. The frontend `NotificationBell` component polls `GET /api/notifications` every 30 seconds using `refetchInterval: 30000` in useQuery. Unread count is displayed as a red badge.

**Q16. What is Tailwind CSS and how did you use it?**

Tailwind CSS is a utility-first CSS framework. Rather than writing custom CSS classes, we compose styles using utility classes directly in JSX: `className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary-600 text-white"`. We extended Tailwind's config with custom colors (primary palette, dark variants), animations (fadeIn, slideUp), and font families. The `dark:` variant enables dark mode styles.

**Q17. How is dark mode implemented?**

The `ThemeContext` reads from `localStorage` and `window.matchMedia('prefers-color-scheme: dark')` on initialization. Toggling sets `document.documentElement.classList.toggle('dark', isDark)`. Tailwind's `darkMode: 'class'` configuration enables the `dark:` prefix to apply alternative styles when the `dark` class is on the `<html>` element.

**Q18. What is the purpose of the seed script?**

The seed script (`server/utils/seed.js`) populates the database with realistic demo data: 5 users across all roles, 10 leads in various statuses from real Indian companies, activities showing communication history, pending/completed follow-ups, and tasks. This allows evaluators to immediately see all features working without manually entering data.

**Q19. How do you handle API errors in the frontend?**

Axios interceptors catch 401 responses globally and redirect to login after clearing localStorage. In components, `useMutation`'s `onError` callback receives the error and calls `toast.error(err.response?.data?.message || 'Fallback message')`. TanStack Query's `retry: 1` config retries failed queries once before showing error state.

**Q20. What is Vite and why is it used instead of Create React App?**

Vite is a modern build tool that uses native ES modules during development, eliminating the need to bundle code before serving. This gives near-instant server startup and Hot Module Replacement (HMR). For production, it uses Rollup for optimized bundling. Compared to CRA, Vite is 10-100x faster in dev, supports TypeScript natively, and has better tree-shaking.

**Q21. Explain the Mongoose `populate()` function.**

`populate()` performs a JOIN-like operation in Mongoose. When a document has an ObjectId reference (like `assignedTo: ObjectId`), `populate('assignedTo', 'name email avatar')` replaces the ObjectId with the actual User document, selecting only the specified fields. This avoids N+1 query problems by using MongoDB's `$lookup` internally. We use it in lead queries, activity queries, and follow-up queries.

**Q22. How is pagination implemented?**

The leads API accepts `page` (default: 1) and `limit` (default: 20) query params. Server-side: `skip = (page - 1) * limit`, then `Lead.find(query).skip(skip).limit(limit)`. `Promise.all` runs the find and `countDocuments` concurrently. The response includes `{ leads, total, page, pages: Math.ceil(total/limit) }`. The frontend renders Previous/Next buttons disabled when at boundaries.

**Q23. What security considerations apply to JWT storage in localStorage?**

localStorage is accessible to JavaScript and vulnerable to XSS attacks. Mitigations in this project: Helmet.js sets CSP headers to prevent XSS, all user inputs are sanitized by Mongoose schema types, and no `dangerouslySetInnerHTML` is used. An alternative is httpOnly cookies (immune to XSS but requires CSRF protection). For this B2B internal tool, localStorage with Helmet provides an acceptable security profile.

**Q24. How does the `protect` middleware work?**

```js
const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id).select('-passwordHash');
  if (!req.user?.isActive) return res.status(401).json({ message: 'Unauthorized' });
  next();
};
```
It extracts the Bearer token, verifies it cryptographically, fetches the user from DB (excluding password), checks if active, then calls `next()` to proceed to the controller.

**Q25. What were the major technical challenges and how did you solve them?**

1. **Drag-and-drop Kanban**: dnd-kit's sortable context requires unique IDs per item per container. We used lead `_id` as sortable IDs and `findContainer()` to locate which column owns a dragged card. Optimistic updates (setState before API call) made the UX feel instant.

2. **MongoDB Aggregation for Team Performance**: Joining leads with users required `$lookup` with `$unwind`. Calculating conversion rate in the aggregation using `$cond` and `$divide` avoided post-processing in JavaScript.

3. **AI Response Parsing**: Gemini sometimes wraps JSON in markdown code fences. We used regex `/\{[\s\S]*\}/` to extract the JSON block regardless of surrounding text.

4. **Role-filtered Data**: BDA users should only see their own leads, but managers/admins see all. We dynamically build the MongoDB query: `if (role === 'bda') query.assignedTo = req.user._id` before executing the find.

5. **Dark Mode Flash**: Initializing dark mode before React renders prevented the white flash by reading localStorage synchronously in ThemeContext's useState initializer.

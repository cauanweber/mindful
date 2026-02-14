# 🧠 Mindful

A **fullstack personal organizer** focused on **clarity and execution**, with authentication and a dashboard centered on four core blocks: **Diary**, **Tasks**, **Notes**, and **Weekly Goals**.

This project was built for portfolio purposes and daily personal use, highlighting practical expertise in **modern frontend development**, **well-structured backend architecture**, and **real database integration**, while maintaining clean, scalable code.

<p>
    <img src="https://img.shields.io/badge/Node-18%2B-339933?logo=node.js&logoColor=white" alt="Node 18+" />
    <img src="https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white" alt="Vite 7" />
    <img src="https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma&logoColor=white" alt="Prisma 6" />
    <img src="https://img.shields.io/badge/License-Attribution%20Required-0f766e" alt="Attribution Required License" />
</p>

## ✨ Features

* User authentication (Login & Register)
* Dashboard with modular sections (Diary, Tasks, Notes, Weekly Goals)
* Daily diary with one entry per day
* One-shot task management with due date and priority
* Weekly goals planning and completion tracking
* Free-form notes for timeless knowledge
* Personal progress panel derived from real usage data
* Drag and drop ordering for Tasks and Notes
* Persisted order in database (reload-safe)
* Responsive interface (Mobile First)
* Visual feedback with animations and toasts
* API error feedback surfaced in frontend
* Loading and empty states standardized across sections
* Accessibility polish (focus states, aria labels, aria-live toasts)

## ⚙️ Tech Stack

### Frontend

* React 19
* Vite 7
* TypeScript
* Tailwind CSS
* React Router DOM
* TanStack Query
* Axios
* Motion (animations)
* Lucide Icons

### Backend

* Node.js
* Express 5
* CORS
* TypeScript
* Prisma ORM
* JWT (JSON Web Token)
* BCrypt
* PostgreSQL

### Database

* PostgreSQL

### Infra / DevOps

* Docker
* Docker Compose
* Prisma Migrate
* ESLint
* Vitest (basic tests)

## 🧱 Architecture

The project follows a **modular and scalable architecture**, with a clear separation of responsibilities.

### Backend

```
src/
├─ lib/
│ ├─ auth.ts
│ ├─ prisma.ts
│ └─ validation.ts
├─ middleware/
│ ├─ auth.ts
│ ├─ error.ts
│ └─ rateLimit.ts
├─ routes/
│ ├─ auth.ts
│ ├─ diary.ts
│ ├─ tasks.ts
│ ├─ notes.ts
│ └─ weekly-goals.ts
├─ types/
│ └─ express.d.ts
└─ server.ts
```

* lib/ — core utilities (auth helpers, Prisma client, payload validation)
* middleware/ — authentication, global error handling, and rate limiting
* routes/ — domain routes (auth, diary, tasks, notes, weekly goals)
* types/ — type extensions (e.g. express.d.ts)
* server.ts — Express configuration, CORS, routes, health endpoint

### Frontend

```
src/
├─ components/
│ ├─ SectionState.tsx
│ └─ dashboard/
│   ├─ DashboardHeader.tsx
│   ├─ ProgressPanel.tsx
│   ├─ TaskItem.tsx
│   └─ NoteCard.tsx
├─ context/
│ ├─ AuthContext.tsx
│ └─ ToastContext.tsx
├─ hooks/
│ ├─ useIsMobile.ts
│ └─ useMediaQuery.ts
├─ layouts/
│ ├─ AppLayout.tsx
│ └─ AuthLayout.tsx
├─ pages/
│ ├─ Dashboard.tsx
│ ├─ Debug.tsx
│ ├─ Login.tsx
│ ├─ Register.tsx
│ └─ NotFound.tsx
├─ routes/
│ ├─ AppRoutes.tsx
│ └─ ProtectedRoute.tsx
├─ sections/
│ ├─ DiarySection.tsx
│ ├─ TasksSection.tsx
│ ├─ NotesSection.tsx
│ └─ WeeklyGoalsSection.tsx
├─ lib/
│ └─ queryClient.ts
├─ services/
│ ├─ auth.ts
│ ├─ http.ts
│ └─ dashboardQueries.ts
├─ types/
│ ├─ diary.ts
│ ├─ task.ts
│ ├─ note.ts
│ └─ weeklyGoal.ts
├─ utils/
│ └─ apiError.ts
├─ App.tsx
└─ main.tsx
```

* components/ — reusable UI states and dashboard-specific components
* context/ — authentication and global toast feedback
* hooks/ — responsive behavior helpers
* layouts/ — app shell and auth shell
* pages/ — main app pages
* routes/ — routing and protected navigation
* sections/ — functional dashboard modules
* services/ — HTTP and auth communication layer
* types/ — TypeScript domain models
* utils/ — frontend utility helpers
* App.tsx — app routes root
* main.tsx — React entry point

## 🚀 Running Locally

### Prerequisites

* Node.js 18+
* Git
* PostgreSQL (or Docker + Docker Compose)

### 1️⃣ Clone the repository

```bash
git clone https://github.com/cauanweber/mindful.git
cd mindful
```

### 2️⃣ Backend setup
```bash
cd server
npm install
```

Create `server/.env`:
```bash
PORT=3000            # API port
DATABASE_URL=...     # PostgreSQL connection string
JWT_SECRET=...       # secret key used to sign tokens
CORS_ORIGIN=...      # allowed frontend URL for the API
```

Initialize the database and start the API (Using Docker):
```bash
docker compose up -d        # starts PostgreSQL via Docker
npx prisma migrate deploy   # applies migrations
npx prisma generate         # generates Prisma Client
npm run dev                 # starts backend in development mode
```

Initialize the database and start the API (Using local PostgreSQL):
```bash
createdb mindful            # creates local PostgreSQL database
npx prisma migrate deploy   # applies migrations
npx prisma generate         # generates Prisma Client
npm run dev                 # starts backend in development mode
```

Choose only one of the options above.
The API will be available at:
```bash
http://localhost:3000
```

### 3️⃣ Frontend
```bash
cd app
npm install
```

Create `app/.env`:
```bash
VITE_API_URL=... # API base URL used by the frontend
```

Start the app:
```bash
npm run dev
```

The application will be available at:
```bash
http://localhost:5173
```

## 🚀 Run and test in production

### Backend (production)
```bash
cd server
npm install
npm run build
npm run start
```

API will be available at:
```bash
http://localhost:3000
```

### Frontend (production)
```bash
cd app
npm install
npm run build
npm run preview
```

The app will be available at:
```bash
http://localhost:4173
```

## End-to-end test
* Keep the backend running (`npm run start` in `server`)
* Run the frontend preview (`npm run preview` in `app`)
* Open `http://localhost:4173`
* Test login/register and all dashboard blocks (Diary, Tasks, Notes, Weekly Goals)

## Notes
* Portfolio-focused project: ready for local demos and simple deployments.
* Includes baseline hardening: payload validation, auth rate limiting, and CORS by environment.
* For real production use, it is recommended to add monitoring, audit logs, and security headers.

## License
No license file is defined yet. If you plan to publish publicly, add a `LICENSE` file.

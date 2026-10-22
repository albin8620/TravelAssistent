# 🧭 Travel Itinerary Maker

> **Category:** Lifestyle & Productivity · **Stack:** MongoDB, Express, React (Vite), Node.js

A travel planning app for building daily schedules and organizing trip logistics. Travelers plan personal trips day by day, and admins curate public destination templates and the locations behind them.

## Features

### 👤 User
- Sign up and log in with JWT auth
- Create **trips** with dates, travelers, budget, status and a cover image
- **Day-by-day schedule** generated from the trip dates; add timed activities (sightseeing, food, transport, stay…) and tick them off
- **Destinations**: build the route from curated locations or custom places
- **Logistics**: transport (flight/train/bus/car/ferry) and accommodation with booking refs and costs. Spend is compared against the budget.
- **Packing checklist** with quick suggestions and a progress bar
- **Explore** published templates and copy one into a new trip starting on any date

### 🛠️ Admin
- Dashboard stats: users, trips, locations, templates, and the most-used templates
- **Locations** CRUD (name, city, country, category, best time to visit, image)
- **Destination templates** CRUD with a per-day activity editor and publish/draft toggle
- **Users**: view all users and their trip counts, and promote or demote admins

## Data model

| Collection | Key fields |
|---|---|
| `User` | name, email, password (bcrypt), role `user \| admin` |
| `Trip` | owner, title, startDate, endDate, travelers, budget, status, `destinations[]`, `days[{date, title, activities[]}]`, `transport[]`, `stays[]`, `checklist[]`, fromTemplate |
| `Location` | name, city, country, category, description, imageUrl, bestTimeToVisit |
| `Template` | title, summary, location → Location, durationDays, tags, `days[{dayNumber, title, activities[]}]`, isPublished, timesUsed |

## Project structure

```
travel-itinerary-maker/
├── server/                 Express + Mongoose API
│   └── src/
│       ├── config/db.js
│       ├── models/         User, Trip, Location, Template
│       ├── controllers/    auth, trip, location, template, admin
│       ├── middleware/     JWT protect / adminOnly / optionalAuth
│       ├── routes/index.js
│       ├── utils/          error handling, day-range builder
│       ├── seed.js         admin + sample locations/templates
│       └── index.js
└── client/                 React + Vite SPA
    └── src/
        ├── context/AuthContext.jsx
        ├── pages/          Dashboard, NewTrip, TripDetail, Explore, TemplateView, Login, Register
        ├── pages/trip/     Schedule, Destinations, Logistics, Checklist, Settings tabs
        └── pages/admin/    Overview, Locations, Templates, Users
```

## Getting started

**Prerequisites:** Node.js 18+ and MongoDB, either local or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

```bash
cd travel-itinerary-maker
npm run install:all

# configure the API
cp server/.env.example server/.env   # then edit MONGO_URI / JWT_SECRET

# create the admin account + sample data
npm run seed

# run API (http://localhost:5000) and web app (http://localhost:5173)
npm run dev
```

Log in with the admin credentials from `server/.env` (defaults: `admin@travel.test` / `admin123`) to reach the **Admin** console, or sign up as a normal user to plan trips.

## API reference

All routes are prefixed with `/api`. 🔒 = requires `Authorization: Bearer <token>`, 👑 = admin only.

| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Create a user account |
| POST | `/auth/login` | Log in and get a JWT |
| GET | `/auth/me` 🔒 | Current user |
| GET | `/trips` 🔒 | List my trips (`?status=`) |
| POST | `/trips` 🔒 | Create a trip (days auto-generated) |
| POST | `/trips/from-template/:templateId` 🔒 | Copy a template into a new trip `{ startDate, title? }` |
| GET / PUT / DELETE | `/trips/:id` 🔒 | Read / update / delete my trip |
| GET | `/locations` | List locations (`?q=`, `?category=`) |
| POST / PUT / DELETE | `/locations/:id?` 👑 | Manage locations |
| GET | `/templates` | List published templates (admins: `?all=true`) |
| GET | `/templates/:id` | Template detail |
| POST / PUT / DELETE | `/templates/:id?` 👑 | Manage templates |
| GET | `/admin/stats` 👑 | Platform counts |
| GET | `/admin/users` 👑 | All users with trip counts |
| PATCH | `/admin/users/:id/role` 👑 | Set role `{ role: "user" \| "admin" }` |

## Notes
- Public sign-up always creates a `user`. Admins come from the seed script or are promoted by another admin.
- Changing a trip's dates rebuilds its schedule. Days still inside the new range keep their activities.
- Trips and templates are capped at 60 days.

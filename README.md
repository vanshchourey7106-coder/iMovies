# iMovies – Backend (MERN, no TypeScript)

## 1. Install once
- Node.js 18+  → https://nodejs.org
- MongoDB Community Server → https://www.mongodb.com/try/download/community  (or a free MongoDB Atlas URI)

## 2. Run the backend
```bash
cd IMovies/server
npm install
# edit .env  (set JWT_SECRET; MONGO_URI is already set for local MongoDB)
npm run seed     # creates admin + sample movies/theatre/shows
npm run dev      # API on http://localhost:5000
```
Check: open http://localhost:5000/api/health

Admin login (from .env): `admin@imovies.com` / `Admin@123`

## 3. Run the frontend (separate terminal - keep the backend running)
```bash
cd IMovies/client
npm install      # installs react-router-dom too
npm run dev      # http://localhost:5173
```
The frontend calls `/api/...`; `client/vite.config.js` proxies that to http://localhost:5000, so no CORS setup is needed in development.

Customer pages: `/`, `/movies/:id`, `/shows/:id`, `/checkout/:id`, `/bookings`, `/watchlist`, `/login`, `/register`
Admin pages: `/admin/login`, `/admin` (dashboard), `/admin/movies`, `/admin/theatres`, `/admin/shows`, `/admin/bookings`, `/admin/users`

## API summary  (base: /api)
| Area | Endpoints |
|---|---|
| Auth | POST /auth/register, /auth/login, /auth/logout · GET/PUT /auth/me |
| Admin | POST /admin/login · GET /admin/dashboard · GET /admin/users, /admin/users/:id · PUT/DELETE /admin/users/:id · GET /admin/bookings |
| Movies | GET /movies (?search&genre&language&status&sort&page&limit), GET /movies/:id · admin: POST, PUT, DELETE |
| Theatres | GET /theatres (?city), GET /theatres/:id · admin: POST, PUT, DELETE, POST/PUT/DELETE /theatres/:id/screens[/:screenId] |
| Shows | GET /shows (?movie&theatre&city&date), GET /shows/:id (seat map + availability) · admin: POST, PUT, DELETE |
| Bookings | POST /bookings (hold seats) · POST /bookings/:id/pay · GET /bookings/my · GET /bookings/:id · PUT /bookings/:id/cancel |
| Reviews | GET /reviews/movie/:movieId · POST /reviews · PUT/DELETE /reviews/:id |
| Favourites | GET /favourites?type · POST /favourites {movie,type} · DELETE /favourites/:movieId?type |

Auth: JWT is set as an httpOnly cookie and also returned in JSON. For Postman use header `Authorization: Bearer <token>`.

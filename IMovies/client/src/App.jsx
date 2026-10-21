import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import MovieDetails from './pages/MovieDetails'
import SeatSelection from './pages/SeatSelection'
import Checkout from './pages/Checkout'
import MyBookings from './pages/MyBookings'
import Watchlist from './pages/Watchlist'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AdminMovies from './pages/admin/AdminMovies'
import AdminTheatres from './pages/admin/AdminTheatres'
import AdminShows from './pages/admin/AdminShows'
import AdminUsers from './pages/admin/AdminUsers'
import AdminBookings from './pages/admin/AdminBookings'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* public */}
        <Route path="/" element={<Home />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/shows/:id" element={<SeatSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* customer only */}
        <Route path="/checkout/:id" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />

        {/* admin */}
        <Route path="/admin/login" element={<Login admin />} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="movies" element={<AdminMovies />} />
          <Route path="theatres" element={<AdminTheatres />} />
          <Route path="shows" element={<AdminShows />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<div className="center-msg">404 – Page not found</div>} />
      </Routes>
    </>
  )
}

import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const search = (e) => {
    e.preventDefault()
    navigate(q.trim() ? `/?search=${encodeURIComponent(q.trim())}` : '/')
  }

  return (
    <header className="navbar">
      <Link to="/" className="logo">i<span>Movies</span></Link>

      <form className="nav-search" onSubmit={search}>
        <input placeholder="Search movies…" value={q} onChange={(e) => setQ(e.target.value)} />
      </form>

      <nav className="nav-links">
        {user?.role === 'admin' ? (
          <NavLink to="/admin">Admin Panel</NavLink>
        ) : (
          user && (
            <>
              <NavLink to="/watchlist">My List</NavLink>
              <NavLink to="/bookings">My Bookings</NavLink>
            </>
          )
        )}
        {user ? (
          <>
            <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
            <button className="btn btn-ghost" onClick={async () => { await logout(); navigate('/') }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/register" className="btn">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  )
}

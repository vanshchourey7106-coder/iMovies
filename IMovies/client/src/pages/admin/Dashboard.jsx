import { useEffect, useState } from 'react'
import { api } from '../../api'
import { rupees } from '../../utils'

export default function Dashboard() {
  const [d, setD] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.get('/admin/dashboard').then(setD).catch((e) => setError(e.message)) }, [])

  if (error) return <div className="alert error">{error}</div>
  if (!d) return <div className="center-msg">Loading…</div>
  const { stats, topMovies, last7Days } = d
  const max = Math.max(1, ...last7Days.map((x) => x.revenue))
  const cards = [
    ['Revenue', rupees(stats.totalRevenue)], ['Tickets sold', stats.ticketsSold], ['Users', stats.users],
    ['Movies', stats.movies], ['Theatres', stats.theatres], ['Upcoming shows', stats.upcomingShows],
  ]

  return (
    <>
      <h1>Dashboard</h1>
      <div className="stat-grid">
        {cards.map(([k, v]) => <div key={k} className="card stat"><span className="muted">{k}</span><b>{v}</b></div>)}
      </div>

      <div className="two-col">
        <div className="card">
          <h3>Revenue – last 7 days</h3>
          {last7Days.length === 0 ? <p className="muted">No confirmed bookings yet.</p> : (
            <div className="bars">
              {last7Days.map((x) => (
                <div key={x.date} className="bar-col" title={`${x.bookings} bookings`}>
                  <div className="bar" style={{ height: `${(x.revenue / max) * 100}%` }} />
                  <small>{x.date.slice(5)}</small>
                  <small className="muted">{rupees(x.revenue)}</small>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <h3>Top movies</h3>
          {topMovies.length === 0 ? <p className="muted">No data yet.</p> : (
            <table><thead><tr><th>Movie</th><th>Tickets</th><th>Revenue</th></tr></thead>
              <tbody>{topMovies.map((m) => <tr key={m.movieId}><td>{m.title}</td><td>{m.tickets}</td><td>{rupees(m.revenue)}</td></tr>)}</tbody>
            </table>
          )}
          <h3>Bookings by status</h3>
          <div className="chips">
            {Object.entries(stats.bookingsByStatus).map(([k, v]) => <span key={k} className={`status ${k}`}>{k}: {v}</span>)}
          </div>
        </div>
      </div>
    </>
  )
}

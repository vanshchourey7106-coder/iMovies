import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { Poster } from '../components/MovieCard'
import { duration, fmtDate, fmtDateTime, fmtFullDate, fmtTime, rupees } from '../utils'

export default function MovieDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [movie, setMovie] = useState(null)
  const [shows, setShows] = useState([])
  const [reviews, setReviews] = useState([])
  const [saved, setSaved] = useState({ favourite: false, watchlist: false })
  const [day, setDay] = useState('')
  const [form, setForm] = useState({ rating: 5, comment: '' })
  const [error, setError] = useState('')

  const loadReviews = () => api.get(`/reviews/movie/${id}`).then((d) => setReviews(d.reviews))

  useEffect(() => {
    api.get(`/movies/${id}`).then((d) => setMovie(d.movie)).catch((e) => setError(e.message))
    api.get(`/shows?movie=${id}`).then((d) => setShows(d.shows)).catch(() => {})
    loadReviews().catch(() => {})
  }, [id])

  useEffect(() => {
    if (user?.role !== 'user') return
    api.get('/favourites').then((d) => {
      const mine = d.items.filter((i) => i.movie._id === id)
      setSaved({ favourite: mine.some((i) => i.type === 'favourite'), watchlist: mine.some((i) => i.type === 'watchlist') })
    }).catch(() => {})
  }, [id, user])

  // shows grouped by date, then by theatre
  const byDay = useMemo(() => {
    const days = {}
    shows.forEach((s) => {
      const key = new Date(s.startTime).toDateString()
      days[key] = days[key] || {}
      const t = s.theatre?._id
      days[key][t] = days[key][t] || { theatre: s.theatre, shows: [] }
      days[key][t].shows.push(s)
    })
    return days
  }, [shows])
  const dayKeys = Object.keys(byDay)
  const activeDay = day || dayKeys[0]

  const toggleSave = async (type) => {
    if (!user) return navigate('/login', { state: { from: `/movies/${id}` } })
    try {
      if (saved[type]) await api.del(`/favourites/${id}?type=${type}`)
      else await api.post('/favourites', { movie: id, type })
      setSaved((s) => ({ ...s, [type]: !s[type] }))
      toast(saved[type] ? 'Removed from your list' : 'Saved to your list')
    } catch (e) { toast(e.message, 'error') }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    try {
      await api.post('/reviews', { movie: id, ...form })
      toast('Review posted')
      setForm({ rating: 5, comment: '' })
      loadReviews()
      api.get(`/movies/${id}`).then((d) => setMovie(d.movie))
    } catch (err) { toast(err.message, 'error') }
  }

  const deleteReview = async (rid) => {
    try {
      await api.del(`/reviews/${rid}`)
      loadReviews()
      api.get(`/movies/${id}`).then((d) => setMovie(d.movie))
    } catch (err) { toast(err.message, 'error') }
  }

  if (error) return <div className="page"><div className="alert error">{error}</div></div>
  if (!movie) return <div className="center-msg">Loading…</div>

  return (
    <div className="page">
      <section className="details">
        <Poster movie={movie} className="details-poster" />
        <div>
          <h1>{movie.title}</h1>
          <div className="chips">
            {movie.averageRating > 0 && <span className="chip gold">★ {movie.averageRating} ({movie.ratingCount})</span>}
            <span className="chip">{movie.certificate}</span>
            <span className="chip">{duration(movie.duration)}</span>
            <span className="chip">{movie.language}</span>
            {movie.genre.map((g) => <span key={g} className="chip">{g}</span>)}
          </div>
          <p className="muted">Release date: {fmtFullDate(movie.releaseDate)}{movie.director && ` · Director: ${movie.director}`}</p>
          <p>{movie.description}</p>
          {movie.cast?.length > 0 && (
            <p><b>Cast:</b> {movie.cast.map((c) => (c.role ? `${c.name} (${c.role})` : c.name)).join(', ')}</p>
          )}
          <div className="row-gap">
            <button className={`btn ${saved.favourite ? '' : 'btn-ghost'}`} onClick={() => toggleSave('favourite')}>
              {saved.favourite ? '♥ Favourited' : '♡ Favourite'}
            </button>
            <button className={`btn ${saved.watchlist ? '' : 'btn-ghost'}`} onClick={() => toggleSave('watchlist')}>
              {saved.watchlist ? '✓ In watchlist' : '+ Watchlist'}
            </button>
            {movie.trailerUrl && <a className="btn btn-ghost" href={movie.trailerUrl} target="_blank" rel="noreferrer">▶ Trailer</a>}
          </div>
        </div>
      </section>

      <section>
        <h2>Showtimes</h2>
        {dayKeys.length === 0 ? (
          <p className="muted">{movie.status === 'upcoming' ? 'Bookings open soon. Add it to your watchlist to get notified.' : 'No shows scheduled yet.'}</p>
        ) : (
          <>
            <div className="tabs">
              {dayKeys.map((k) => (
                <button key={k} className={k === activeDay ? 'active' : ''} onClick={() => setDay(k)}>{fmtDate(k)}</button>
              ))}
            </div>
            {Object.values(byDay[activeDay]).map(({ theatre, shows: list }) => (
              <div key={theatre._id} className="card theatre-row">
                <div>
                  <b>{theatre.name}</b>
                  <p className="muted">{theatre.city}{theatre.address && ` · ${theatre.address}`}</p>
                </div>
                <div className="slots">
                  {list.map((s) => (
                    <Link key={s._id} to={`/shows/${s._id}`} className="slot" title={`From ${rupees(s.prices.Regular)} · ${s.screenName}`}>
                      {fmtTime(s.startTime)}
                      <small>{s.screenName}</small>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </section>

      <section>
        <h2>Reviews</h2>
        {user?.role === 'user' ? (
          <form className="card review-form" onSubmit={submitReview}>
            <div className="row-gap">
              <label>Your rating</label>
              <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}
              </select>
            </div>
            <textarea rows="3" placeholder="Share your thoughts…" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
            <button className="btn">Post review</button>
          </form>
        ) : !user && <p className="muted"><Link to="/login" state={{ from: `/movies/${id}` }}>Log in</Link> to write a review.</p>}

        {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r._id} className="card review">
            <div className="between">
              <b>{r.user?.name || 'User'}</b>
              <span className="gold">{'★'.repeat(r.rating)}<span className="dim">{'★'.repeat(5 - r.rating)}</span></span>
            </div>
            {r.comment && <p>{r.comment}</p>}
            <div className="between">
              <small className="muted">{fmtDateTime(r.createdAt)}</small>
              {(user?.role === 'admin' || user?._id === r.user?._id) && (
                <button className="link-btn danger" onClick={() => deleteReview(r._id)}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

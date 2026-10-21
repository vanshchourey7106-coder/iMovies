import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, qs } from '../api'
import MovieCard, { Poster } from '../components/MovieCard'
import { GENRES, LANGUAGES, duration } from '../utils'

export default function Home() {
  const [params, setParams] = useSearchParams()
  const search = params.get('search') || ''
  const status = params.get('status') || 'now_showing'
  const genre = params.get('genre') || ''
  const language = params.get('language') || ''

  const [movies, setMovies] = useState([])
  const [featured, setFeatured] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    value ? next.set(key, value) : next.delete(key)
    setParams(next)
  }

  useEffect(() => {
    setLoading(true)
    api
      .get(`/movies${qs({ search, status, genre, language, sort: 'rating', limit: 24 })}`)
      .then((d) => { setMovies(d.movies); setError('') })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [search, status, genre, language])

  useEffect(() => {
    api.get('/movies?status=now_showing&sort=rating&limit=1').then((d) => setFeatured(d.movies[0])).catch(() => {})
  }, [])

  return (
    <div className="page">
      {featured && !search && (
        <section className="hero">
          <div className="hero-text">
            <span className="tag">Featured</span>
            <h1>{featured.title}</h1>
            <p className="muted">
              {featured.genre.join(' • ')} · {featured.language} · {duration(featured.duration)}
            </p>
            <p className="hero-desc">{featured.description}</p>
            <Link className="btn btn-lg" to={`/movies/${featured._id}`}>Book tickets</Link>
          </div>
          <Poster movie={featured} className="hero-poster" />
        </section>
      )}

      <div className="toolbar">
        <div className="tabs">
          <button className={status === 'now_showing' ? 'active' : ''} onClick={() => setParam('status', '')}>Now Showing</button>
          <button className={status === 'upcoming' ? 'active' : ''} onClick={() => setParam('status', 'upcoming')}>Upcoming</button>
        </div>
        <div className="filters">
          <select value={genre} onChange={(e) => setParam('genre', e.target.value)}>
            <option value="">All genres</option>
            {GENRES.map((g) => <option key={g}>{g}</option>)}
          </select>
          <select value={language} onChange={(e) => setParam('language', e.target.value)}>
            <option value="">All languages</option>
            {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {search && <p className="muted">Results for “{search}”</p>}
      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <div className="center-msg">Loading movies…</div>
      ) : movies.length === 0 ? (
        <div className="center-msg">No movies found.</div>
      ) : (
        <div className="grid">{movies.map((m) => <MovieCard key={m._id} movie={m} />)}</div>
      )}
    </div>
  )
}

import { Link } from 'react-router-dom'
import { fmtFullDate } from '../utils'

export function Poster({ movie, className = '' }) {
  return movie.poster ? (
    <img className={`poster ${className}`} src={movie.poster} alt={movie.title} loading="lazy" />
  ) : (
    <div className={`poster poster-fallback ${className}`}><span>{movie.title?.[0]}</span></div>
  )
}

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movies/${movie._id}`} className="movie-card">
      <div className="poster-wrap">
        <Poster movie={movie} />
        {movie.averageRating > 0 && <span className="rating-pill">★ {movie.averageRating}</span>}
        {movie.status === 'upcoming' && <span className="soon-pill">Coming soon</span>}
      </div>
      <h3>{movie.title}</h3>
      <p className="muted">
        {movie.status === 'upcoming' ? fmtFullDate(movie.releaseDate) : movie.genre.slice(0, 2).join(' • ')}
      </p>
    </Link>
  )
}

import { useEffect, useState } from 'react'
import { api } from '../api'
import { useToast } from '../components/Toast'
import MovieCard from '../components/MovieCard'

export default function Watchlist() {
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [tab, setTab] = useState('watchlist')

  const load = () => api.get('/favourites').then((d) => setItems(d.items)).catch((e) => toast(e.message, 'error'))
  useEffect(() => { load() }, [])

  const remove = async (movieId, type) => {
    try { await api.del(`/favourites/${movieId}?type=${type}`); load() } catch (e) { toast(e.message, 'error') }
  }
  if (!items) return <div className="center-msg">Loading…</div>
  const list = items.filter((i) => i.type === tab)

  return (
    <div className="page">
      <h1>My List</h1>
      <div className="tabs">
        <button className={tab === 'watchlist' ? 'active' : ''} onClick={() => setTab('watchlist')}>Watchlist</button>
        <button className={tab === 'favourite' ? 'active' : ''} onClick={() => setTab('favourite')}>Favourites</button>
      </div>
      {list.length === 0 && <p className="muted">Nothing here yet.</p>}
      <div className="grid">
        {list.map((i) => (
          <div key={i._id}>
            <MovieCard movie={i.movie} />
            <button className="link-btn danger" onClick={() => remove(i.movie._id, i.type)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { api } from '../../api'
import { useToast } from '../../components/Toast'
import { fmtDateTime, rupees } from '../../utils'

export default function AdminShows() {
  const toast = useToast()
  const [movies, setMovies] = useState([])
  const [theatres, setTheatres] = useState([])
  const [shows, setShows] = useState([])
  const [form, setForm] = useState({ movie: '', theatre: '', screenId: '', startTime: '', Regular: 150, Premium: 250, Recliner: 400 })

  const loadShows = () => api.get('/shows').then((d) => setShows(d.shows)).catch((e) => toast(e.message, 'error'))
  useEffect(() => {
    api.get('/movies?limit=50&sort=newest').then((d) => setMovies(d.movies))
    api.get('/theatres').then((d) => setTheatres(d.theatres))
    loadShows()
  }, [])

  const theatre = theatres.find((t) => t._id === form.theatre)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value, ...(k === 'theatre' ? { screenId: '' } : {}) })

  const create = async (e) => {
    e.preventDefault()
    try {
      await api.post('/shows', {
        movie: form.movie, theatre: form.theatre, screenId: form.screenId,
        startTime: new Date(form.startTime).toISOString(),
        prices: { Regular: Number(form.Regular), Premium: Number(form.Premium), Recliner: Number(form.Recliner) },
      })
      toast('Show scheduled'); loadShows()
    } catch (err) { toast(err.message, 'error') }
  }

  const remove = async (s) => {
    if (!window.confirm('Delete this show?')) return
    try { await api.del(`/shows/${s._id}`); toast('Show deleted'); loadShows() } catch (e) { toast(e.message, 'error') }
  }

  return (
    <>
      <h1>Shows</h1>
      <form className="card form-grid" onSubmit={create}>
        <h3 className="span2">Schedule a show</h3>
        <select required value={form.movie} onChange={set('movie')}>
          <option value="">Select movie</option>{movies.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
        </select>
        <select required value={form.theatre} onChange={set('theatre')}>
          <option value="">Select theatre</option>{theatres.map((t) => <option key={t._id} value={t._id}>{t.name} – {t.city}</option>)}
        </select>
        <select required value={form.screenId} onChange={set('screenId')} disabled={!theatre}>
          <option value="">Select screen</option>{theatre?.screens.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <input type="datetime-local" required value={form.startTime} onChange={set('startTime')} />
        <label className="price-field">Regular ₹<input type="number" min="0" value={form.Regular} onChange={set('Regular')} /></label>
        <label className="price-field">Premium ₹<input type="number" min="0" value={form.Premium} onChange={set('Premium')} /></label>
        <label className="price-field">Recliner ₹<input type="number" min="0" value={form.Recliner} onChange={set('Recliner')} /></label>
        <div className="span2"><button className="btn">Create show</button></div>
      </form>

      <div className="card table-wrap">
        <h3>Upcoming shows</h3>
        <table>
          <thead><tr><th>Movie</th><th>Theatre</th><th>Screen</th><th>Time</th><th>Prices</th><th>Booked</th><th /></tr></thead>
          <tbody>
            {shows.map((s) => (
              <tr key={s._id}>
                <td>{s.movie?.title}</td><td>{s.theatre?.name}</td><td>{s.screenName}</td><td>{fmtDateTime(s.startTime)}</td>
                <td>{rupees(s.prices.Regular)} / {rupees(s.prices.Premium)} / {rupees(s.prices.Recliner)}</td>
                <td>{s.bookedCount}</td>
                <td className="actions"><button className="link-btn danger" onClick={() => remove(s)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {shows.length === 0 && <p className="muted">No upcoming shows.</p>}
      </div>
    </>
  )
}

import { useEffect, useState } from 'react'
import { api } from '../../api'
import { useToast } from '../../components/Toast'
import { fmtFullDate } from '../../utils'

const EMPTY = { title: '', description: '', genre: '', language: 'English', duration: 120, certificate: 'UA', director: '', cast: '', releaseDate: '', poster: '', trailerUrl: '' }

export default function AdminMovies() {
  const toast = useToast()
  const [movies, setMovies] = useState([])
  const [form, setForm] = useState(null) // null = closed
  const [editId, setEditId] = useState(null)

  const load = () => api.get('/movies?limit=50&sort=newest').then((d) => setMovies(d.movies)).catch((e) => toast(e.message, 'error'))
  useEffect(() => { load() }, [])

  const open = (m) => {
    setEditId(m?._id || null)
    setForm(m ? {
      ...EMPTY, ...m,
      genre: m.genre.join(', '),
      cast: (m.cast || []).map((c) => c.name).join(', '),
      releaseDate: m.releaseDate.slice(0, 10),
    } : EMPTY)
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const save = async (e) => {
    e.preventDefault()
    const body = {
      ...form,
      duration: Number(form.duration),
      genre: form.genre.split(',').map((s) => s.trim()).filter(Boolean),
      cast: form.cast.split(',').map((s) => s.trim()).filter(Boolean).map((name) => ({ name })),
    }
    ;['_id', '__v', 'createdAt', 'updatedAt', 'status', 'id', 'averageRating', 'ratingCount', 'isActive'].forEach((k) => delete body[k])
    try {
      if (editId) await api.put(`/movies/${editId}`, body); else await api.post('/movies', body)
      toast(editId ? 'Movie updated' : 'Movie added')
      setForm(null); load()
    } catch (err) { toast(err.message, 'error') }
  }

  const remove = async (m) => {
    if (!window.confirm(`Remove "${m.title}"?`)) return
    try { await api.del(`/movies/${m._id}`); toast('Movie removed'); load() } catch (e) { toast(e.message, 'error') }
  }

  return (
    <>
      <div className="between"><h1>Movies</h1><button className="btn" onClick={() => open(null)}>+ Add movie</button></div>

      {form && (
        <form className="card form-grid" onSubmit={save}>
          <h3 className="span2">{editId ? 'Edit movie' : 'New movie'}</h3>
          <input placeholder="Title" required value={form.title} onChange={set('title')} />
          <input placeholder="Language" required value={form.language} onChange={set('language')} />
          <input placeholder="Genres (comma separated)" required value={form.genre} onChange={set('genre')} />
          <input type="number" min="1" placeholder="Duration (min)" required value={form.duration} onChange={set('duration')} />
          <input type="date" required value={form.releaseDate} onChange={set('releaseDate')} />
          <select value={form.certificate} onChange={set('certificate')}>{['U', 'UA', 'A', 'S'].map((c) => <option key={c}>{c}</option>)}</select>
          <input placeholder="Director" value={form.director} onChange={set('director')} />
          <input placeholder="Cast (comma separated names)" value={form.cast} onChange={set('cast')} />
          <input placeholder="Poster image URL" value={form.poster} onChange={set('poster')} />
          <input placeholder="Trailer URL" value={form.trailerUrl} onChange={set('trailerUrl')} />
          <textarea className="span2" rows="3" placeholder="Description" value={form.description} onChange={set('description')} />
          <div className="row-gap span2"><button className="btn">Save</button><button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button></div>
        </form>
      )}

      <div className="card table-wrap">
        <table>
          <thead><tr><th>Title</th><th>Language</th><th>Genres</th><th>Release</th><th>Rating</th><th /></tr></thead>
          <tbody>
            {movies.map((m) => (
              <tr key={m._id}>
                <td>{m.title}</td><td>{m.language}</td><td>{m.genre.join(', ')}</td>
                <td>{fmtFullDate(m.releaseDate)}</td><td>{m.averageRating || '–'}</td>
                <td className="actions"><button className="link-btn" onClick={() => open(m)}>Edit</button><button className="link-btn danger" onClick={() => remove(m)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {movies.length === 0 && <p className="muted">No movies yet.</p>}
      </div>
    </>
  )
}

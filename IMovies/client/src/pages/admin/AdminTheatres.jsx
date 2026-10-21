import { useEffect, useState } from 'react'
import { api } from '../../api'
import { useToast } from '../../components/Toast'
import { layoutToText, parseLayout } from '../../utils'

const DEFAULT_LAYOUT = 'A:10:Regular, B:10:Regular, C:10:Premium, D:8:Recliner'

export default function AdminTheatres() {
  const toast = useToast()
  const [theatres, setTheatres] = useState([])
  const [form, setForm] = useState(null)
  const [screenForm, setScreenForm] = useState({}) // theatreId -> {name, layout}

  const load = () => api.get('/theatres').then((d) => setTheatres(d.theatres)).catch((e) => toast(e.message, 'error'))
  useEffect(() => { load() }, [])

  const create = async (e) => {
    e.preventDefault()
    try {
      const screens = form.screenName ? [{ name: form.screenName, layout: parseLayout(form.layout) }] : []
      await api.post('/theatres', { name: form.name, city: form.city, address: form.address, screens })
      toast('Theatre added'); setForm(null); load()
    } catch (err) { toast(err.message, 'error') }
  }

  const addScreen = async (t) => {
    const f = screenForm[t._id]
    try {
      await api.post(`/theatres/${t._id}/screens`, { name: f.name, layout: parseLayout(f.layout) })
      toast('Screen added'); setScreenForm({ ...screenForm, [t._id]: null }); load()
    } catch (err) { toast(err.message, 'error') }
  }

  const delScreen = async (t, s) => {
    if (!window.confirm(`Delete ${s.name}?`)) return
    try { await api.del(`/theatres/${t._id}/screens/${s._id}`); load() } catch (e) { toast(e.message, 'error') }
  }
  const delTheatre = async (t) => {
    if (!window.confirm(`Delete ${t.name}?`)) return
    try { await api.del(`/theatres/${t._id}`); toast('Theatre removed'); load() } catch (e) { toast(e.message, 'error') }
  }

  const total = (s) => s.layout.reduce((n, r) => n + r.seats, 0)

  return (
    <>
      <div className="between"><h1>Theatres & Screens</h1>
        <button className="btn" onClick={() => setForm({ name: '', city: '', address: '', screenName: 'Screen 1', layout: DEFAULT_LAYOUT })}>+ Add theatre</button></div>

      {form && (
        <form className="card form-grid" onSubmit={create}>
          <h3 className="span2">New theatre</h3>
          <input placeholder="Theatre name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="City" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className="span2" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input placeholder="First screen name" value={form.screenName} onChange={(e) => setForm({ ...form, screenName: e.target.value })} />
          <input placeholder="Layout  Row:Seats:Type, …" value={form.layout} onChange={(e) => setForm({ ...form, layout: e.target.value })} />
          <small className="muted span2">Layout format: <code>Row:Seats:Type</code> separated by commas. Types: Regular, Premium, Recliner.</small>
          <div className="row-gap span2"><button className="btn">Save</button><button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button></div>
        </form>
      )}

      {theatres.length === 0 && <p className="muted">No theatres yet.</p>}
      {theatres.map((t) => (
        <div key={t._id} className="card">
          <div className="between">
            <div><h3>{t.name}</h3><p className="muted">{t.city}{t.address && ` · ${t.address}`}</p></div>
            <button className="link-btn danger" onClick={() => delTheatre(t)}>Delete theatre</button>
          </div>
          <table>
            <thead><tr><th>Screen</th><th>Layout</th><th>Seats</th><th /></tr></thead>
            <tbody>
              {t.screens.map((s) => (
                <tr key={s._id}><td>{s.name}</td><td><code>{layoutToText(s.layout)}</code></td><td>{total(s)}</td>
                  <td className="actions"><button className="link-btn danger" onClick={() => delScreen(t, s)}>Delete</button></td></tr>
              ))}
            </tbody>
          </table>
          {screenForm[t._id] ? (
            <div className="row-gap">
              <input placeholder="Screen name" value={screenForm[t._id].name} onChange={(e) => setScreenForm({ ...screenForm, [t._id]: { ...screenForm[t._id], name: e.target.value } })} />
              <input className="grow" placeholder="A:10:Regular, B:10:Premium" value={screenForm[t._id].layout} onChange={(e) => setScreenForm({ ...screenForm, [t._id]: { ...screenForm[t._id], layout: e.target.value } })} />
              <button className="btn" onClick={() => addScreen(t)}>Add</button>
            </div>
          ) : (
            <button className="link-btn" onClick={() => setScreenForm({ ...screenForm, [t._id]: { name: `Screen ${t.screens.length + 1}`, layout: DEFAULT_LAYOUT } })}>+ Add screen</button>
          )}
        </div>
      ))}
    </>
  )
}

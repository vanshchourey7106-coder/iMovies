import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { fmtDateTime, rupees } from '../utils'

const MAX = 10

export default function SeatSelection() {
  const { id } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [selected, setSelected] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => api.get(`/shows/${id}`).then(setData).catch((e) => setError(e.message))

  useEffect(() => {
    load()
    const t = setInterval(load, 15000) // refresh live availability
    return () => clearInterval(t)
  }, [id])

  if (error) return <div className="page"><div className="alert error">{error}</div></div>
  if (!data) return <div className="center-msg">Loading seat map…</div>

  const { show, seatMap } = data
  const seatInfo = {}
  seatMap.forEach((r) => r.seats.forEach((s) => { seatInfo[s.seatId] = { ...s, type: r.type, price: r.price } }))
  const total = selected.reduce((n, sid) => n + (seatInfo[sid]?.price || 0), 0)

  const toggle = (seat) => {
    if (seat.status === 'booked') return
    setSelected((cur) => {
      if (cur.includes(seat.seatId)) return cur.filter((s) => s !== seat.seatId)
      if (cur.length >= MAX) { toast(`You can select up to ${MAX} seats`, 'error'); return cur }
      return [...cur, seat.seatId]
    })
  }

  const proceed = async () => {
    if (!user) return navigate('/login', { state: { from: `/shows/${id}` } })
    if (user.role !== 'user') return toast('Please use a customer account to book', 'error')
    setBusy(true)
    try {
      const d = await api.post('/bookings', { showId: id, seats: selected })
      navigate(`/checkout/${d.booking._id}`)
    } catch (e) {
      toast(e.message, 'error')
      setSelected([])
      load() // someone may have taken the seat
    } finally { setBusy(false) }
  }

  return (
    <div className="page">
      <div className="show-head">
        <div>
          <h1>{show.movie.title}</h1>
          <p className="muted">{show.theatre.name}, {show.theatre.city} · {show.screenName} · {fmtDateTime(show.startTime)}</p>
        </div>
        <span className="chip">{data.availableSeats} / {data.totalSeats} seats left</span>
      </div>

      <div className="seat-layout">
        <div className="card seat-area">
          <div className="screen">SCREEN THIS WAY</div>
          {seatMap.map((r, i) => (
            <div key={r.row}>
              {(i === 0 || seatMap[i - 1].type !== r.type) && (
                <div className="tier">{r.type} · {rupees(r.price)}</div>
              )}
              <div className="seat-row">
                <span className="row-label">{r.row}</span>
                {r.seats.map((s) => (
                  <button
                    key={s.seatId}
                    className={`seat ${s.status === 'booked' ? 'booked' : ''} ${selected.includes(s.seatId) ? 'selected' : ''} ${r.type.toLowerCase()}`}
                    disabled={s.status === 'booked'}
                    onClick={() => toggle(s)}
                    title={`${s.seatId} · ${rupees(r.price)}`}
                  >{s.number}</button>
                ))}
              </div>
            </div>
          ))}
          <div className="legend">
            <span><i className="seat" /> Available</span>
            <span><i className="seat selected" /> Selected</span>
            <span><i className="seat booked" /> Booked</span>
          </div>
        </div>

        <aside className="card summary">
          <h3>Your selection</h3>
          {selected.length === 0 ? <p className="muted">Pick your seats from the layout.</p> : (
            <>
              <ul className="summary-list">
                {selected.map((sid) => (
                  <li key={sid}><span>{sid} <small className="muted">({seatInfo[sid].type})</small></span><b>{rupees(seatInfo[sid].price)}</b></li>
                ))}
              </ul>
              <div className="between total"><span>Total</span><b>{rupees(total)}</b></div>
            </>
          )}
          <button className="btn btn-lg full" disabled={!selected.length || busy} onClick={proceed}>
            {busy ? 'Holding seats…' : user ? 'Proceed to payment' : 'Login to book'}
          </button>
          <small className="muted">Seats are held for 10 minutes while you pay.</small>
        </aside>
      </div>
    </div>
  )
}

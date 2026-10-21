import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { useToast } from '../components/Toast'
import { fmtDateTime, rupees } from '../utils'

const METHODS = [
  { id: 'upi', label: 'UPI' },
  { id: 'card', label: 'Credit / Debit Card' },
  { id: 'netbanking', label: 'Net Banking' },
  { id: 'wallet', label: 'Wallet' },
]

export function TicketCard({ booking }) {
  return (
    <div className="card ticket">
      <div className="between">
        <h3>{booking.movie.title}</h3>
        <span className={`status ${booking.status}`}>{booking.status}</span>
      </div>
      <p className="muted">{booking.theatre.name}, {booking.theatre.city} · {booking.show.screenName}</p>
      <p><b>{fmtDateTime(booking.show.startTime)}</b></p>
      <p>Seats: <b>{booking.seats.map((s) => s.seatId).join(', ')}</b></p>
      <div className="between">
        <span className="muted">Booking ID: <b className="code">{booking.bookingCode}</b></span>
        <b>{rupees(booking.totalAmount)}</b>
      </div>
      {booking.payment?.transactionId && <small className="muted">Txn: {booking.payment.transactionId} · {booking.payment.method}</small>}
    </div>
  )
}

export default function Checkout() {
  const { id } = useParams()
  const toast = useToast()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [error, setError] = useState('')
  const [method, setMethod] = useState('upi')
  const [details, setDetails] = useState({ upiId: '', cardNumber: '' })
  const [left, setLeft] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get(`/bookings/${id}`).then((d) => setBooking(d.booking)).catch((e) => setError(e.message))
  }, [id])

  // countdown for the seat hold
  useEffect(() => {
    if (booking?.status !== 'pending' || !booking.expiresAt) return
    const tick = () => setLeft(Math.max(0, Math.floor((new Date(booking.expiresAt) - Date.now()) / 1000)))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [booking])

  const pay = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const d = await api.post(`/bookings/${id}/pay`, { method, details })
      setBooking(d.booking)
      toast('Payment successful!')
    } catch (err) { toast(err.message, 'error') } finally { setBusy(false) }
  }

  const cancel = async () => {
    try { await api.put(`/bookings/${id}/cancel`); toast('Seats released'); navigate('/') } catch (e) { toast(e.message, 'error') }
  }

  if (error) return <div className="page"><div className="alert error">{error}</div></div>
  if (!booking) return <div className="center-msg">Loading…</div>

  if (booking.status === 'confirmed') {
    return (
      <div className="page narrow">
        <div className="success-banner">🎉 Booking confirmed! A receipt was sent to your email.</div>
        <TicketCard booking={booking} />
        <div className="row-gap"><Link className="btn" to="/bookings">My bookings</Link><Link className="btn btn-ghost" to="/">Book more</Link></div>
      </div>
    )
  }
  if (booking.status !== 'pending' || left === 0) {
    return (
      <div className="page narrow">
        <div className="alert error">This booking is {booking.status === 'pending' ? 'expired' : booking.status}. Please select seats again.</div>
        <Link className="btn" to="/">Back to movies</Link>
      </div>
    )
  }

  const mm = String(Math.floor((left ?? 0) / 60)).padStart(2, '0')
  const ss = String((left ?? 0) % 60).padStart(2, '0')

  return (
    <div className="page narrow">
      <h1>Payment</h1>
      <div className="timer">Seats held for <b>{mm}:{ss}</b></div>
      <TicketCard booking={booking} />

      <form className="card" onSubmit={pay}>
        <h3>Choose payment method</h3>
        <div className="methods">
          {METHODS.map((m) => (
            <label key={m.id} className={method === m.id ? 'active' : ''}>
              <input type="radio" name="method" checked={method === m.id} onChange={() => setMethod(m.id)} /> {m.label}
            </label>
          ))}
        </div>
        {method === 'upi' && <input placeholder="UPI ID (e.g. name@upi)" value={details.upiId} onChange={(e) => setDetails({ ...details, upiId: e.target.value })} />}
        {method === 'card' && <input placeholder="16-digit card number" maxLength={19} value={details.cardNumber} onChange={(e) => setDetails({ ...details, cardNumber: e.target.value })} />}
        {(method === 'netbanking' || method === 'wallet') && <p className="muted">You will be redirected to complete payment (simulated).</p>}
        <button className="btn btn-lg full" disabled={busy}>{busy ? 'Processing…' : `Pay ${rupees(booking.totalAmount)}`}</button>
        <button type="button" className="link-btn danger" onClick={cancel}>Cancel & release seats</button>
        <small className="muted">Demo gateway: card numbers ending in 0000 are declined.</small>
      </form>
    </div>
  )
}

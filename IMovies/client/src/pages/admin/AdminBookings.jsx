import { useEffect, useState } from 'react'
import { api, qs } from '../../api'
import { useToast } from '../../components/Toast'
import { fmtDateTime, rupees } from '../../utils'

export default function AdminBookings() {
  const toast = useToast()
  const [bookings, setBookings] = useState([])
  const [status, setStatus] = useState('')

  const load = () => api.get(`/admin/bookings${qs({ status, limit: 50 })}`).then((d) => setBookings(d.bookings)).catch((e) => toast(e.message, 'error'))
  useEffect(() => { load() }, [status])

  const cancel = async (b) => {
    if (!window.confirm(`Cancel booking ${b.bookingCode}?`)) return
    try { const d = await api.put(`/bookings/${b._id}/cancel`); toast(d.message); load() } catch (e) { toast(e.message, 'error') }
  }

  return (
    <>
      <div className="between"><h1>Bookings</h1>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {['pending', 'confirmed', 'cancelled', 'expired'].map((s) => <option key={s}>{s}</option>)}
        </select></div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Code</th><th>User</th><th>Movie</th><th>Show</th><th>Seats</th><th>Amount</th><th>Payment</th><th>Status</th><th /></tr></thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td><code>{b.bookingCode}</code></td>
                <td>{b.user?.name}<br /><small className="muted">{b.user?.email}</small></td>
                <td>{b.movie?.title}</td>
                <td>{b.theatre?.name}<br /><small className="muted">{b.show && fmtDateTime(b.show.startTime)}</small></td>
                <td>{b.seats.map((s) => s.seatId).join(', ')}</td>
                <td>{rupees(b.totalAmount)}</td>
                <td>{b.payment?.status}{b.payment?.method && ` (${b.payment.method})`}</td>
                <td><span className={`status ${b.status}`}>{b.status}</span></td>
                <td className="actions">{['pending', 'confirmed'].includes(b.status) && <button className="link-btn danger" onClick={() => cancel(b)}>Cancel</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && <p className="muted">No bookings found.</p>}
      </div>
    </>
  )
}

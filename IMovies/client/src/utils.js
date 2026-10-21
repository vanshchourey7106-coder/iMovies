export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
export const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
export const fmtDateTime = (d) => `${fmtDate(d)}, ${fmtTime(d)}`
export const fmtFullDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
export const rupees = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`
export const duration = (m) => `${Math.floor(m / 60)}h ${m % 60}m`
export const GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller']
export const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Malayalam', 'Kannada']

// "A:10:Regular, B:10:Premium"  ->  [{row:'A',seats:10,type:'Regular'}, ...]
export const parseLayout = (text) =>
  text.split(',').map((part) => {
    const [row, seats, type] = part.trim().split(':').map((s) => s.trim())
    if (!row || !Number(seats)) throw new Error(`Bad layout entry "${part.trim()}". Use  A:10:Regular`)
    const t = ['Regular', 'Premium', 'Recliner'].find((x) => x.toLowerCase() === (type || 'regular').toLowerCase())
    if (!t) throw new Error('Seat type must be Regular, Premium or Recliner')
    return { row, seats: Number(seats), type: t }
  })

export const layoutToText = (layout) => layout.map((r) => `${r.row}:${r.seats}:${r.type}`).join(', ')

import { format, formatDistance } from 'date-fns'

export function fmtQty(qty, unit) {
  const n = Number(qty)
  const display = n % 1 === 0 ? n : n.toFixed(2)
  return `${display} ${unit}`
}

export function fmtKM(amount) {
  if (amount == null) return '—'
  return `${Number(amount).toFixed(2)} KM`
}

export function fmtDate(date) {
  if (!date) return '—'
  return format(new Date(date), 'dd.MM.yyyy')
}

export function fmtDateShort(date) {
  if (!date) return '—'
  return format(new Date(date), 'dd.MM.')
}

export function fmtDatetime(date) {
  if (!date) return '—'
  return format(new Date(date), 'dd.MM.yyyy HH:mm')
}

export function fmtRelative(date) {
  if (!date) return '—'
  return formatDistance(new Date(date), new Date(), { addSuffix: true })
}

export function getExpiryDate(entryDate, shelfLifeDays) {
  if (!entryDate || !shelfLifeDays) return null
  const d = new Date(entryDate)
  d.setDate(d.getDate() + Number(shelfLifeDays))
  return d
}

// 'expired' | 'expiring' (≤3 dana) | 'fresh' | null
export function getExpiryStatus(entryDate, shelfLifeDays) {
  const expiry = getExpiryDate(entryDate, shelfLifeDays)
  if (!expiry) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((expiry - today) / 86400000)
  if (diffDays < 0) return 'expired'
  if (diffDays <= 3) return 'expiring'
  return 'fresh'
}

export function getDaysUntilExpiry(entryDate, shelfLifeDays) {
  const expiry = getExpiryDate(entryDate, shelfLifeDays)
  if (!expiry) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.ceil((expiry - today) / 86400000)
}

// Najgori status isteka roka po svim lotovima
export function getWorstExpiryFromLots(lots) {
  let worst = null
  for (const lot of lots ?? []) {
    const s = getExpiryStatus(lot.entry_date, lot.shelf_life_days)
    if (s === 'expired') return 'expired'
    if (s === 'expiring') worst = 'expiring'
  }
  return worst
}

export function getItemStatus(totalQty, minQty, lots = []) {
  const worst = getWorstExpiryFromLots(lots)
  if (worst === 'expired') return 'critical'
  if (worst === 'expiring') return 'low'
  const q = Number(totalQty)
  const m = Number(minQty)
  if (q <= 0) return 'critical'
  if (q <= m) return 'low'
  return 'ok'
}

export const UNITS = ['kg', 'g', 'l', 'ml', 'kom', 'pak']

const CATEGORY_COLORS = [
  '#4f7eff', '#22c55e', '#f59e0b', '#ec4899',
  '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6',
  '#ef4444', '#a3e635',
]

export function getCategoryColor(categoryId) {
  if (!categoryId) return 'var(--border)'
  let hash = 0
  for (let i = 0; i < categoryId.length; i++) {
    hash = (hash * 31 + categoryId.charCodeAt(i)) & 0xffffffff
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length]
}

// Cijena se uvijek izražava po baznoj jedinici (g→kg, ml→l, ostale nepromijenjene)
export function priceUnit(unit) {
  if (unit === 'g') return 'kg'
  if (unit === 'ml') return 'l'
  return unit
}

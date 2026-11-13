import github from './data/github.json'
import { useEffect, useRef, useState } from 'react'
import { airports, flights, routeKey } from './data/flights'
import { FlatMap, Globe } from './RouteMap'

const LEVEL_COLORS = ['#e5e7eb', '#bfdbfe', '#60a5fa', '#2563eb', '#1e3a8a']
const CELL = 10
const STEP = 13
const LABEL_H = 14
const EARTH_MI = 24901

const fmt = (n: number) => n.toLocaleString('en-US')
const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

function miles(from: string, to: string) {
  const a = airports[from]
  const b = airports[to]
  if (!a || !b) return 0
  const rad = (d: number) => (d * Math.PI) / 180
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2
  return 2 * 3958.8 * Math.asin(Math.sqrt(h))
}

function Heatmap() {
  const cells: { x: number; y: number; date: string; count: number; level: number }[] = []
  const months: { x: number; label: string }[] = []
  let col = 0
  github.days.forEach((d, i) => {
    const row = new Date(`${d.date}T00:00:00Z`).getUTCDay()
    if (row === 0 && i > 0) col++
    cells.push({ x: col * STEP, y: LABEL_H + row * STEP, ...d })
    const day = Number(d.date.slice(8, 10))
    if (row === 0 && day <= 7 && col > 0) {
      months.push({ x: col * STEP, label: new Date(`${d.date}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) })
    }
  })
  const width = (col + 1) * STEP

  return (
    <svg viewBox={`0 0 ${width} ${LABEL_H + 7 * STEP}`} className="w-full h-auto" role="img" aria-label={`${fmt(github.total)} GitHub contributions in the past year`}>
      {months.map((m) => (
        <text key={m.x} x={m.x} y={10} fontSize={9} fill="#6b7280">{m.label}</text>
      ))}
      {cells.map((c) => (
        <rect key={c.date} x={c.x} y={c.y} width={CELL} height={CELL} rx={2} fill={LEVEL_COLORS[c.level]}>
          <title>{`${c.count} contribution${c.count === 1 ? '' : 's'} on ${formatDate(c.date)}`}</title>
        </rect>
      ))}
    </svg>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-xl font-semibold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

export default function Stats() {
  const [view, setView] = useState<'map' | 'globe'>('globe')
  // Selected route (airport pair) and, when picked from the list, the specific flight
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)
  const [selectedFlight, setSelectedFlight] = useState<number | null>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selectRoute = (key: string | null) => {
    setSelectedRoute(key)
    setSelectedFlight(key ? flights.findIndex((f) => routeKey(f.from, f.to) === key) : null)
  }
  const selectFlight = (i: number) => {
    const key = routeKey(flights[i].from, flights[i].to)
    const same = selectedFlight === i
    setSelectedRoute(same ? null : key)
    setSelectedFlight(same ? null : i)
  }

  // Fade edges and a "scroll" hint show there is more list above or below
  const [scroll, setScroll] = useState({ atTop: true, atBottom: false })
  const updateScroll = () => {
    const list = listRef.current
    if (!list) return
    setScroll({ atTop: list.scrollTop < 4, atBottom: list.scrollTop + list.clientHeight >= list.scrollHeight - 4 })
  }
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const observer = new ResizeObserver(updateScroll)
    observer.observe(list)
    return () => observer.disconnect()
  }, [])

  // Keep the selected flight visible inside the scrolling list (without scrolling the page)
  useEffect(() => {
    const list = listRef.current
    const row = selectedFlight === null ? null : list?.querySelector<HTMLElement>(`[data-index="${selectedFlight}"]`)
    if (!list || !row) return
    if (row.offsetTop < list.scrollTop || row.offsetTop + row.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: row.offsetTop - list.clientHeight / 2 + row.offsetHeight / 2, behavior: 'smooth' })
    }
  }, [selectedFlight])
  const totalMi = flights.reduce((sum, f) => sum + miles(f.from, f.to), 0)
  const airportCount = new Set(flights.flatMap((f) => [f.from, f.to])).size
  const airlineCount = new Set(flights.map((f) => f.airline).filter(Boolean)).size
  const aircraftCount = new Set(flights.map((f) => f.aircraft).filter(Boolean)).size
  const earth = totalMi / EARTH_MI
  const firstDate = flights.map((f) => f.date).filter((d): d is string => Boolean(d)).sort()[0]
  const since = firstDate && new Date(`${firstDate}T00:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  return (
    <div className="grid gap-4 mt-2">
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-baseline justify-between mb-3">
          <a href={`https://github.com/${github.login}`} target="_blank" rel="noreferrer" className="font-semibold text-blue-700 hover:underline">github</a>
          <span className="text-xs text-gray-500">contributions · past year</span>
        </div>
        <Heatmap />
        <div className="flex gap-8 mt-3">
          <Stat value={fmt(github.total)} label="contributions" />
          <Stat value={`${github.longestStreak} days`} label="longest streak" />
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-baseline justify-between mb-3">
          <span className="font-semibold text-gray-900">flights</span>
          <span className="text-xs text-gray-500">{flights.length} logged{since && ` · since ${since}`}</span>
        </div>
        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* On desktop the left column is absolutely filled, so the map/globe alone sets the row height */}
          <div className="min-w-0 md:relative">
            <div className="flex flex-col md:absolute md:inset-0">
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <Stat value={`${fmt(Math.round(totalMi))} mi`} label={`${earth < 1 ? earth.toFixed(2) : earth.toFixed(1)}× around Earth`} />
              <Stat value={String(airportCount)} label={airportCount === 1 ? 'airport' : 'airports'} />
              {airlineCount > 0 && <Stat value={String(airlineCount)} label={airlineCount === 1 ? 'airline' : 'airlines'} />}
              {aircraftCount > 0 && <Stat value={String(aircraftCount)} label={aircraftCount === 1 ? 'aircraft type' : 'aircraft types'} />}
            </div>
            <div className="flex items-baseline justify-between mt-4 mb-1 text-xs text-gray-500">
              <span>all {flights.length} flights</span>
              {!scroll.atBottom && <span aria-hidden="true">scroll ↓</span>}
            </div>
            <div className="relative flex-1 min-h-0">
            <ul ref={listRef} onScroll={updateScroll} className="flight-list h-full max-h-60 md:max-h-none overflow-y-auto text-sm border-y border-gray-200" aria-label="All flights">
              {flights.map((f, i) => {
                const onRoute = selectedRoute !== null && routeKey(f.from, f.to) === selectedRoute
                const isSelected = selectedFlight === i
                return (
                  <li
                    key={i}
                    data-index={i}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onClick={() => selectFlight(i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        selectFlight(i)
                      }
                    }}
                    className={`px-2 py-1.5 cursor-pointer border-b border-gray-100 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isSelected ? 'bg-red-50' : onRoute ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}
                  >
                    <span className={`font-medium ${isSelected || onRoute ? 'text-red-700' : 'text-gray-900'}`}>{f.from} → {f.to}</span>
                    {[f.flight, f.reason, f.date && formatDate(f.date)].filter(Boolean).map((part) => (
                      <span key={part} className="text-gray-500"> · {part}</span>
                    ))}
                  </li>
                )
              })}
            </ul>
              {!scroll.atTop && <div className="pointer-events-none absolute inset-x-0 top-px h-6 bg-gradient-to-b from-white to-transparent" />}
              {!scroll.atBottom && <div className="pointer-events-none absolute inset-x-0 bottom-px h-10 bg-gradient-to-t from-white to-transparent" />}
            </div>
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex justify-end gap-1 mb-2 text-xs">
              {(['map', 'globe'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  // Inline styles: index.css has unlayered button rules that beat Tailwind utilities
                  style={{ padding: '2px 10px', borderRadius: 6, border: '1px solid #1d4ed8', background: view === v ? '#1d4ed8' : 'transparent', color: view === v ? '#fff' : '#1d4ed8', fontSize: 12 }}
                >
                  {v}
                </button>
              ))}
            </div>
            <div>{view === 'map' ? <FlatMap selected={selectedRoute} onSelect={selectRoute} /> : <Globe selected={selectedRoute} onSelect={selectRoute} />}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { geoCentroid, geoDistance, geoEqualEarth, geoGraticule10, geoOrthographic, geoPath } from 'd3-geo'
import type { GeoPermissibleObjects } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import landTopo from 'world-atlas/land-110m.json'
import { airports, flights, routeKey } from './data/flights'

const HOME = 'OMA'
const topo = landTopo as unknown as Topology<{ land: GeometryCollection }>
const land = feature(topo, topo.objects.land)


type Route = { key: string; line: GeoPermissibleObjects; count: number }

// One arc per airport pair, regardless of direction or how often it was flown
const routes: Route[] = Object.entries(
  flights.reduce<Record<string, number>>((acc, f) => {
    const key = routeKey(f.from, f.to)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {}),
)
  .map(([key, count]) => {
    const [a, b] = key.split('-').map((code) => airports[code])
    return a && b ? { key, count, line: { type: 'LineString', coordinates: [[a.lon, a.lat], [b.lon, b.lat]] } as GeoPermissibleObjects } : null
  })
  .filter((r): r is Route => r !== null)

const usedAirports = [...new Set(flights.flatMap((f) => [f.from, f.to]))]
  .filter((code) => airports[code])
  .map((code) => ({ code, ...airports[code] }))

const COLORS = {
  ocean: '#f1f5f9',
  land: '#d1d5db',
  graticule: '#e2e8f0',
  route: '#2563eb',
  selected: '#dc2626',
  airport: '#1e3a8a',
}

export type RouteMapProps = { selected: string | null; onSelect: (key: string | null) => void }

function Layers({ path, visible, selected, onSelect }: RouteMapProps & { path: ReturnType<typeof geoPath>; visible: (lon: number, lat: number) => boolean }) {
  const [hover, setHover] = useState<string | null>(null)
  const project = path.projection() as unknown as (p: [number, number]) => [number, number] | null
  const selectedEnds = selected ? selected.split('-') : []
  // Draw the selected route last so it sits on top
  const ordered = [...routes].sort((a, b) => Number(a.key === selected) - Number(b.key === selected))

  return (
    <>
      <path d={path({ type: 'Sphere' }) ?? ''} fill={COLORS.ocean} stroke="#cbd5e1" onClick={() => onSelect(null)} />
      <path d={path(geoGraticule10()) ?? ''} fill="none" stroke={COLORS.graticule} strokeWidth={0.5} pointerEvents="none" />
      <path d={path(land) ?? ''} fill={COLORS.land} onClick={() => onSelect(null)} />
      {ordered.map((r) => {
        const d = path(r.line)
        if (!d) return null
        const isSelected = r.key === selected
        const isHover = r.key === hover
        const dimmed = selected !== null && !isSelected
        const [a, b] = r.key.split('-')
        return (
          <g key={r.key} onClick={(e) => { e.stopPropagation(); onSelect(isSelected ? null : r.key) }} onMouseEnter={() => setHover(r.key)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
            <path d={d} fill="none" stroke={isSelected ? COLORS.selected : COLORS.route} strokeWidth={isSelected ? 3 : isHover ? 2.5 : 1.25} strokeOpacity={dimmed && !isHover ? 0.15 : isSelected ? 1 : 0.6} strokeLinecap="round" />
            {/* Wide invisible stroke so thin arcs are easy to click */}
            <path d={d} fill="none" stroke="transparent" strokeWidth={12} />
            <title>{`${a} ↔ ${b} · ${r.count} flight${r.count === 1 ? '' : 's'}`}</title>
          </g>
        )
      })}
      {usedAirports.filter((a) => visible(a.lon, a.lat)).map((a) => {
        const p = project([a.lon, a.lat])
        if (!p) return null
        const highlighted = selectedEnds.includes(a.code)
        return (
          <circle key={a.code} cx={p[0]} cy={p[1]} r={a.code === HOME ? 4 : highlighted ? 4 : 2.5} fill={a.code === HOME ? '#ffffff' : highlighted ? COLORS.selected : COLORS.airport} stroke={highlighted ? COLORS.selected : COLORS.airport} strokeWidth={a.code === HOME ? 2 : 0} pointerEvents="none">
            <title>{`${a.code} · ${a.city}`}</title>
          </circle>
        )
      })}
    </>
  )
}

export function FlatMap(props: RouteMapProps) {
  const width = 960
  const height = 470
  const path = useMemo(() => geoPath(geoEqualEarth().fitExtent([[8, 8], [width - 8, height - 8]], { type: 'Sphere' })), [])
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Map of flight routes; click a route to highlight it">
      <Layers {...props} path={path} visible={() => true} />
    </svg>
  )
}

export function Globe(props: RouteMapProps) {
  const size = 480
  const home = airports[HOME]
  const [rotation, setRotation] = useState<[number, number]>([-home.lon, -home.lat + 15])
  const drag = useRef<{ x: number; y: number; r: [number, number]; moved: boolean } | null>(null)
  const target = useRef<[number, number] | null>(null)
  const wasDrag = useRef(false)

  // Turn the globe to face the selected route
  useEffect(() => {
    const r = routes.find((x) => x.key === props.selected)
    if (!r) {
      target.current = null
      return
    }
    const [lon, lat] = geoCentroid(r.line)
    target.current = [-lon, Math.max(-60, Math.min(60, -lat))]
  }, [props.selected])

  // Slow spin when idle; ease toward the selected route otherwise
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const tick = () => {
      if (!drag.current) {
        setRotation(([l, p]) => {
          const t = target.current
          if (t) {
            const dl = ((t[0] - l + 540) % 360) - 180
            if (reduced) return t
            return [l + dl * 0.12, p + (t[1] - p) * 0.12]
          }
          return reduced ? [l, p] : [l + 0.12, p]
        })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const projection = geoOrthographic().translate([size / 2, size / 2]).scale(size / 2 - 4).rotate(rotation).clipAngle(90)
  const path = geoPath(projection)
  const center: [number, number] = [-rotation[0], -rotation[1]]

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-auto max-w-sm mx-auto block cursor-grab active:cursor-grabbing touch-none"
      role="img"
      aria-label="Globe of flight routes; drag to rotate, click a route to highlight it"
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, y: e.clientY, r: rotation, moved: false }
        wasDrag.current = false
      }}
      onPointerMove={(e) => {
        const d = drag.current
        if (!d) return
        const dx = e.clientX - d.x
        const dy = e.clientY - d.y
        if (!d.moved && Math.hypot(dx, dy) < 4) return
        if (!d.moved) {
          d.moved = true
          wasDrag.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          target.current = null
        }
        setRotation([d.r[0] + dx * 0.4, Math.max(-80, Math.min(80, d.r[1] - dy * 0.4))])
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onClickCapture={(e) => {
        // A drag shouldn't count as a click on a route
        if (wasDrag.current) e.stopPropagation()
      }}
    >
      <Layers {...props} path={path} visible={(lon, lat) => geoDistance([lon, lat], center) < Math.PI / 2} />
    </svg>
  )
}

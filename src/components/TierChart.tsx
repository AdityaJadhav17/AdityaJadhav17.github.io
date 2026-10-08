// Talk-to-Robot, Table 1 of the CSE 190 paper (baseline evaluation, few-shot):
// end-to-end success by instruction tier. Colours and type come from the
// .tier-chart rules in theme.css, so it follows light and dark with no hex.
const TIERS: [name: string, value: number][] = [
  ['Literal', 98.3],
  ['Region', 93.3],
  ['Offsets', 76.7],
  ['Reference', 73.3],
  ['Intent', 50],
]
const BASE = 124 // y of 0%; 0.84 user units per percentage point
const y = (v: number) => BASE - v * 0.84
const top = y(98.3)

export function TierChart({ alt, className }: { alt: string; className: string }) {
  return (
    <svg viewBox="0 0 320 160" role="img" aria-label={alt} className={`tier-chart ${className}`}>
      <text x="12" y="15" className="ttl">
        End-to-end success by instruction tier
      </text>
      <line x1="12" x2="308" y1={top} y2={top} className="ref" />
      <text x="308" y={top - 4} className="ref-label">
        T0 baseline
      </text>
      {TIERS.map(([name, value], i) => {
        const t = y(value)
        return (
          // Slot centres across x 12..308, 59.2 apart.
          <g key={name} transform={`translate(${41.6 + 59.2 * i})`}>
            <rect x="-20" y={t} width="40" height={BASE - t} className={i === 4 ? 'hot' : undefined} />
            <text y={t - 4} className="val">
              {value.toFixed(1)}%
            </text>
            <text y={BASE + 13} className="id">
              T{i}
            </text>
            <text y={BASE + 25}>{name}</text>
          </g>
        )
      })}
      <line x1="12" x2="308" y1={BASE} y2={BASE} className="axis" />
    </svg>
  )
}

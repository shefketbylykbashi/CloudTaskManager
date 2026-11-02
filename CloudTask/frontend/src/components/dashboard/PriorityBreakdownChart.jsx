import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const entry = payload[0]?.payload
  return (
    <div className="chart-tooltip">
      <p className="font-semibold">{entry.name} priority</p>
      <p className="mt-0.5 text-[var(--text-muted)]">{entry.value.toLocaleString()} {entry.value === 1 ? 'task' : 'tasks'}</p>
    </div>
  )
}

export default function PriorityBreakdownChart({ data }) {
  return (
    <section className="surface-card p-5 sm:p-6">
      <div>
        <p className="eyebrow">Focus</p>
        <h2 className="mt-1.5 text-base font-bold tracking-tight">Priority breakdown</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">A live count across every saved task.</p>
      </div>
      <div className="mt-6 h-[230px]" role="img" aria-label="Task priority bar chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-subtle)', fontSize: 10 }} width={38} />
            <Tooltip cursor={{ fill: 'color-mix(in srgb, var(--text-subtle) 7%, transparent)' }} content={<ChartTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 3, 3]} maxBarSize={52} isAnimationActive={false}>
              {data.map((entry) => <Cell key={entry.key} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}


import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const entry = payload[0]?.payload
  return (
    <div className="chart-tooltip">
      <p className="font-semibold">{entry.name}</p>
      <p className="mt-0.5 text-[var(--text-muted)]">{entry.value.toLocaleString()} {entry.value === 1 ? 'task' : 'tasks'}</p>
    </div>
  )
}

export default function StatusDistributionChart({ data, total }) {
  const hasData = data.some((entry) => entry.value > 0)
  return (
    <section className="surface-card p-5 sm:p-6">
      <div>
        <p className="eyebrow">Workload</p>
        <h2 className="mt-1.5 text-base font-bold tracking-tight">Status distribution</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">How active work is distributed right now.</p>
      </div>

      <div className="mt-3 grid items-center gap-2 sm:grid-cols-[1fr_150px] lg:grid-cols-1 xl:grid-cols-[1fr_150px]">
        <div className="relative h-[220px] min-w-0" role="img" aria-label={`Task status chart. ${total} total tasks.`}>
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={82} paddingAngle={3} stroke="none" isAnimationActive={false}>
                  {data.map((entry) => <Cell key={entry.key} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute left-1/2 top-1/2 size-[164px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[22px] border-slate-100 dark:border-slate-800" />
          )}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-2xl font-bold tracking-[-0.04em]">{total.toLocaleString()}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">Total</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-1 lg:grid-cols-3 xl:grid-cols-1">
          {data.map((entry) => (
            <div key={entry.key} className="flex items-center gap-2.5 rounded-xl px-2 py-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-[var(--text-muted)]">{entry.name}</p>
                <p className="text-sm font-bold">{entry.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


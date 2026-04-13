import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { convertWeight } from '../../utils/unitConversion'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
]

export default function ProgressionChart({ entries, displayUnit }) {
  if (!entries || entries.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No data to display</p>
  }

  const exerciseMap = {}
  entries.forEach((e) => {
    if (!exerciseMap[e.exercise_name]) exerciseMap[e.exercise_name] = []
    exerciseMap[e.exercise_name].push(e)
  })

  const allDates = [...new Set(entries.map((e) => e.date))].sort()
  const exerciseNames = Object.keys(exerciseMap)

  const datasets = exerciseNames.map((name, i) => {
    const byDate = {}
    exerciseMap[name].forEach((e) => {
      const w = convertWeight(e.weight_kg, displayUnit)
      if (!byDate[e.date] || w > byDate[e.date].weight) {
        byDate[e.date] = { weight: w, sets: e.sets, reps: e.reps }
      }
    })

    const allWeights = exerciseMap[name].map((e) => convertWeight(e.weight_kg, displayUnit))

    return {
      label: name,
      data: allDates.map((d) => byDate[d]?.weight ?? null),
      borderColor: COLORS[i % COLORS.length],
      backgroundColor: COLORS[i % COLORS.length] + '33',
      tension: 0.3,
      spanGaps: true,
      pointRadius: 5,
      pointHoverRadius: 7,
      extraPoints: allDates.map((d) => {
        const pts = exerciseMap[name]
          .filter((e) => e.date === d)
          .map((e) => convertWeight(e.weight_kg, displayUnit))
        return pts.length > 1 ? pts : null
      }),
    }
  })

  return (
    <Line
      data={{ labels: allDates, datasets }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } },
          title: { display: true, text: `Weight Progression (${displayUnit})` },
          tooltip: {
            callbacks: {
              afterLabel: (ctx) => {
                const extra = ctx.dataset.extraPoints?.[ctx.dataIndex]
                if (extra && extra.length > 1) {
                  return `All sets: ${extra.join(', ')} ${displayUnit}`
                }
                return ''
              },
            },
          },
        },
        scales: {
          y: { title: { display: true, text: displayUnit }, beginAtZero: false },
        },
      }}
    />
  )
}

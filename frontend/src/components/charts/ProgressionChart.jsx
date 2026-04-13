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
  '#ec4899', '#14b8a6', '#f97316',
]

export default function ProgressionChart({ data, displayUnit }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No data to display</p>
  }

  const exerciseMap = {}
  data.forEach((d) => {
    if (!exerciseMap[d.exercise_name]) exerciseMap[d.exercise_name] = []
    exerciseMap[d.exercise_name].push({
      date: d.date,
      weight: convertWeight(d.max_weight_kg, displayUnit),
    })
  })

  const allDates = [...new Set(data.map((d) => d.date))].sort()
  const exercises = Object.keys(exerciseMap)

  const datasets = exercises.map((name, i) => {
    const lookup = Object.fromEntries(
      exerciseMap[name].map((p) => [p.date, p.weight])
    )
    return {
      label: name,
      data: allDates.map((d) => lookup[d] ?? null),
      borderColor: COLORS[i % COLORS.length],
      backgroundColor: COLORS[i % COLORS.length] + '33',
      tension: 0.3,
      spanGaps: true,
      pointRadius: 4,
    }
  })

  return (
    <Line
      data={{ labels: allDates, datasets }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: `Weight Progression (${displayUnit})` },
        },
        scales: {
          y: { title: { display: true, text: displayUnit } },
        },
      }}
    />
  )
}

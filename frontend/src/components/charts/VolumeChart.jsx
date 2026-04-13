import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { convertWeight } from '../../utils/unitConversion'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316',
]

export default function VolumeChart({ data, displayUnit }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No data to display</p>
  }

  const exerciseMap = {}
  data.forEach((d) => {
    if (!exerciseMap[d.exercise_name]) exerciseMap[d.exercise_name] = []
    exerciseMap[d.exercise_name].push({
      date: d.date,
      volume: convertWeight(d.total_volume_kg, displayUnit),
    })
  })

  const allDates = [...new Set(data.map((d) => d.date))].sort()
  const exercises = Object.keys(exerciseMap)

  const datasets = exercises.map((name, i) => {
    const lookup = Object.fromEntries(
      exerciseMap[name].map((p) => [p.date, p.volume])
    )
    return {
      label: name,
      data: allDates.map((d) => lookup[d] ?? 0),
      backgroundColor: COLORS[i % COLORS.length] + 'cc',
      borderColor: COLORS[i % COLORS.length],
      borderWidth: 1,
    }
  })

  return (
    <Bar
      data={{ labels: allDates, datasets }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: `Volume (sets x reps x weight) in ${displayUnit}` },
        },
        scales: {
          x: { stacked: true },
          y: { stacked: true, title: { display: true, text: displayUnit } },
        },
      }}
    />
  )
}

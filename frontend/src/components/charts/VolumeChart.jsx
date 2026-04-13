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
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
]

export default function VolumeChart({ entries, displayUnit }) {
  if (!entries || entries.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No data to display</p>
  }

  const exerciseMap = {}
  entries.forEach((e) => {
    if (!exerciseMap[e.exercise_name]) exerciseMap[e.exercise_name] = {}
    const vol = convertWeight(e.sets * e.reps * e.weight_kg, displayUnit)
    exerciseMap[e.exercise_name][e.date] = (exerciseMap[e.exercise_name][e.date] || 0) + vol
  })

  const allDates = [...new Set(entries.map((e) => e.date))].sort()
  const exerciseNames = Object.keys(exerciseMap)

  const datasets = exerciseNames.map((name, i) => ({
    label: name,
    data: allDates.map((d) => +(exerciseMap[name][d] || 0).toFixed(1)),
    backgroundColor: COLORS[i % COLORS.length] + 'cc',
    borderColor: COLORS[i % COLORS.length],
    borderWidth: 1,
    borderRadius: 4,
  }))

  return (
    <Bar
      data={{ labels: allDates, datasets }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } },
          title: { display: true, text: `Volume (sets × reps × weight) in ${displayUnit}` },
        },
        scales: {
          x: { stacked: true },
          y: { stacked: true, title: { display: true, text: displayUnit }, beginAtZero: true },
        },
      }}
    />
  )
}

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import ProgressionChart from '../components/charts/ProgressionChart'
import VolumeChart from '../components/charts/VolumeChart'
import { formatWeight } from '../utils/unitConversion'

export default function ViewData() {
  const [summary, setSummary] = useState([])
  const [entries, setEntries] = useState([])
  const [categories, setCategories] = useState([])
  const [exercises, setExercises] = useState([])
  const [displayUnit, setDisplayUnit] = useState('kg')
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    category: '',
    exercise: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axios.get('/api/workouts/categories').then((r) => setCategories(r.data))
    axios.get('/api/workouts/exercises').then((r) => setExercises(r.data))
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = {}
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to
    if (filters.category) params.category = filters.category
    if (filters.exercise) params.exercise = filters.exercise
    try {
      const [sumRes, entRes] = await Promise.all([
        axios.get('/api/workouts/summary', { params }),
        axios.get('/api/workouts', { params }),
      ])
      setSummary(sumRes.data)
      setEntries(entRes.data)
    } catch (err) {
      console.error('Failed to load data', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateFilter = (field) => (e) =>
    setFilters((prev) => ({ ...prev, [field]: e.target.value }))

  const deleteEntry = async (id) => {
    if (!window.confirm('Delete this entry?')) return
    await axios.delete(`/api/workouts/${id}`)
    fetchData()
  }

  const filteredExercises = filters.category
    ? exercises.filter((e) => e.category === filters.category)
    : exercises

  const selectCls =
    'rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition'

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Progress Dashboard</h1>
        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden text-sm">
          <button
            onClick={() => setDisplayUnit('kg')}
            className={`px-3 py-1.5 font-medium transition-colors ${
              displayUnit === 'kg'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            kg
          </button>
          <button
            onClick={() => setDisplayUnit('lbs')}
            className={`px-3 py-1.5 font-medium transition-colors ${
              displayUnit === 'lbs'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            lbs
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <input type="date" value={filters.date_from} onChange={updateFilter('date_from')} className={selectCls} />
        <input type="date" value={filters.date_to} onChange={updateFilter('date_to')} className={selectCls} />
        <select value={filters.category} onChange={updateFilter('category')} className={selectCls}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={filters.exercise} onChange={updateFilter('exercise')} className={selectCls}>
          <option value="">All Exercises</option>
          {filteredExercises.map((e) => (
            <option key={`${e.category}-${e.exercise_name}`} value={e.exercise_name}>
              {e.exercise_name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-12">Loading...</p>
      ) : (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-4 h-80">
              <ProgressionChart data={summary} displayUnit={displayUnit} />
            </div>
            <div className="bg-white rounded-xl shadow p-4 h-80">
              <VolumeChart data={summary} displayUnit={displayUnit} />
            </div>
          </div>

          {/* Recent Entries Table */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-900 px-4 py-3 border-b border-gray-100">
              Recent Entries
            </h2>
            {entries.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No entries found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Category</th>
                      <th className="px-4 py-2">Exercise</th>
                      <th className="px-4 py-2">Sets</th>
                      <th className="px-4 py-2">Reps</th>
                      <th className="px-4 py-2">Weight</th>
                      <th className="px-4 py-2">Notes</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {entries.map((e) => (
                      <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2 whitespace-nowrap">{e.date}</td>
                        <td className="px-4 py-2">{e.category}</td>
                        <td className="px-4 py-2 font-medium text-gray-900">{e.exercise_name}</td>
                        <td className="px-4 py-2">{e.sets}</td>
                        <td className="px-4 py-2">{e.reps}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {formatWeight(e.weight_kg, displayUnit)}
                        </td>
                        <td className="px-4 py-2 text-gray-400 max-w-[150px] truncate">
                          {e.notes || '-'}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => deleteEntry(e.id)}
                            className="text-red-400 hover:text-red-600 transition-colors text-xs"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

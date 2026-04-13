import { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import ProgressionChart from '../components/charts/ProgressionChart'
import VolumeChart from '../components/charts/VolumeChart'
import { formatWeight } from '../utils/unitConversion'

export default function ViewData() {
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
  const [colSearch, setColSearch] = useState({ date: '', category: '', exercise_name: '', sets: '', reps: '', weight: '', notes: '' })
  const [sortCol, setSortCol] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
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
      const res = await axios.get('/api/workouts', { params })
      setEntries(res.data)
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

  const updateColSearch = (col, value) =>
    setColSearch((prev) => ({ ...prev, [col]: value }))

  const toggleSort = (col) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  const tableEntries = useMemo(() => {
    let rows = [...entries]

    Object.entries(colSearch).forEach(([col, q]) => {
      if (!q.trim()) return
      const lower = q.toLowerCase()
      rows = rows.filter((e) => {
        if (col === 'weight') return String(e.weight_kg).includes(lower)
        const val = e[col]
        return val != null && String(val).toLowerCase().includes(lower)
      })
    })

    rows.sort((a, b) => {
      let aVal, bVal
      if (sortCol === 'weight') {
        aVal = a.weight_kg; bVal = b.weight_kg
      } else if (['sets', 'reps'].includes(sortCol)) {
        aVal = a[sortCol]; bVal = b[sortCol]
      } else {
        aVal = String(a[sortCol] || '').toLowerCase()
        bVal = String(b[sortCol] || '').toLowerCase()
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return rows
  }, [entries, colSearch, sortCol, sortDir])

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
              <ProgressionChart entries={entries} displayUnit={displayUnit} />
            </div>
            <div className="bg-white rounded-xl shadow p-4 h-80">
              <VolumeChart entries={entries} displayUnit={displayUnit} />
            </div>
          </div>

          {/* Recent Entries Table */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Entries</h2>
              <span className="text-xs text-gray-400">{tableEntries.length} row{tableEntries.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  {/* Sortable column headers */}
                  <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                    {[
                      { key: 'date', label: 'Date' },
                      { key: 'category', label: 'Category' },
                      { key: 'exercise_name', label: 'Exercise' },
                      { key: 'sets', label: 'Sets' },
                      { key: 'reps', label: 'Reps' },
                      { key: 'weight', label: 'Weight' },
                      { key: 'notes', label: 'Notes' },
                    ].map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-2 cursor-pointer select-none hover:text-indigo-600 transition-colors"
                        onClick={() => toggleSort(col.key)}
                      >
                        <span className="inline-flex items-center gap-1">
                          {col.label}
                          {sortCol === col.key && (
                            <span className="text-indigo-500">{sortDir === 'asc' ? '▲' : '▼'}</span>
                          )}
                        </span>
                      </th>
                    ))}
                    <th className="px-4 py-2"></th>
                  </tr>
                  {/* Per-column search inputs */}
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['date', 'category', 'exercise_name', 'sets', 'reps', 'weight', 'notes'].map((col) => (
                      <th key={col} className="px-4 py-1.5">
                        <input
                          type="text"
                          value={colSearch[col]}
                          onChange={(e) => updateColSearch(col, e.target.value)}
                          placeholder="Filter..."
                          className="w-full rounded border border-gray-200 px-2 py-1 text-xs font-normal text-gray-700 focus:border-indigo-400 outline-none placeholder:text-gray-300"
                        />
                      </th>
                    ))}
                    <th className="px-4 py-1.5">
                      <button
                        onClick={() => setColSearch({ date: '', category: '', exercise_name: '', sets: '', reps: '', weight: '', notes: '' })}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        title="Clear all filters"
                      >
                        Clear
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tableEntries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-gray-400 py-8 text-sm">No matching entries</td>
                    </tr>
                  ) : (
                    tableEntries.map((e) => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

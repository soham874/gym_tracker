import { useState, useEffect } from 'react'
import axios from 'axios'

const today = () => new Date().toISOString().split('T')[0]
const emptySet = () => ({ sets: '', reps: '', weight: '', unit: 'kg' })

export default function AddData() {
  const [categories, setCategories] = useState([])
  const [exercises, setExercises] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [date, setDate] = useState(today())
  const [category, setCategory] = useState('')
  const [exerciseName, setExerciseName] = useState('')
  const [entries, setEntries] = useState([emptySet()])
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState(null)
  const [previousSets, setPreviousSets] = useState([])

  useEffect(() => {
    axios.get('/api/workouts/categories').then((r) => setCategories(r.data))
    axios.get('/api/workouts/exercises').then((r) => setExercises(r.data))
  }, [])

  useEffect(() => {
    if (!exerciseName.trim()) {
      setPreviousSets([])
      return
    }
    const timer = setTimeout(() => {
      axios
        .get('/api/workouts', { params: { exercise: exerciseName } })
        .then((r) => {
          if (r.data.length === 0) {
            setPreviousSets([])
            return
          }
          setPreviousSets(r.data.slice(0, 10))
        })
        .catch(() => setPreviousSets([]))
    }, 300)
    return () => clearTimeout(timer)
  }, [exerciseName])

  useEffect(() => {
    if (category) {
      setSuggestions(
        exercises.filter((e) => e.category === category).map((e) => e.exercise_name)
      )
    } else {
      setSuggestions([])
    }
  }, [category, exercises])

  const updateEntry = (idx, field, value) => {
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e)))
  }

  const addRow = () => setEntries((prev) => [...prev, emptySet()])

  const removeRow = (idx) => {
    if (entries.length === 1) return
    setEntries((prev) => prev.filter((_, i) => i !== idx))
  }

  const submit = async (e) => {
    e.preventDefault()
    setStatus(null)
    try {
      await axios.post('/api/workouts/batch', {
        date,
        category,
        exercise_name: exerciseName,
        entries: entries.map((en) => ({
          sets: Number(en.sets),
          reps: Number(en.reps),
          weight: Number(en.weight),
          unit: en.unit,
        })),
        notes: notes || null,
      })
      setStatus({ ok: true, msg: `Logged ${entries.length} set(s)!` })
      setExerciseName('')
      setEntries([emptySet()])
      setNotes('')
      axios.get('/api/workouts/exercises').then((r) => setExercises(r.data))
    } catch (err) {
      setStatus({
        ok: false,
        msg: err.response?.data?.detail || 'Something went wrong',
      })
    }
  }

  const inputCls =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition'

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Log Workout</h1>

      {status && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${
            status.ok
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {status.msg}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} required />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select value={category} onChange={(e) => { setCategory(e.target.value); setExerciseName('') }} className={inputCls} required>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Exercise quick-select chips */}
        {suggestions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recent Exercises</label>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setExerciseName(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    exerciseName === s
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Exercise name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Name</label>
          <input
            type="text"
            list="exercise-suggestions"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            placeholder="e.g. Bench Press"
            className={inputCls}
            required
          />
          <datalist id="exercise-suggestions">
            {suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        {/* Set rows */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Sets</label>
            <button
              type="button"
              onClick={addRow}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              + Add set row
            </button>
          </div>
          <div className="space-y-3">
            {entries.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                <span className="text-xs text-gray-400 w-5 shrink-0 text-center">{idx + 1}</span>
                <input
                  type="number"
                  min="1"
                  placeholder="Sets"
                  value={entry.sets}
                  onChange={(e) => updateEntry(idx, 'sets', e.target.value)}
                  className="w-16 rounded border border-gray-300 px-2 py-1.5 text-sm text-center focus:border-indigo-500 outline-none"
                  required
                />
                <span className="text-gray-400 text-xs">x</span>
                <input
                  type="number"
                  min="1"
                  placeholder="Reps"
                  value={entry.reps}
                  onChange={(e) => updateEntry(idx, 'reps', e.target.value)}
                  className="w-16 rounded border border-gray-300 px-2 py-1.5 text-sm text-center focus:border-indigo-500 outline-none"
                  required
                />
                <span className="text-gray-400 text-xs">@</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Weight"
                  value={entry.weight}
                  onChange={(e) => updateEntry(idx, 'weight', e.target.value)}
                  className="w-20 rounded border border-gray-300 px-2 py-1.5 text-sm text-center focus:border-indigo-500 outline-none"
                  required
                />
                <div className="inline-flex rounded border border-gray-300 overflow-hidden text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => updateEntry(idx, 'unit', 'kg')}
                    className={`px-2 py-1.5 font-medium transition-colors ${
                      entry.unit === 'kg' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'
                    }`}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    onClick={() => updateEntry(idx, 'unit', 'lbs')}
                    className={`px-2 py-1.5 font-medium transition-colors ${
                      entry.unit === 'lbs' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'
                    }`}
                  >
                    lbs
                  </button>
                </div>
                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                    aria-label="Remove set"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputCls}
            placeholder="Any extra info..."
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors shadow"
        >
          Save Workout ({entries.length} set{entries.length > 1 ? 's' : ''})
        </button>
      </form>

      {/* Previous sets */}
      {previousSets.length > 0 && (
        <div className="mt-6 rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
            <p className="text-xs font-medium text-gray-500">
              Previous records — {exerciseName}
            </p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="px-3 py-1.5 text-left font-medium">Date</th>
                <th className="px-3 py-1.5 text-center font-medium">Sets</th>
                <th className="px-3 py-1.5 text-center font-medium">Reps</th>
                <th className="px-3 py-1.5 text-center font-medium">Weight</th>
                <th className="px-3 py-1.5 text-left font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {previousSets.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-3 py-1.5 text-gray-500 text-xs">{s.date}</td>
                  <td className="px-3 py-1.5 text-center">{s.sets}</td>
                  <td className="px-3 py-1.5 text-center">{s.reps}</td>
                  <td className="px-3 py-1.5 text-center">{s.weight_kg} kg</td>
                  <td className="px-3 py-1.5 text-gray-500 text-xs truncate max-w-[120px]">{s.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

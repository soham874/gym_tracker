import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
        Gym Tracker
      </h1>
      <p className="mt-4 text-lg text-gray-500 max-w-md">
        Log your workouts, track your progress, and visualize your gains over time.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link
          to="/add"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold text-base shadow hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Workout
        </Link>
        <Link
          to="/view"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-indigo-600 font-semibold text-base shadow border border-indigo-200 hover:bg-indigo-50 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          View Progress
        </Link>
      </div>
    </div>
  )
}

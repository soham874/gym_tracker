import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import AddData from './pages/AddData'
import ViewData from './pages/ViewData'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddData />} />
          <Route path="/view" element={<ViewData />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

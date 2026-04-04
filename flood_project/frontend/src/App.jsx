import Dashboard from './pages/Dashboard'
import { RegionProvider } from './context/RegionContext'

function App() {
  return (
    <RegionProvider>
      <div className="h-screen w-screen overflow-hidden bg-slate-900 text-slate-200 font-sans flex flex-col">
        <Dashboard />
      </div>
    </RegionProvider>
  )
}

export default App

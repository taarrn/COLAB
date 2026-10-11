import { useEffect, useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import type { Page } from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import ProgramKerja from './pages/ProgramKerja'
import { loadPrograms, savePrograms } from './data'
import type { Program } from './data'

function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [programs, setPrograms] = useState<Program[]>(loadPrograms)

  // Simpan ke localStorage setiap data program berubah
  useEffect(() => {
    savePrograms(programs)
  }, [programs])

  const addProgram = (data: Omit<Program, 'id'>) =>
    setPrograms((prev) => [{ ...data, id: Date.now() }, ...prev])

  return (
    <div className="app">
      <Sidebar page={page} onNavigate={setPage} />

      <main className="main-content">
        {page === 'dashboard' ? (
          <Dashboard programs={programs} onNavigate={setPage} />
        ) : (
          <ProgramKerja programs={programs} onAdd={addProgram} />
        )}

        <footer className="footer">
          KOLAB © 2026 — Kolaborasi lebih terarah, organisasi lebih produktif.
        </footer>
      </main>
    </div>
  )
}

export default App
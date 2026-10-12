import { useEffect, useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import type { Page } from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import ProgramKerja from './pages/ProgramKerja'
import ProgramDetail from './pages/ProgramDetail'
import ManajemenTugas from './pages/ManajemenTugas'
import KalenderKegiatan from './pages/KalenderKegiatan'
import LaporanProgres from './pages/LaporanProgres'

import {
  anggotaById,
  loadPrograms,
  loadTugas,
  loadUserId,
  savePrograms,
  saveTugas,
  saveUserId,
} from './data'
import type { Program, Tugas, TugasInput } from './data'

function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null)
  const [programs, setPrograms] = useState<Program[]>(loadPrograms)
  const [tugas, setTugas] = useState<Tugas[]>(loadTugas)
  const [userId, setUserId] = useState<number>(loadUserId)

  // Simpan ke localStorage setiap data berubah
  useEffect(() => {
    savePrograms(programs)
  }, [programs])

  useEffect(() => {
    saveTugas(tugas)
  }, [tugas])

  useEffect(() => {
    saveUserId(userId)
  }, [userId])

  const user = anggotaById(userId)
  const selectedProgram = programs.find((p) => p.id === selectedProgramId)

  const navigate = (target: Page) => {
    setPage(target)
    setSelectedProgramId(null)
  }

  const addProgram = (data: Omit<Program, 'id'>) =>
    setPrograms((prev) => [{ ...data, id: Date.now() }, ...prev])

  const updateProgram = (id: number, data: Omit<Program, 'id'>) =>
    setPrograms((prev) => prev.map((p) => (p.id === id ? { ...data, id } : p)))

  // Menghapus program ikut menghapus semua tugasnya
  const deleteProgram = (id: number) => {
    setPrograms((prev) => prev.filter((p) => p.id !== id))
    setTugas((prev) => prev.filter((t) => t.programId !== id))
    setSelectedProgramId(null)
  }

  const addTugas = (data: TugasInput) =>
    setTugas((prev) => [{ ...data, id: Date.now(), selesai: false }, ...prev])

  const updateTugas = (id: number, data: TugasInput) =>
    setTugas((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)))

  const toggleTugas = (id: number) =>
    setTugas((prev) => prev.map((t) => (t.id === id ? { ...t, selesai: !t.selesai } : t)))

  const deleteTugas = (id: number) =>
    setTugas((prev) => prev.filter((t) => t.id !== id))

  const setBobot = (id: number, bobot: number) => {
    const aman = Math.min(100, Math.max(0, Math.round(bobot) || 0))
    setTugas((prev) => prev.map((t) => (t.id === id ? { ...t, bobot: aman } : t)))
  }

  // Bagi bobot sama rata ke semua tugas program, sisa pembulatan ke tugas pertama
  const bagiRata = (programId: number) =>
    setTugas((prev) => {
      const jumlah = prev.filter((t) => t.programId === programId).length
      if (jumlah === 0) return prev
      const dasar = Math.floor(100 / jumlah)
      let sisa = 100 - dasar * jumlah
      return prev.map((t) => {
        if (t.programId !== programId) return t
        const tambahan = sisa > 0 ? 1 : 0
        sisa -= tambahan
        return { ...t, bobot: dasar + tambahan }
      })
    })

  return (
    <div className="app">
      <Sidebar page={page} onNavigate={navigate} user={user} onChangeUser={setUserId} />

      <main className="main-content">
        {page === 'dashboard' && (
          <Dashboard programs={programs} tugas={tugas} onNavigate={navigate} />
        )}

        {page === 'program' &&
          (selectedProgram ? (
            <ProgramDetail
              program={selectedProgram}
              tugas={tugas}
              user={user}
              onBack={() => setSelectedProgramId(null)}
              onUpdate={(data) => updateProgram(selectedProgram.id, data)}
              onDelete={() => deleteProgram(selectedProgram.id)}
              onSetBobot={setBobot}
              onBagiRata={() => bagiRata(selectedProgram.id)}
              onAddTugas={addTugas}
              onUpdateTugas={updateTugas}
              onDeleteTugas={deleteTugas}
            />
          ) : (
            <ProgramKerja
              programs={programs}
              tugas={tugas}
              onAdd={addProgram}
              onOpen={setSelectedProgramId}
            />
          ))}

        {page === 'tugas' && (
          <ManajemenTugas
            programs={programs}
            tugas={tugas}
            user={user}
            onAdd={addTugas}
            onUpdate={updateTugas}
            onToggle={toggleTugas}
            onDelete={deleteTugas}
          />
        )}
        
        {page === 'kalender' && (
          <KalenderKegiatan
            programs={programs}
            tugas={tugas}
            user={user}
            onAddTugas={addTugas}
            onToggleTugas={toggleTugas}
          />
          
        )}
          {page === 'laporan' &&
           <LaporanProgres 
           programs={programs} 
           tugas={tugas} 
           />
           }

        <footer className="footer">

          KOLAB © 2026 — Kolaborasi lebih terarah, organisasi lebih produktif.
        </footer>
      </main>
    </div>
  )
}

export default App
import { useEffect, useState } from 'react'
import './ManajemenTugas.css'
import TugasForm from '../components/TugasForm'
import { anggotaById, formatTanggal } from '../data'
import type { Anggota, Program, Tugas, TugasInput } from '../data'

interface Props {
  programs: Program[]
  tugas: Tugas[]
  user: Anggota
  onAdd: (data: TugasInput) => void
  onUpdate: (id: number, data: TugasInput) => void
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

type Filter = 'Semua' | 'Belum selesai' | 'Selesai'
const filters: Filter[] = ['Semua', 'Belum selesai', 'Selesai']
const prioritasClass = { Tinggi: 'high', Sedang: 'medium', Rendah: 'low' } as const

export default function ManajemenTugas({
  programs,
  tugas,
  user,
  onAdd,
  onUpdate,
  onToggle,
  onDelete,
}: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Tugas | null>(null)
  const [filter, setFilter] = useState<Filter>('Semua')
  const [programFilter, setProgramFilter] = useState('semua')

  useEffect(() => {
    if (!showForm && !editing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setShowForm(false)
      setEditing(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showForm, editing])

  const namaProgram = (id: number) =>
    programs.find((p) => p.id === id)?.nama ?? 'Program dihapus'

  const cocok = (t: Tugas) =>
    (programFilter === 'semua' || t.programId === Number(programFilter)) &&
    (filter === 'Semua' || (filter === 'Selesai') === t.selesai)

  // Tugas yang belum selesai ditampilkan lebih dulu
  const visible = tugas.filter(cocok).sort((a, b) => Number(a.selesai) - Number(b.selesai))

  const countOf = (f: Filter) =>
    tugas.filter(
      (t) =>
        (programFilter === 'semua' || t.programId === Number(programFilter)) &&
        (f === 'Semua' || (f === 'Selesai') === t.selesai),
    ).length

  const hapus = (t: Tugas) => {
    if (window.confirm(`Hapus tugas "${t.nama}"?`)) onDelete(t.id)
  }

  // Hanya PJ sebuah program yang boleh menambah, mengubah, dan menghapus tugasnya
  const programSaya = programs.filter((p) => p.pjId === user.id)
  const adalahPj = (programId: number) => programSaya.some((p) => p.id === programId)

  const tidakAdaProgram = programs.length === 0
  const tambahDisabled = tidakAdaProgram || programSaya.length === 0
  const tambahTitle = tidakAdaProgram
    ? 'Buat program kerja dulu'
    : tambahDisabled
      ? 'Hanya penanggung jawab program yang bisa menambah tugas'
      : undefined

  return (
    <>
      <header className="topbar">
        <div>
          <p className="breadcrumb">Menu Utama / Manajemen Tugas</p>
          <h1>Manajemen Tugas</h1>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={tambahDisabled}
          title={tambahTitle}
        >
          + Tambah tugas
        </button>
      </header>

      <div className="toolbar">
        <div className="tabs" role="tablist">
          {filters.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              className={`tab${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f} <span className="tab-count">{countOf(f)}</span>
            </button>
          ))}
        </div>

        <select
          className="search"
          aria-label="Filter program kerja"
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
        >
          <option value="semua">Semua program</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama}
            </option>
          ))}
        </select>
      </div>

      {!tidakAdaProgram && tambahDisabled && (
        <p className="detail-note">
          Kamu masuk sebagai {user.nama}, belum menjadi penanggung jawab program mana pun, jadi
          tugas hanya bisa dilihat dan ditandai selesai kalau ditugaskan ke kamu.
        </p>
      )}

      {tidakAdaProgram && (
        <div className="panel empty-state">
          <h3>Belum ada program kerja</h3>
          <p>Tugas harus terhubung ke program kerja. Buat program kerja dulu di menu Program Kerja.</p>
        </div>
      )}

      {!tidakAdaProgram && visible.length === 0 && (
        <div className="panel empty-state">
          <h3>{tugas.length === 0 ? 'Belum ada tugas' : 'Tidak ada tugas yang cocok'}</h3>
          <p>
            {tugas.length === 0
              ? 'Tambahkan tugas pertama. Progres program akan dihitung dari tugas yang selesai.'
              : 'Coba ubah filter status atau program.'}
          </p>
        </div>
      )}

      {visible.length > 0 && (
        <div className="panel task-list">
          {visible.map((t) => (
            <div className={`task-row${t.selesai ? ' done' : ''}`} key={t.id}>
              <input
                type="checkbox"
                className="task-checkbox"
                checked={t.selesai}
                onChange={() => onToggle(t.id)}
                disabled={!adalahPj(t.programId) && t.anggotaId !== user.id}
                aria-label={`Tandai selesai: ${t.nama}`}
              />
              <div className="task-main">
                <strong>{t.nama}</strong>
                <p>
                  {namaProgram(t.programId)} · {anggotaById(t.anggotaId).nama}
                  {t.tenggat && ` · Tenggat ${formatTanggal(t.tenggat)}`}
                </p>
              </div>
              <span className={`priority ${prioritasClass[t.prioritas]}`}>{t.prioritas}</span>
              {adalahPj(t.programId) && (
                <>
                  <button
                    className="task-edit"
                    onClick={() => setEditing(t)}
                    aria-label={`Edit tugas: ${t.nama}`}
                    title="Edit / alihkan tugas"
                  >
                    ✎
                  </button>
                  <button
                    className="task-delete"
                    onClick={() => hapus(t)}
                    aria-label={`Hapus tugas: ${t.nama}`}
                    title="Hapus tugas"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && !tambahDisabled && (
        <div className="overlay" onMouseDown={() => setShowForm(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tugas-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 id="tugas-title">Tambah tugas</h2>
            <TugasForm
              programs={programSaya}
              defaultProgramId={programFilter === 'semua' ? undefined : Number(programFilter)}
              onCancel={() => setShowForm(false)}
              onSubmit={(data) => {
                onAdd(data)
                setFilter('Semua')
                setShowForm(false)
              }}
            />
          </div>
        </div>
      )}

      {editing && (
        <div className="overlay" onMouseDown={() => setEditing(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-tugas-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 id="edit-tugas-title">Edit tugas</h2>
            <TugasForm
              programs={programSaya}
              initial={editing}
              onCancel={() => setEditing(null)}
              onSubmit={(data) => {
                onUpdate(editing.id, data)
                setEditing(null)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
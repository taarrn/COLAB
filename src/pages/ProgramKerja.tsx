import { useEffect, useState } from 'react'
import './ProgramKerja.css'
import ProgramForm from '../components/ProgramForm'
import { anggotaById, formatTanggal, hitungProgres, statusList, toneOf } from '../data'
import type { Program, Status, Tugas } from '../data'

interface Props {
  programs: Program[]
  tugas: Tugas[]
  onAdd: (data: Omit<Program, 'id'>) => void
  onOpen: (id: number) => void
}

export default function ProgramKerja({ programs, tugas, onAdd, onOpen }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<Status | 'Semua'>('Semua')
  const [query, setQuery] = useState('')

  // Tutup modal dengan tombol Escape
  useEffect(() => {
    if (!showForm) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShowForm(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showForm])

  // Progres dan status dihitung dari tugas tiap program
  const rows = programs.map((p) => ({ program: p, ...hitungProgres(p.id, tugas) }))

  const visible = rows.filter(
    (r) =>
      (filter === 'Semua' || r.status === filter) &&
      r.program.nama.toLowerCase().includes(query.trim().toLowerCase()),
  )

  const countOf = (s: Status | 'Semua') =>
    s === 'Semua' ? rows.length : rows.filter((r) => r.status === s).length

  return (
    <>
      <header className="topbar">
        <div>
          <p className="breadcrumb">Menu Utama / Program Kerja</p>
          <h1>Program Kerja</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Tambah program
        </button>
      </header>

      <div className="toolbar">
        <div className="tabs" role="tablist">
          {(['Semua', ...statusList] as const).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={filter === s}
              className={`tab${filter === s ? ' active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s} <span className="tab-count">{countOf(s)}</span>
            </button>
          ))}
        </div>
        <input
          className="search"
          type="search"
          placeholder="Cari nama program"
          aria-label="Cari nama program"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {visible.length === 0 ? (
        <div className="panel empty-state">
          <h3>{programs.length === 0 ? 'Belum ada program kerja' : 'Tidak ada program yang cocok'}</h3>
          <p>
            {programs.length === 0
              ? 'Tambahkan program pertama untuk mulai memantau progresnya.'
              : 'Coba ubah filter status atau kata pencarian.'}
          </p>
          {programs.length === 0 && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Tambah program
            </button>
          )}
        </div>
      ) : (
        <div className="program-grid">
          {visible.map(({ program: p, progres, status, total, selesai }) => {
            const tone = toneOf(p.departemen)
            return (
                            <article
                className="panel program-card clickable"
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpen(p.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onOpen(p.id)
                  }
                }}
              >
                <div className="program-card-top">
                  <span className={`badge ${tone}`}>{p.departemen}</span>
                  <span className={`state state-${status.toLowerCase()}`}>{status}</span>
                </div>

                <h3>{p.nama}</h3>
                {p.deskripsi && <p className="program-desc">{p.deskripsi}</p>}

                <dl className="program-meta">
                  <div>
                    <dt>Jadwal</dt>
                    <dd>
                      {formatTanggal(p.mulai)} – {formatTanggal(p.selesai)}
                    </dd>
                  </div>
                   <div>
                    <dt>Penanggung jawab</dt>
                    <dd>{anggotaById(p.pjId).nama}</dd>
                  </div>
                </dl>

                <div className="program-progress">
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${tone}-fill`}
                      style={{ width: `${progres}%` }}
                    />
                  </div>
                  <span className={`status status-${tone}`}>{progres}%</span>
                </div>
                <p className="program-tasks">
                  {total === 0
                    ? 'Belum ada tugas'
                    : `${selesai} dari ${total} tugas selesai`}
                </p>
              </article>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className="overlay" onMouseDown={() => setShowForm(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 id="form-title">Tambah program kerja</h2>
            <ProgramForm
              onCancel={() => setShowForm(false)}
              onSubmit={(data) => {
                onAdd(data)
                setFilter('Semua')
                setQuery('')
                setShowForm(false)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
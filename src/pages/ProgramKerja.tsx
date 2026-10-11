import { useEffect, useState } from 'react'
import './ProgramKerja.css'
import ProgramForm from '../components/ProgramForm'
import { statusList, toneOf } from '../data'
import type { Program, Status } from '../data'

interface Props {
  programs: Program[]
  onAdd: (data: Omit<Program, 'id'>) => void
}

const formatTanggal = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

export default function ProgramKerja({ programs, onAdd }: Props) {
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

  const visible = programs.filter(
    (p) =>
      (filter === 'Semua' || p.status === filter) &&
      p.nama.toLowerCase().includes(query.trim().toLowerCase()),
  )

  const countOf = (s: Status | 'Semua') =>
    s === 'Semua' ? programs.length : programs.filter((p) => p.status === s).length

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
          {visible.map((p) => {
            const tone = toneOf(p.departemen)
            return (
              <article className="panel program-card" key={p.id}>
                <div className="program-card-top">
                  <span className={`badge ${tone}`}>{p.departemen}</span>
                  <span className={`state state-${p.status.toLowerCase()}`}>{p.status}</span>
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
                  {p.penanggungJawab && (
                    <div>
                      <dt>Penanggung jawab</dt>
                      <dd>{p.penanggungJawab}</dd>
                    </div>
                  )}
                </dl>

                <div className="program-progress">
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${tone}-fill`}
                      style={{ width: `${p.progres}%` }}
                    />
                  </div>
                  <span className={`status status-${tone}`}>{p.progres}%</span>
                </div>
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
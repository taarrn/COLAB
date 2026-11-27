import { useState } from 'react'
import './ProgramKerja.css'
import ProgramForm from '../components/ProgramForm'
import { Avatar, Empty, Icon, Meter, Modal, PageHead } from '../components/ui'
import { anggotaById, formatTanggal, hitungProgres, singkatDivisi, statusList, toneOf } from '../data'
import type { Program, Status, Tugas } from '../data'

interface Props {
  programs: Program[]
  tugas: Tugas[]
  onAdd: (data: Omit<Program, 'id'>) => void
  bolehTambah: boolean
  unitBoleh: string[]
  labelUnit: string
  onOpen: (id: number) => void
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function ProgramKerja({ programs, tugas, onAdd, onOpen, bolehTambah, unitBoleh, labelUnit }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<Status | 'Semua'>('Semua')
  const [query, setQuery] = useState('')

  // Progres dan status dihitung dari tugas tiap program
  const rows = programs.map((p) => ({ program: p, ...hitungProgres(p.id, tugas) }))

  const visible = rows.filter(
    (r) =>
      (filter === 'Semua' || r.status === filter) &&
      r.program.nama.toLowerCase().includes(query.trim().toLowerCase()),
  )

  const countOf = (s: Status | 'Semua') =>
    s === 'Semua' ? rows.length : rows.filter((r) => r.status === s).length

  const berjalan = rows.filter((r) => r.status === 'Berjalan').length

  return (
    <>
      <PageHead
        eyebrow="Program kerja"
        title="Program Kerja"
        sticker={berjalan > 0 ? `${berjalan} sedang berjalan` : `${programs.length} program`}
      >
        {bolehTambah && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Icon name="plus" size={16} /> Tambah program
          </button>
        )}
      </PageHead>

      <div className="toolbar">
        <div className="segmented" role="tablist">
          {(['Semua', ...statusList] as const).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={filter === s}
              className={`seg${filter === s ? ' active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s} <span className="seg-count">{countOf(s)}</span>
            </button>
          ))}
        </div>
        <label className="search-box">
          <Icon name="search" size={16} />
          <input
            type="search"
            placeholder="Cari nama program"
            aria-label="Cari nama program"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      {visible.length === 0 ? (
        <Empty
          title={programs.length === 0 ? 'Belum ada program kerja' : 'Tidak ada program yang cocok'}
          text={
            programs.length === 0
              ? 'Tambahkan program pertama untuk mulai memantau progresnya.'
              : 'Coba ubah filter status atau kata pencarian.'
          }
          action={
            programs.length === 0 ? (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <Icon name="plus" size={16} /> Tambah program
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="program-grid">
          {visible.map(({ program: p, progres, status, total, selesai }, i) => {
            const tone = toneOf(p.departemen)
            const pj = anggotaById(p.pjId)
            return (
              <article
                className={`panel pcard tone-${tone}`}
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
                <span className="pcard-index" aria-hidden="true">
                  {pad(i + 1)}
                </span>

                <div className="pcard-top">
                  {p.departemen && <span className="badge">{singkatDivisi(p.departemen)}</span>}
                </div>

                <h3>{p.nama}</h3>
                {p.deskripsi && <p className="pcard-desc">{p.deskripsi}</p>}

                <dl className="pcard-meta">
                  <div>
                    <dt>Jadwal</dt>
                    <dd>
                      {formatTanggal(p.mulai)} – {formatTanggal(p.selesai)}
                    </dd>
                  </div>
                  <div>
                    <dt>Penanggung jawab</dt>
                    <dd className="pj">
                      <Avatar nama={pj.nama} tone={toneOf(pj.divisi)} size={22} />
                      {pj.nama}
                    </dd>
                  </div>
                </dl>

                <div className="pcard-foot">
                  <div className="pcard-progress">
                    <Meter value={progres} tone={tone} label={`Progres ${p.nama}`} />
                    <span className="pct">{progres}%</span>
                  </div>
                  <div className="pcard-sub">
                    <span>
                      {total === 0 ? 'Belum ada tugas' : `${selesai} dari ${total} tugas selesai`}
                    </span>
                    <span className={`state state-${status.toLowerCase()}`}>{status}</span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {showForm && bolehTambah && (
        <Modal title="Tambah program" eyebrow="Program baru" onClose={() => setShowForm(false)}>
          <ProgramForm
            units={unitBoleh}
            labelUnit={labelUnit}
            onCancel={() => setShowForm(false)}
            onSubmit={(data) => {
              onAdd(data)
              setFilter('Semua')
              setQuery('')
              setShowForm(false)
            }}
          />
        </Modal>
      )}
    </>
  )
}

import { useState } from 'react'
import './ManajemenTugas.css'
import TugasForm from '../components/TugasForm'
import { Empty, Icon, Modal, PageHead } from '../components/ui'
import { anggotaById, formatTanggal, hariIniKey, toneOf } from '../data'
import type { Anggota, Program, Tugas, TugasInput } from '../data'
import type { Akses } from '../org'

interface Props {
  programs: Program[]
  tugas: Tugas[]
  user: Anggota
  akses: Akses
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
  akses,
  onAdd,
  onUpdate,
  onToggle,
  onDelete,
}: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Tugas | null>(null)
  const [filter, setFilter] = useState<Filter>('Semua')
  const [programFilter, setProgramFilter] = useState('semua')

  const hariIni = hariIniKey()

  const cariProgram = (id: number) => programs.find((p) => p.id === id)
  const namaProgram = (id: number) => cariProgram(id)?.nama ?? 'Program dihapus'

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

  // Yang boleh membagi tugas: ketua proker programnya, atau pengurus dengan izin di unit itu
  const programSaya = programs.filter((p) => akses.kelolaTugas(p))
  const adalahPj = (programId: number) => programSaya.some((p) => p.id === programId)
  const bolehTandai = (t: Tugas) => akses.tandaiTugas(t.anggotaId, cariProgram(t.programId))

  const tidakAdaProgram = programs.length === 0
  const tambahDisabled = tidakAdaProgram || programSaya.length === 0
  const tambahTitle = tidakAdaProgram
    ? 'Buat program kerja dulu'
    : tambahDisabled
      ? 'Kamu belum punya wewenang membagi tugas di program mana pun'
      : undefined

  const belumSelesai = tugas.filter((t) => !t.selesai).length

  return (
    <>
      <PageHead
        eyebrow="Tugas"
        title="Manajemen Tugas"
        sticker={belumSelesai === 0 ? 'semua beres' : `${belumSelesai} belum selesai`}
      >
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={tambahDisabled}
          title={tambahTitle}
        >
          <Icon name="plus" size={16} /> Tambah tugas
        </button>
      </PageHead>

      <div className="toolbar">
        <div className="segmented" role="tablist">
          {filters.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              className={`seg${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f} <span className="seg-count">{countOf(f)}</span>
            </button>
          ))}
        </div>

        <select
          className="select-pill"
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
        <p className="note">
          Kamu masuk sebagai {user.nama}{user.jabatan ? ` (${user.jabatan})` : ''}. Kamu belum punya wewenang membagi tugas di program mana pun, jadi
          tugas hanya bisa dilihat dan ditandai selesai kalau ditugaskan ke kamu.
        </p>
      )}

      {tidakAdaProgram && (
        <Empty
          title="Belum ada program kerja"
          text="Tugas harus terhubung ke program kerja. Buat program kerja dulu di menu Program Kerja."
        />
      )}

      {!tidakAdaProgram && visible.length === 0 && (
        <Empty
          title={tugas.length === 0 ? 'Belum ada tugas' : 'Tidak ada tugas yang cocok'}
          text={
            tugas.length === 0
              ? 'Tambahkan tugas pertama. Progres program akan dihitung dari tugas yang selesai.'
              : 'Coba ubah filter status atau program.'
          }
        />
      )}

      {visible.length > 0 && (
        <div className="panel tlist">
          {visible.map((t) => {
            const program = cariProgram(t.programId)
            const telat = !t.selesai && !!t.tenggat && t.tenggat < hariIni
            return (
              <div className={`trow${t.selesai ? ' done' : ''}`} key={t.id}>
                <input
                  type="checkbox"
                  className="check"
                  checked={t.selesai}
                  onChange={() => onToggle(t.id)}
                  disabled={!bolehTandai(t)}
                  aria-label={`Tandai selesai: ${t.nama}`}
                />

                <div className="trow-main">
                  <strong>{t.nama}</strong>
                  <p>
                    <span className={`dot ${program ? `tone-${toneOf(program.departemen)}` : ''}`} />
                    {namaProgram(t.programId)}
                    <i>·</i>
                    {anggotaById(t.anggotaId).nama}
                    {t.tenggat && (
                      <>
                        <i>·</i>
                        <span className={telat ? 'late' : ''}>
                          {telat ? 'Terlambat, ' : 'Tenggat '}
                          {formatTanggal(t.tenggat)}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <span className={`prio ${prioritasClass[t.prioritas]}`}>{t.prioritas}</span>

                {adalahPj(t.programId) && (
                  <div className="trow-actions">
                    <button
                      className="icon-btn"
                      onClick={() => setEditing(t)}
                      aria-label={`Edit tugas: ${t.nama}`}
                      title="Edit / alihkan tugas"
                    >
                      <Icon name="edit" size={16} />
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={() => hapus(t)}
                      aria-label={`Hapus tugas: ${t.nama}`}
                      title="Hapus tugas"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && !tambahDisabled && (
        <Modal title="Tambah tugas" eyebrow="Tugas baru" onClose={() => setShowForm(false)}>
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
        </Modal>
      )}

      {editing && (
        <Modal title="Edit tugas" eyebrow="Ubah tugas" onClose={() => setEditing(null)}>
          <TugasForm
            programs={programSaya}
            initial={editing}
            onCancel={() => setEditing(null)}
            onSubmit={(data) => {
              onUpdate(editing.id, data)
              setEditing(null)
            }}
          />
        </Modal>
      )}
    </>
  )
}

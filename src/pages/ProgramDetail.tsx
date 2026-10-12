import { useEffect, useState } from 'react'
import './ProgramDetail.css'
import ProgramForm from '../components/ProgramForm'
import TugasForm from '../components/TugasForm'
import {
  anggotaById,
  formatTanggal,
  hitungProgres,
  ringkasAnggota,
  singkatDivisi,
  toneOf,
  totalBobot,
} from '../data'
import type { Anggota, Program, Tugas, TugasInput } from '../data'

interface Props {
  program: Program
  tugas: Tugas[]
  user: Anggota
  onBack: () => void
  onUpdate: (data: Omit<Program, 'id'>) => void
  onDelete: () => void
  onSetBobot: (tugasId: number, bobot: number) => void
  onBagiRata: () => void
  onAddTugas: (data: TugasInput) => void
  onUpdateTugas: (id: number, data: TugasInput) => void
  onDeleteTugas: (id: number) => void
}

// Form tugas: null = tertutup, {} = tambah, { tugas } = edit
type FormTugas = null | { anggotaId?: number; tugas?: Tugas }

export default function ProgramDetail({
  program,
  tugas,
  user,
  onBack,
  onUpdate,
  onDelete,
  onSetBobot,
  onBagiRata,
  onAddTugas,
  onUpdateTugas,
  onDeleteTugas,
}: Props) {
  const [showEdit, setShowEdit] = useState(false)
  const [formTugas, setFormTugas] = useState<FormTugas>(null)

  useEffect(() => {
    if (!showEdit && !formTugas) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setShowEdit(false)
      setFormTugas(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showEdit, formTugas])

  const pj = anggotaById(program.pjId)
  const bolehEdit = user.id === program.pjId // hanya PJ yang boleh mengubah
  const tone = toneOf(program.departemen)
  const { progres, status, total, selesai } = hitungProgres(program.id, tugas)
  const bobotTotal = totalBobot(program.id, tugas)
  const daftar = ringkasAnggota(program, tugas)

  const hapus = () => {
    if (window.confirm(`Hapus program "${program.nama}" beserta ${total} tugasnya?`)) {
      onDelete()
    }
  }

  const hapusTugas = (t: Tugas) => {
    if (window.confirm(`Hapus tugas "${t.nama}"?`)) onDeleteTugas(t.id)
  }

  const infoBobot =
    bobotTotal === 100
      ? 'Total bobot sudah 100%.'
      : bobotTotal === 0
        ? 'Bobot belum diisi, jadi semua tugas dianggap sama besar.'
        : `Total bobot ${bobotTotal}%, idealnya 100%. Progres tetap dihitung proporsional.`

  return (
    <>
      <header className="topbar">
        <div>
          <p className="breadcrumb">Menu Utama / Program Kerja / {program.nama}</p>
          <h1>{program.nama}</h1>
        </div>
        <div className="detail-actions">
          <button className="btn btn-ghost" onClick={onBack}>
            ← Kembali
          </button>
          {bolehEdit && (
            <>
              <button className="btn btn-ghost" onClick={() => setShowEdit(true)}>
                Edit
              </button>
              <button className="btn btn-danger" onClick={hapus}>
                Hapus
              </button>
            </>
          )}
        </div>
      </header>

      <section className="panel detail-summary">
        <div className="program-card-top">
          <span className={`badge ${tone}`}>{program.departemen}</span>
          <span className={`state state-${status.toLowerCase()}`}>{status}</span>
        </div>

        {program.deskripsi && <p className="program-desc">{program.deskripsi}</p>}

        <dl className="detail-meta">
          <div>
            <dt>Penanggung jawab</dt>
            <dd>
              {pj.nama} <span className="muted">· {singkatDivisi(pj.divisi)}</span>
            </dd>
          </div>
          <div>
            <dt>Jadwal</dt>
            <dd>
              {formatTanggal(program.mulai)} – {formatTanggal(program.selesai)}
            </dd>
          </div>
          <div>
            <dt>Tugas</dt>
            <dd>{total === 0 ? 'Belum ada tugas' : `${selesai} dari ${total} selesai`}</dd>
          </div>
        </dl>

        <div className="program-progress">
          <div className="progress-track">
            <div className={`progress-fill ${tone}-fill`} style={{ width: `${progres}%` }} />
          </div>
          <span className={`status status-${tone}`}>{progres}%</span>
        </div>
      </section>

      <div className="section-head">
        <div>
          <h2>Anggota yang terlibat</h2>
          <p className="legend">
            <span className="dot core" /> Tim inti ({singkatDivisi(program.departemen)})
            <span className="dot helper" /> Dibantu divisi lain
          </p>
        </div>
        {bolehEdit && (
          <button className="btn btn-primary" onClick={() => setFormTugas({})}>
            + Tambah tugas
          </button>
        )}
      </div>

      {total > 0 && (
        <div className={`bobot-bar${bobotTotal === 100 ? '' : ' warn'}`}>
          <span>{infoBobot}</span>
          {bolehEdit ? (
            <button className="btn btn-ghost btn-small" onClick={onBagiRata}>
              Bagi rata
            </button>
          ) : (
            <span className="muted">Hanya penanggung jawab yang bisa mengubah bobot.</span>
          )}
        </div>
      )}

      {total === 0 && (
        <p className="detail-note">
          {bolehEdit
            ? 'Belum ada tugas untuk program ini. Klik "Tambah tugas" untuk membagikan tugas ke anggota.'
            : 'Belum ada tugas untuk program ini. Penanggung jawab yang bisa menambahkannya.'}
        </p>
      )}

      {daftar.map(({ anggota, tugas: tugasAnggota, beban, progres: p, inti, pj: adalahPj }) => (
        <section
          className={`panel member ${inti ? 'member-core' : 'member-helper'}`}
          key={anggota.id}
        >
          <div className="member-head">
            <div className="member-avatar">{anggota.nama.charAt(0)}</div>
            <div className="member-id">
              <strong>
                {anggota.nama}
                {adalahPj && <span className="pj-tag">PJ</span>}
              </strong>
              <p>{singkatDivisi(anggota.divisi)}</p>
            </div>
            {bolehEdit && (
              <button
                className="btn btn-ghost btn-small"
                onClick={() => setFormTugas({ anggotaId: anggota.id })}
              >
                + Beri tugas
              </button>
            )}
            <span className={`role-tag ${inti ? 'core' : 'helper'}`}>
              {inti ? 'Tim inti' : 'Dibantu'}
            </span>
          </div>

          <div className="member-stats">
            <div className="member-beban">
              <span>Beban</span>
              <strong>{beban}%</strong>
            </div>
            <div className="program-progress">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${p}%` }} />
              </div>
              <span className="member-percent">{p}%</span>
            </div>
          </div>

          {tugasAnggota.length === 0 ? (
            <p className="member-empty">Belum memegang tugas.</p>
          ) : (
            <ul className="member-tasks">
              {tugasAnggota.map((t) => (
                <li key={t.id}>
                  <span className={`task-state${t.selesai ? ' done' : ''}`}>
                    {t.selesai ? '✓' : '○'}
                  </span>
                  <span className="member-task-name">{t.nama}</span>
                  {bolehEdit ? (
                    <label className="bobot-input">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={t.bobot}
                        onChange={(e) => onSetBobot(t.id, Number(e.target.value))}
                        aria-label={`Bobot tugas: ${t.nama}`}
                      />
                      %
                    </label>
                  ) : (
                    <span className="bobot-read">{t.bobot}%</span>
                  )}
                  {bolehEdit && (
                    <>
                      <button
                        className="mini-btn"
                        onClick={() => setFormTugas({ tugas: t })}
                        aria-label={`Edit tugas: ${t.nama}`}
                        title="Edit / alihkan tugas"
                      >
                        ✎
                      </button>
                      <button
                        className="mini-btn danger"
                        onClick={() => hapusTugas(t)}
                        aria-label={`Hapus tugas: ${t.nama}`}
                        title="Hapus tugas"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {showEdit && (
        <div className="overlay" onMouseDown={() => setShowEdit(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 id="edit-title">Edit program kerja</h2>
            <ProgramForm
              initial={program}
              onCancel={() => setShowEdit(false)}
              onSubmit={(data) => {
                onUpdate(data)
                setShowEdit(false)
              }}
            />
          </div>
        </div>
      )}

      {formTugas && bolehEdit && (
        <div className="overlay" onMouseDown={() => setFormTugas(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tugas-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 id="tugas-title">{formTugas.tugas ? 'Edit tugas' : 'Tambah tugas'}</h2>
            <TugasForm
              programs={[program]}
              lockProgram
              initial={formTugas.tugas}
              defaultProgramId={program.id}
              defaultAnggotaId={formTugas.anggotaId}
              onCancel={() => setFormTugas(null)}
              onSubmit={(data) => {
                if (formTugas.tugas) onUpdateTugas(formTugas.tugas.id, data)
                else onAddTugas(data)
                setFormTugas(null)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
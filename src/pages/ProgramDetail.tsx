import { useState } from 'react'
import './ProgramDetail.css'
import ProgramForm from '../components/ProgramForm'
import TugasForm from '../components/TugasForm'
import { Avatar, Icon, Meter, Modal, PageHead } from '../components/ui'
import {
  anggotaById,
  formatTanggal,
  hitungProgres,
  ringkasAnggota,
  singkatDivisi,
  toneOf,
  totalBobot,
} from '../data'
import type { Program, Tugas, TugasInput } from '../data'
import type { Akses } from '../org'

interface Props {
  program: Program
  tugas: Tugas[]
  akses: Akses
  unitBoleh: string[]
  labelUnit: string
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
  akses,
  unitBoleh,
  labelUnit,
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

  const pj = anggotaById(program.pjId)
  const bolehData = akses.editProgram(program) // ubah data program
  const bolehHapus = akses.hapusProgram(program) // ketua proker tidak bisa menghapus programnya
  const bolehEdit = akses.kelolaTugas(program) // bagi tugas dan atur bobot
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
      <PageHead eyebrow={singkatDivisi(program.departemen)} title={program.nama} sticker={status}>
        <button className="btn btn-ghost" onClick={onBack}>
          <Icon name="left" size={16} /> Kembali
        </button>
        {bolehData && (
          <button className="btn btn-ghost" onClick={() => setShowEdit(true)}>
            <Icon name="edit" size={15} /> Edit
          </button>
        )}
        {bolehHapus && (
          <button className="btn btn-danger" onClick={hapus}>
            <Icon name="trash" size={15} /> Hapus
          </button>
        )}
      </PageHead>

      <section className={`panel summary tone-${tone}`}>
        <div className="summary-main">
          <div className="summary-tags">
            {program.departemen && <span className="badge">{program.departemen}</span>}
            <span className={`state state-${status.toLowerCase()}`}>{status}</span>
          </div>

          {program.deskripsi && <p className="summary-desc">{program.deskripsi}</p>}

          <dl className="summary-meta">
            <div>
              <dt>Penanggung jawab</dt>
              <dd className="with-avatar">
                <Avatar nama={pj.nama} tone={toneOf(pj.divisi)} size={26} />
                <span>
                  {pj.nama} <small>{pj.divisi ? singkatDivisi(pj.divisi) : pj.jabatan}</small>
                </span>
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
        </div>

        <div className="summary-score">
          <div className="score-number" aria-label={`${progres} persen`}>
            {progres}
            <span>%</span>
          </div>
          <Meter value={progres} tone={tone} label={`Progres ${program.nama}`} />
          <p>progres program</p>
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
            <Icon name="plus" size={16} /> Tambah tugas
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
            <span className="muted">Hanya pengurus yang berwenang yang bisa mengubah bobot.</span>
          )}
        </div>
      )}

      {total === 0 && (
        <p className="note">
          {bolehEdit
            ? 'Belum ada tugas untuk program ini. Klik "Tambah tugas" untuk membagikan tugas ke anggota.'
            : 'Belum ada tugas untuk program ini. Ketua proker atau pengurus yang berwenang yang bisa menambahkannya.'}
        </p>
      )}

      <div className="member-grid">
        {daftar.map(({ anggota, tugas: tugasAnggota, beban, progres: p, inti, pj: adalahPj }) => (
          <section
            className={`panel member tone-${toneOf(anggota.divisi)} ${inti ? 'member-core' : 'member-helper'}`}
            key={anggota.id}
          >
            <div className="member-head">
              <Avatar nama={anggota.nama} tone={toneOf(anggota.divisi)} size={42} />
              <div className="member-id">
                <strong>
                  {anggota.nama}
                  {adalahPj && <span className="pj-tag">PJ</span>}
                </strong>
                <p>{anggota.divisi ? singkatDivisi(anggota.divisi) : anggota.jabatan}</p>
              </div>
              <span className={`role-tag ${inti ? 'core' : 'helper'}`}>{inti ? 'Tim inti' : 'Dibantu'}</span>
            </div>

            <div className="member-stats">
              <div className="member-beban">
                <span>Beban</span>
                <strong>{beban}%</strong>
              </div>
              <div className="member-progress">
                <Meter value={p} tone={toneOf(anggota.divisi)} label={`Progres ${anggota.nama}`} />
                <span className="pct">{p}%</span>
              </div>
            </div>

            {tugasAnggota.length === 0 ? (
              <p className="member-empty">Belum memegang tugas.</p>
            ) : (
              <ul className="member-tasks">
                {tugasAnggota.map((t) => (
                  <li key={t.id} className={t.selesai ? 'done' : ''}>
                    <span className={`tstate${t.selesai ? ' done' : ''}`} aria-hidden="true">
                      {t.selesai && <Icon name="check" size={20} />}
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
                          className="icon-btn"
                          onClick={() => setFormTugas({ tugas: t })}
                          aria-label={`Edit tugas: ${t.nama}`}
                          title="Edit / alihkan tugas"
                        >
                          <Icon name="edit" size={15} />
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => hapusTugas(t)}
                          aria-label={`Hapus tugas: ${t.nama}`}
                          title="Hapus tugas"
                        >
                          <Icon name="trash" size={15} />
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {bolehEdit && (
              <button
                className="btn btn-ghost btn-small member-add"
                onClick={() => setFormTugas({ anggotaId: anggota.id })}
              >
                <Icon name="plus" size={14} /> Beri tugas
              </button>
            )}
          </section>
        ))}
      </div>

      {showEdit && bolehData && (
        <Modal title="Edit program" eyebrow="Ubah program" onClose={() => setShowEdit(false)}>
          <ProgramForm
            initial={program}
            units={unitBoleh}
            labelUnit={labelUnit}
            onCancel={() => setShowEdit(false)}
            onSubmit={(data) => {
              onUpdate(data)
              setShowEdit(false)
            }}
          />
        </Modal>
      )}

      {formTugas && bolehEdit && (
        <Modal
          title={formTugas.tugas ? 'Edit tugas' : 'Tambah tugas'}
          eyebrow={program.nama}
          onClose={() => setFormTugas(null)}
        >
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
        </Modal>
      )}
    </>
  )
}

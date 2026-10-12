import { useState } from 'react'
import type { FormEvent } from 'react'
import { daftarAnggota, prioritasList, singkatDivisi } from '../data'
import type { Prioritas, Program, Tugas, TugasInput } from '../data'

interface Props {
  programs: Program[] // program yang boleh dipilih (hanya yang dipegang PJ)
  initial?: Tugas // diisi saat mengedit tugas
  defaultProgramId?: number
  defaultAnggotaId?: number
  defaultMulai?: string // dipakai kalender: tanggal yang diklik
  defaultTenggat?: string
  lockProgram?: boolean // true = program tidak bisa diganti (dipakai di halaman detail)
  onSubmit: (data: TugasInput) => void
  onCancel: () => void
}

export default function TugasForm({
  programs,
  initial,
  defaultProgramId,
  defaultAnggotaId,
  defaultMulai,
  defaultTenggat,
  lockProgram = false,
  onSubmit,
  onCancel,
}: Props) {
  const awalProgramId =
    initial?.programId ??
    (programs.some((p) => p.id === defaultProgramId) ? defaultProgramId : undefined) ??
    programs[0]?.id

  const [programId, setProgramId] = useState<number>(awalProgramId ?? 0)
  const [nama, setNama] = useState(initial?.nama ?? '')
  const [anggotaId, setAnggotaId] = useState<number>(
    initial?.anggotaId ?? defaultAnggotaId ?? programs.find((p) => p.id === awalProgramId)?.pjId ?? daftarAnggota[0].id,
  )
  const [prioritas, setPrioritas] = useState<Prioritas>(initial?.prioritas ?? 'Sedang')
  const [mulai, setMulai] = useState(initial?.mulai ?? defaultMulai ?? '')
  const [tenggat, setTenggat] = useState(initial?.tenggat ?? defaultTenggat ?? '')
  const [bobot, setBobot] = useState(String(initial?.bobot ?? 0))
  const [error, setError] = useState('')

  const program = programs.find((p) => p.id === programId)
  const anggotaInti = daftarAnggota.filter((a) => a.divisi === program?.departemen)
  const anggotaLain = daftarAnggota.filter((a) => a.divisi !== program?.departemen)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!program) return setError('Pilih program kerja dulu.')
    if (!nama.trim()) return setError('Nama tugas wajib diisi.')
    if (tenggat && (tenggat < program.mulai || tenggat > program.selesai)) {
      return setError('Tenggat harus berada dalam jadwal program.')
    }

    if (mulai && !tenggat) return setError('Isi tenggat kalau tanggal mulai diisi.')
    if (mulai && tenggat && mulai > tenggat) return setError('Tanggal mulai tidak boleh setelah tenggat.')
    if (mulai && (mulai < program.mulai || mulai > program.selesai)) {
      return setError('Tanggal mulai harus berada dalam jadwal program.')
    }

    const angkaBobot = Number(bobot)
    if (Number.isNaN(angkaBobot) || angkaBobot < 0 || angkaBobot > 100) {
      return setError('Bobot harus berupa angka 0 sampai 100.')
    }

    onSubmit({
      nama: nama.trim(),
      programId,
      anggotaId,
      prioritas,
      mulai: mulai || undefined,
      tenggat,
      bobot: Math.round(angkaBobot),
    })
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span>Program kerja</span>
        <select
          value={programId}
          disabled={lockProgram}
          onChange={(e) => setProgramId(Number(e.target.value))}
        >
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Nama tugas</span>
        <input
          autoFocus
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Contoh: Menghubungi pemateri"
        />
      </label>

      <label className="field">
        <span>Ditugaskan ke</span>
        <select value={anggotaId} onChange={(e) => setAnggotaId(Number(e.target.value))}>
          <optgroup label={`Tim inti (${program ? singkatDivisi(program.departemen) : '-'})`}>
            {anggotaInti.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nama}
              </option>
            ))}
          </optgroup>
          <optgroup label="Divisi lain (bantuan)">
            {anggotaLain.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nama} · {singkatDivisi(a.divisi)}
              </option>
            ))}
          </optgroup>
        </select>
      </label>

      <label className="field">
        <span>Prioritas</span>
        <select value={prioritas} onChange={(e) => setPrioritas(e.target.value as Prioritas)}>
          {prioritasList.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>

      <div className="field-row">
        <label className="field">
          <span>Mulai (opsional)</span>
          <input
            type="date"
            value={mulai}
            min={program?.mulai}
            max={program?.selesai}
            onChange={(e) => setMulai(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Tenggat</span>
          <input
            type="date"
            value={tenggat}
            min={program?.mulai}
            max={program?.selesai}
            onChange={(e) => setTenggat(e.target.value)}
          />
        </label>
      </div>

      <label className="field">
        <span>Bobot terhadap program (%)</span>
        <input
          type="number"
          min={0}
          max={100}
          value={bobot}
          onChange={(e) => setBobot(e.target.value)}
        />
      </label>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Batal
        </button>
        <button type="submit" className="btn btn-primary">
          {initial ? 'Simpan perubahan' : 'Simpan tugas'}
        </button>
      </div>
    </form>
  )
}
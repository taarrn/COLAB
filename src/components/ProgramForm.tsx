import { useState } from 'react'
import type { FormEvent } from 'react'
import { daftarAnggota, departemenList, singkatDivisi } from '../data'
import type { Program } from '../data'

type FormData = Omit<Program, 'id'>

interface Props {
  initial?: Program // diisi saat mengedit program
  onSubmit: (data: FormData) => void
  onCancel: () => void
}

export default function ProgramForm({ initial, onSubmit, onCancel }: Props) {
  const [nama, setNama] = useState(initial?.nama ?? '')
  const [departemen, setDepartemen] = useState(initial?.departemen ?? departemenList[0])
  const [pjId, setPjId] = useState(
    initial?.pjId ??
      daftarAnggota.find((a) => a.divisi === departemenList[0])?.id ??
      daftarAnggota[0].id,
  )
  const [mulai, setMulai] = useState(initial?.mulai ?? '')
  const [selesai, setSelesai] = useState(initial?.selesai ?? '')
  const [deskripsi, setDeskripsi] = useState(initial?.deskripsi ?? '')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!nama.trim()) return setError('Nama program wajib diisi.')
    if (!mulai || !selesai) return setError('Tanggal mulai dan selesai wajib diisi.')
    if (selesai < mulai) {
      return setError('Tanggal selesai tidak boleh sebelum tanggal mulai.')
    }

    onSubmit({
      nama: nama.trim(),
      departemen,
      pjId,
      mulai,
      selesai,
      deskripsi: deskripsi.trim(),
    })
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span>Nama program</span>
        <input
          autoFocus
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Contoh: Informatika Menyapa"
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Departemen</span>
          <select value={departemen} onChange={(e) => setDepartemen(e.target.value)}>
            {departemenList.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Penanggung jawab</span>
          <select value={pjId} onChange={(e) => setPjId(Number(e.target.value))}>
            {daftarAnggota.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nama} · {singkatDivisi(a.divisi)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>Tanggal mulai</span>
          <input type="date" value={mulai} onChange={(e) => setMulai(e.target.value)} />
        </label>

        <label className="field">
          <span>Tanggal selesai</span>
          <input
            type="date"
            value={selesai}
            min={mulai || undefined}
            onChange={(e) => setSelesai(e.target.value)}
          />
        </label>
      </div>

      <label className="field">
        <span>Deskripsi</span>
        <textarea
          rows={3}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          placeholder="Tujuan dan gambaran singkat program"
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
          {initial ? 'Simpan perubahan' : 'Simpan program'}
        </button>
      </div>
    </form>
  )
}
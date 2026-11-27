import { useState } from 'react'
import type { FormEvent } from 'react'
import { Icon, Modal } from './ui'
import { daftarTemplate, labelUnitPilihan } from '../org'
import type { KunciTemplate } from '../org'
import type { HasilKode } from '../store'

/* ---------- Buat organisasi ---------- */

export function BuatOrganisasi({
  onBuat,
  onClose,
}: {
  onBuat: (nama: string, labelUnit: string, template: KunciTemplate) => void
  onClose: () => void
}) {
  const [nama, setNama] = useState('')
  const [labelUnit, setLabelUnit] = useState('Departemen')
  const [template, setTemplate] = useState<KunciTemplate>('bem')
  const [error, setError] = useState('')

  const kirim = (e: FormEvent) => {
    e.preventDefault()
    if (nama.trim().length < 3) return setError('Nama organisasi minimal 3 huruf.')
    onBuat(nama.trim(), labelUnit.trim() || 'Unit', template)
  }

  return (
    <Modal
      title="Buat organisasi"
      eyebrow="Organisasi baru"
      subtitle="Kamu otomatis menjadi Ketua. Semua role dan unit bisa diubah nanti di Pengaturan."
      onClose={onClose}
    >
      <form className="form" onSubmit={kirim} noValidate>
        <label className="field">
          <span>Nama organisasi</span>
          <input autoFocus value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: BEM FMIPA USK" />
        </label>

        <label className="field">
          <span>Sebutan untuk bagian di dalamnya</span>
          <input list="label-unit" value={labelUnit} onChange={(e) => setLabelUnit(e.target.value)} />
          <datalist id="label-unit">
            {labelUnitPilihan.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </label>

        <div className="field">
          <span>Susunan awal</span>
          <div className="pilih-list" role="radiogroup">
            {daftarTemplate.map((t) => (
              <button
                type="button"
                role="radio"
                aria-checked={template === t.kunci}
                key={t.kunci}
                className={`pilih${template === t.kunci ? ' on' : ''}`}
                onClick={() => setTemplate(t.kunci)}
              >
                <strong>{t.nama}</strong>
                <small>{t.info}</small>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary">
            Buat organisasi
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ---------- Gabung dengan kode ---------- */

export function GabungModal({
  kodeAwal,
  cekKode,
  onGabung,
  onClose,
}: {
  kodeAwal?: string
  cekKode: (kode: string) => HasilKode
  onGabung: (kode: string) => { ok: boolean; pesan: string; menunggu?: boolean }
  onClose: () => void
}) {
  const [kode, setKode] = useState(kodeAwal ?? '')
  const [hasil, setHasil] = useState<{ ok: boolean; pesan: string; menunggu?: boolean } | null>(null)

  const cek = kode.trim().length >= 4 ? cekKode(kode) : null

  const kirim = (e: FormEvent) => {
    e.preventDefault()
    const h = onGabung(kode)
    if (h.ok && !h.menunggu) return onClose()
    setHasil(h)
  }

  return (
    <Modal
      title="Gabung ke organisasi"
      eyebrow="Kode undangan"
      subtitle="Minta kode atau link ke pengurus organisasinya."
      onClose={onClose}
    >
      {hasil?.ok ? (
        <>
          <p className="note">{hasil.pesan}</p>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={onClose}>
              Mengerti
            </button>
          </div>
        </>
      ) : (
        <form className="form" onSubmit={kirim} noValidate>
          <label className="field">
            <span>Kode</span>
            <input
              autoFocus
              value={kode}
              onChange={(e) => {
                setKode(e.target.value.toUpperCase())
                setHasil(null)
              }}
              placeholder="Contoh: HMIF26"
              className="kode-input"
              maxLength={12}
            />
          </label>

          {cek?.ok && (
            <div className="kode-preview">
              <Icon name="check" size={18} />
              <span>
                <strong>{cek.org.nama}</strong>
                <small>
                  Kamu masuk sebagai {cek.role.nama}
                  {cek.unit ? `, ${cek.org.labelUnit} ${cek.unit}` : ''}
                  {cek.undangan.perluSetuju ? '. Perlu disetujui pengurus.' : '.'}
                </small>
              </span>
            </div>
          )}
          {cek && !cek.ok && (
            <p className="form-error" role="alert">
              {cek.pesan}
            </p>
          )}
          {hasil && !hasil.ok && (
            <p className="form-error" role="alert">
              {hasil.pesan}
            </p>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={!cek?.ok}>
              Gabung
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

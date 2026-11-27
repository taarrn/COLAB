import { useState } from 'react'
import type { FormEvent } from 'react'
import { Avatar } from '../components/ui'
import type { Akun, Keanggotaan, Organisasi } from '../org'
import { labelJabatan } from '../org'

interface Props {
  akuns: Akun[]
  orgs: Organisasi[]
  members: Keanggotaan[]
  kodeUndangan?: string // dari link undangan, ditampilkan sebagai petunjuk
  onMasuk: (akunId: number) => void
  onDaftar: (nama: string, email: string) => void
  onKembali: () => void
}

export default function Masuk({ akuns, orgs, members, kodeUndangan, onMasuk, onDaftar, onKembali }: Props) {
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const ringkas = (akunId: number) => {
    const milik = members.filter((m) => m.akunId === akunId && m.status === 'aktif')
    if (milik.length === 0) return 'Belum bergabung ke organisasi'
    return milik
      .map((m) => {
        const o = orgs.find((x) => x.id === m.orgId)
        return o ? `${labelJabatan(o, m)} ${o.nama}` : ''
      })
      .filter(Boolean)
      .join(' · ')
  }

  const kirim = (e: FormEvent) => {
    e.preventDefault()
    if (!nama.trim()) return setError('Nama lengkap wajib diisi.')
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Format email belum benar.')
    onDaftar(nama.trim(), email.trim())
  }

  return (
    <div className="masuk-wrap">
      <div className="masuk">
        <button className="link-btn masuk-back" onClick={onKembali}>
          Kembali ke beranda
        </button>

        <div className="brand masuk-brand">
          <div className="brand-mark">K</div>
          <span className="brand-name">Kolab</span>
        </div>
        <h1>Masuk ke Kolab</h1>
        <p className="masuk-sub">
          {kodeUndangan
            ? `Kamu diundang dengan kode ${kodeUndangan}. Masuk atau buat akun dulu, lalu bergabungnya otomatis dilanjutkan.`
            : 'Satu akun bisa bergabung ke banyak organisasi, dengan jabatan yang berbeda di tiap organisasi.'}
        </p>

        <div className="masuk-cols">
          <section className="panel masuk-card">
            <h3>Pilih akun contoh</h3>
            <p className="muted">Versi prototipe tanpa kata sandi. Tiap akun punya jabatan berbeda untuk dicoba.</p>
            <ul className="akun-list">
              {akuns.map((a) => (
                <li key={a.id}>
                  <button onClick={() => onMasuk(a.id)}>
                    <Avatar nama={a.nama} tone={(['red', 'blue', 'lilac', 'butter', 'mint'] as const)[a.id % 5]} size={34} />
                    <span>
                      <strong>{a.nama}</strong>
                      <small>{ringkas(a.id)}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel masuk-card">
            <h3>Buat akun baru</h3>
            <p className="muted">Setelah itu kamu bisa membuat organisasi sendiri atau bergabung lewat kode undangan.</p>
            <form className="form" onSubmit={kirim} noValidate>
              <label className="field">
                <span>Nama lengkap</span>
                <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Raisa Salsa Nabila" />
              </label>
              <label className="field">
                <span>Email</span>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@mail.com" inputMode="email" />
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="btn btn-primary">
                Buat akun dan masuk
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

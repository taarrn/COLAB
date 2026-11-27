import { useState } from 'react'
import { Avatar, Modal } from './ui'
import { formatTanggal, singkatDivisi } from '../data'
import type { Program, Tone, Tugas } from '../data'
import { namaUnit, semuaJabatan } from '../org'
import type { Akun, Keanggotaan, Organisasi } from '../org'

const tones: Tone[] = ['red', 'blue', 'lilac', 'butter', 'mint']
export const toneAkun = (id: number): Tone => tones[id % tones.length]

/* Program yang diikuti dihitung otomatis dari data, tidak ada yang diisi manual.
   Ketua Proker = penanggung jawab program, Panitia = memegang tugas di program itu. */
export function programAkun(akunId: number, programs: Program[], tugas: Tugas[]) {
  return programs
    .map((p) => {
      if (p.pjId === akunId) return { program: p, peran: 'Ketua Proker' }
      if (tugas.some((t) => t.programId === p.id && t.anggotaId === akunId)) return { program: p, peran: 'Panitia' }
      return null
    })
    .filter((x): x is { program: Program; peran: string } => !!x)
}

/* ---------- Profil seseorang di dalam satu organisasi ---------- */

export function ProfilOrg({
  akun,
  org,
  member,
  programs,
  tugas,
  onClose,
}: {
  akun: Akun
  org: Organisasi
  member: Keanggotaan
  programs: Program[]
  tugas: Tugas[]
  onClose: () => void
}) {
  const jabatan = semuaJabatan(org, member)
  const unit = namaUnit(org, member)
  const ikut = programAkun(akun.id, programs, tugas)

  return (
    <Modal title={akun.nama} eyebrow={org.nama} onClose={onClose}>
      <div className="profil-top">
        <Avatar nama={akun.nama} tone={toneAkun(akun.id)} size={56} />
        <div>
          <div className="chips">
            {jabatan.map((j, i) => (
              <span key={j} className={`chip${i === 0 ? ' utama' : ''}`}>
                {j}
              </span>
            ))}
          </div>
          <p className="muted">
            {unit ? `${org.labelUnit} ${unit}` : 'Tidak terikat unit'} · bergabung {formatTanggal(member.bergabung)}
          </p>
        </div>
      </div>

      <p className={`profil-bio${akun.bio ? '' : ' kosong'}`}>{akun.bio || 'Belum menulis deskripsi.'}</p>

      <h3 className="profil-h">Program yang diikuti</h3>
      {ikut.length === 0 ? (
        <p className="muted">Belum terlibat di program mana pun.</p>
      ) : (
        <ul className="profil-list">
          {ikut.map(({ program, peran }) => (
            <li key={program.id}>
              <span>
                <strong>{program.nama}</strong>
                {program.departemen && <small>{singkatDivisi(program.departemen)}</small>}
              </span>
              <span className={`chip${peran === 'Ketua Proker' ? ' utama' : ''}`}>{peran}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onClose}>
          Tutup
        </button>
      </div>
    </Modal>
  )
}

/* ---------- Profil akun sendiri: semua organisasi, hanya terlihat oleh pemiliknya ---------- */

export function ProfilAkun({
  akun,
  orgs,
  members,
  onSimpan,
  onKeluar,
  onClose,
}: {
  akun: Akun
  orgs: Organisasi[]
  members: Keanggotaan[]
  onSimpan: (patch: { nama: string; bio: string }) => void
  onKeluar: () => void
  onClose: () => void
}) {
  const [nama, setNama] = useState(akun.nama)
  const [bio, setBio] = useState(akun.bio)
  const [error, setError] = useState('')

  const milik = members.filter((m) => m.akunId === akun.id)

  const simpan = () => {
    if (!nama.trim()) return setError('Nama tidak boleh kosong.')
    onSimpan({ nama: nama.trim(), bio: bio.trim() })
    onClose()
  }

  return (
    <Modal title="Profil saya" eyebrow="Akun" subtitle={akun.email} onClose={onClose}>
      <div className="form">
        <label className="field">
          <span>Nama</span>
          <input value={nama} onChange={(e) => setNama(e.target.value)} />
        </label>
        <label className="field">
          <span>Deskripsi singkat</span>
          <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Ceritakan sedikit tentang dirimu" />
        </label>

        <div className="field">
          <span>Organisasi dan jabatan</span>
          <p className="muted kecil">Daftar ini terisi otomatis dan hanya kamu yang bisa melihatnya. Jabatan ketua proker tidak dicantumkan.</p>
          {milik.length === 0 ? (
            <p className="muted">Belum bergabung ke organisasi mana pun.</p>
          ) : (
            <ul className="profil-list">
              {milik.map((m) => {
                const o = orgs.find((x) => x.id === m.orgId)
                if (!o) return null
                return (
                  <li key={m.orgId}>
                    <span>
                      <strong>{o.nama}</strong>
                      <small>{namaUnit(o, m) ? `${o.labelUnit} ${namaUnit(o, m)}` : 'Tidak terikat unit'}</small>
                    </span>
                    {m.status === 'menunggu' ? (
                      <span className="chip">Menunggu persetujuan</span>
                    ) : (
                      <span className="chips">
                        {semuaJabatan(o, m).map((j, i) => (
                          <span key={j} className={`chip${i === 0 ? ' utama' : ''}`}>
                            {j}
                          </span>
                        ))}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions spread">
          <button className="btn btn-danger" onClick={onKeluar}>
            Keluar dari akun
          </button>
          <span className="grow" />
          <button className="btn btn-ghost" onClick={onClose}>
            Batal
          </button>
          <button className="btn btn-primary" onClick={simpan}>
            Simpan
          </button>
        </div>
      </div>
    </Modal>
  )
}

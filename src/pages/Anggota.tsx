import { useMemo, useState } from 'react'
import './Org.css'
import { Avatar, Empty, Icon, Modal, PageHead } from '../components/ui'
import { programAkun, toneAkun } from '../components/Profil'
import { formatTanggal, singkatDivisi } from '../data'
import type { Program, Tugas } from '../data'
import {
  adalahKetua, bolehAturAnggota, labelJabatan, namaUnit, peringkat, roleBolehDiberi, semuaJabatan,
} from '../org'
import type { Akses, Akun, Keanggotaan, Organisasi, Undangan } from '../org'
import type { OrgStore } from '../store'

interface Props {
  org: Organisasi
  saya: Keanggotaan
  akuns: Akun[]
  members: Keanggotaan[] // semua keanggotaan di organisasi ini
  undangan: Undangan[]
  programs: Program[]
  tugas: Tugas[]
  akses: Akses
  store: OrgStore
  onBukaProfil: (akunId: number) => void
  onPengaturan: () => void
}

export default function Anggota({ org, saya, akuns, members, undangan, programs, tugas, akses, store, onBukaProfil, onPengaturan }: Props) {
  const [query, setQuery] = useState('')
  const [unit, setUnit] = useState('semua')
  const [atur, setAtur] = useState<Keanggotaan | null>(null)
  const [buatUndang, setBuatUndang] = useState(false)

  const nama = (id: number) => akuns.find((a) => a.id === id)?.nama ?? '-'
  const aktif = useMemo(
    () => members.filter((m) => m.status === 'aktif').sort((a, b) => peringkat(org, a) - peringkat(org, b) || nama(a.akunId).localeCompare(nama(b.akunId), 'id')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [members, org, akuns],
  )
  const menunggu = members.filter((m) => m.status === 'menunggu')

  const tampil = aktif.filter(
    (m) =>
      nama(m.akunId).toLowerCase().includes(query.trim().toLowerCase()) &&
      (unit === 'semua' || (unit === '' ? !m.unitId : m.unitId === unit)),
  )
  const undanganAktif = undangan.filter((u) => u.aktif)

  return (
    <>
      <PageHead eyebrow={org.nama} title="Anggota" sticker={`${aktif.length} anggota`}>
        {akses.undang && (
          <button className="btn btn-primary" onClick={() => setBuatUndang(true)}>
            <Icon name="plus" size={16} /> Undang
          </button>
        )}
        {(akses.kelolaRole || akses.kelolaUnit) && (
          <button className="btn btn-ghost" onClick={onPengaturan}>
            <Icon name="gear" size={15} /> Role dan unit
          </button>
        )}
      </PageHead>

      {akses.kelolaAnggota && menunggu.length > 0 && (
        <section className="panel blok">
          <div className="panel-head">
            <div>
              <h3>Menunggu persetujuan</h3>
              <p>Mereka masuk lewat kode undangan yang meminta persetujuan.</p>
            </div>
          </div>
          <ul className="baris-list">
            {menunggu.map((m) => (
              <li key={m.akunId}>
                <Avatar nama={nama(m.akunId)} tone={toneAkun(m.akunId)} size={36} />
                <span className="baris-main">
                  <strong>{nama(m.akunId)}</strong>
                  <small>
                    Sebagai {labelJabatan(org, m)}
                    {namaUnit(org, m) ? `, ${org.labelUnit} ${namaUnit(org, m)}` : ''}
                  </small>
                </span>
                <button className="btn btn-danger btn-small" onClick={() => store.putuskan(org.id, m.akunId, false)}>
                  Tolak
                </button>
                <button className="btn btn-primary btn-small" onClick={() => store.putuskan(org.id, m.akunId, true)}>
                  Terima
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="toolbar">
        <label className="search-box">
          <Icon name="search" size={16} />
          <input type="search" placeholder="Cari nama anggota" aria-label="Cari nama anggota" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        {org.units.length > 0 && (
          <select className="select-pill" aria-label={`Filter ${org.labelUnit}`} value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="semua">Semua {org.labelUnit.toLowerCase()}</option>
            {org.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nama}
              </option>
            ))}
            <option value="">Tanpa {org.labelUnit.toLowerCase()}</option>
          </select>
        )}
      </div>

      {tampil.length === 0 ? (
        <Empty title="Tidak ada anggota" text="Coba ubah kata kunci atau filter." />
      ) : (
        <section className="panel blok">
          <ul className="baris-list besar">
            {tampil.map((m) => {
              const jab = semuaJabatan(org, m)
              const ikut = programAkun(m.akunId, programs, tugas)
              const bisaAtur = bolehAturAnggota(org, saya, m)
              return (
                <li key={m.akunId}>
                  <button className="baris-klik" onClick={() => onBukaProfil(m.akunId)}>
                    <Avatar nama={nama(m.akunId)} tone={toneAkun(m.akunId)} size={40} />
                    <span className="baris-main">
                      <strong>
                        {nama(m.akunId)}
                        {m.akunId === saya.akunId && <em className="saya">kamu</em>}
                      </strong>
                      <small>
                        {namaUnit(org, m) ? `${org.labelUnit} ${singkatDivisi(namaUnit(org, m))}` : 'Tidak terikat unit'}
                        {ikut.length > 0 ? ` · ${ikut.length} program` : ''}
                      </small>
                    </span>
                    <span className="chips">
                      <span className={`chip${adalahKetua(org, m) ? ' ketua' : ' utama'}`}>{jab[0]}</span>
                      {jab.length > 1 && <span className="chip" title={jab.slice(1).join(', ')}>+{jab.length - 1}</span>}
                    </span>
                  </button>
                  {bisaAtur && (
                    <button className="btn btn-ghost btn-small" onClick={() => setAtur(m)}>
                      Atur
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {akses.undang && (
        <section className="panel blok">
          <div className="panel-head">
            <div>
              <h3>Undangan aktif</h3>
              <p>Bagikan link atau kode. Orang yang masuk otomatis mendapat role dan unit yang kamu pilih.</p>
            </div>
          </div>
          {undanganAktif.length === 0 ? (
            <p className="muted pad">Belum ada undangan aktif.</p>
          ) : (
            <ul className="baris-list">
              {undanganAktif.map((u) => (
                <BarisUndangan key={u.kode} u={u} org={org} onCabut={() => store.cabutUndangan(u.kode)} />
              ))}
            </ul>
          )}
        </section>
      )}

      {atur && (
        <AturAnggota
          org={org}
          saya={saya}
          target={atur}
          nama={nama(atur.akunId)}
          store={store}
          onClose={() => setAtur(null)}
        />
      )}
      {buatUndang && <BuatUndangan org={org} saya={saya} store={store} onClose={() => setBuatUndang(false)} />}
    </>
  )
}

/* ---------- Satu baris undangan ---------- */

function BarisUndangan({ u, org, onCabut }: { u: Undangan; org: Organisasi; onCabut: () => void }) {
  const [tersalin, setTersalin] = useState(false)
  const link = `${location.origin}${location.pathname}#/gabung/${u.kode}`
  const salin = async () => {
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      /* clipboard bisa diblokir, kodenya tetap terlihat */
    }
    setTersalin(true)
    setTimeout(() => setTersalin(false), 1600)
  }
  const role = org.roles.find((r) => r.id === u.roleId)?.nama ?? '-'
  const unit = org.units.find((x) => x.id === u.unitId)?.nama
  return (
    <li>
      <span className="kode-tag">{u.kode}</span>
      <span className="baris-main">
        <strong>
          {role}
          {unit ? ` · ${unit}` : ''}
        </strong>
        <small>
          Sampai {formatTanggal(u.kedaluwarsa)} · dipakai {u.terpakai}
          {u.maks > 0 ? ` dari ${u.maks}` : ''} kali{u.perluSetuju ? ' · perlu persetujuan' : ''}
        </small>
      </span>
      <button className="btn btn-ghost btn-small" onClick={salin}>
        <Icon name="copy" size={14} /> {tersalin ? 'Tersalin' : 'Salin link'}
      </button>
      <button className="btn btn-danger btn-small" onClick={onCabut}>
        Cabut
      </button>
    </li>
  )
}

/* ---------- Atur anggota: jabatan, unit, keluarkan, serahkan Ketua ---------- */

function AturAnggota({
  org, saya, target, nama, store, onClose,
}: {
  org: Organisasi
  saya: Keanggotaan
  target: Keanggotaan
  nama: string
  store: OrgStore
  onClose: () => void
}) {
  const boleh = roleBolehDiberi(org, saya)
  const [roleIds, setRoleIds] = useState<string[]>(target.roleIds)
  const [unitId, setUnitId] = useState(target.unitId ?? '')

  const toggle = (id: string) =>
    setRoleIds((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]))

  // Role di atas urutanku tidak bisa kusentuh: kalau sudah dimiliki target, tetap tersimpan
  const terkunci = target.roleIds.filter((id) => !boleh.some((r) => r.id === id))

  const simpan = () => {
    const akhir = Array.from(new Set([...terkunci, ...roleIds.filter((id) => boleh.some((r) => r.id === id))]))
    const anggotaId = org.roles.find((r) => r.bawaan === 'anggota')?.id ?? 'anggota'
    store.ubahAnggota(org.id, target.akunId, akhir.length ? akhir : [anggotaId], unitId || null)
    onClose()
  }

  const keluarkan = () => {
    if (window.confirm(`Keluarkan ${nama} dari ${org.nama}?`)) {
      store.keluarkan(org.id, target.akunId)
      onClose()
    }
  }

  const serahkan = () => {
    if (window.confirm(`Serahkan jabatan Ketua ke ${nama}? Kamu akan menjadi anggota biasa.`)) {
      store.serahkanKetua(org.id, saya.akunId, target.akunId)
      onClose()
    }
  }

  return (
    <Modal title={nama} eyebrow="Atur anggota" subtitle="Satu orang boleh memegang lebih dari satu jabatan." onClose={onClose}>
      <div className="form">
        <div className="field">
          <span>Jabatan</span>
          <div className="cek-list">
            {boleh.map((r) => (
              <label className="cek" key={r.id}>
                <input type="checkbox" checked={roleIds.includes(r.id)} onChange={() => toggle(r.id)} />
                <span>
                  {r.nama}
                  <small>{r.cakupan === 'organisasi' ? 'Berlaku di seluruh organisasi' : `Berlaku di ${org.labelUnit.toLowerCase()} sendiri`}</small>
                </span>
              </label>
            ))}
            {boleh.length === 0 && <p className="muted">Tidak ada jabatan yang bisa kamu berikan.</p>}
          </div>
        </div>

        {org.units.length > 0 && (
          <label className="field">
            <span>{org.labelUnit}</span>
            <select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
              <option value="">Tidak terikat unit</option>
              {org.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="form-actions spread">
          <button className="btn btn-danger" onClick={keluarkan}>
            Keluarkan
          </button>
          {adalahKetua(org, saya) && (
            <button className="btn btn-ghost" onClick={serahkan}>
              Jadikan Ketua
            </button>
          )}
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

/* ---------- Buat undangan ---------- */

function BuatUndangan({ org, saya, store, onClose }: { org: Organisasi; saya: Keanggotaan; store: OrgStore; onClose: () => void }) {
  const boleh = roleBolehDiberi(org, saya)
  const awalRole = (boleh.find((r) => r.bawaan === 'anggota') ?? boleh[boleh.length - 1])?.id ?? ''
  const [roleId, setRoleId] = useState(awalRole)
  const [unitId, setUnitId] = useState('')
  const [hari, setHari] = useState(7)
  const [maks, setMaks] = useState(0)
  const [perluSetuju, setPerluSetuju] = useState(true)
  const [kode, setKode] = useState('')

  const buat = () => {
    if (!roleId) return
    setKode(store.buatUndangan({ orgId: org.id, roleId, unitId: unitId || null, hari, maks, perluSetuju, dibuatOleh: saya.akunId }))
  }

  if (kode) {
    const link = `${location.origin}${location.pathname}#/gabung/${kode}`
    return (
      <Modal title="Undangan dibuat" eyebrow="Siap dibagikan" onClose={onClose}>
        <div className="kode-besar">{kode}</div>
        <p className="muted kecil tengah">{link}</p>
        <div className="form-actions">
          <button
            className="btn btn-ghost"
            onClick={() => {
              try {
                navigator.clipboard.writeText(link)
              } catch {
                /* diabaikan */
              }
            }}
          >
            <Icon name="copy" size={14} /> Salin link
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Selesai
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Buat undangan" eyebrow="Anggota baru" subtitle="Siapa pun yang memakai kode ini langsung mendapat role dan unit di bawah." onClose={onClose}>
      <div className="form">
        <div className="field-row">
          <label className="field">
            <span>Role</span>
            <select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
              {boleh.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                </option>
              ))}
            </select>
          </label>
          {org.units.length > 0 && (
            <label className="field">
              <span>{org.labelUnit}</span>
              <select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
                <option value="">Belum ditentukan</option>
                {org.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nama}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="field-row">
          <label className="field">
            <span>Berlaku</span>
            <select value={hari} onChange={(e) => setHari(Number(e.target.value))}>
              <option value={1}>1 hari</option>
              <option value={7}>7 hari</option>
              <option value={30}>30 hari</option>
              <option value={90}>90 hari</option>
            </select>
          </label>
          <label className="field">
            <span>Maksimal pemakaian</span>
            <select value={maks} onChange={(e) => setMaks(Number(e.target.value))}>
              <option value={0}>Tanpa batas</option>
              <option value={1}>1 orang</option>
              <option value={10}>10 orang</option>
              <option value={50}>50 orang</option>
            </select>
          </label>
        </div>
        <label className="cek">
          <input type="checkbox" checked={perluSetuju} onChange={(e) => setPerluSetuju(e.target.checked)} />
          <span>
            Perlu persetujuan pengurus
            <small>Yang bergabung menunggu dulu sampai disetujui. Disarankan untuk kode yang disebar ke publik.</small>
          </span>
        </label>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Batal
          </button>
          <button className="btn btn-primary" onClick={buat} disabled={!roleId}>
            Buat kode
          </button>
        </div>
      </div>
    </Modal>
  )
}

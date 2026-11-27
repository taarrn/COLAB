import { useState } from 'react'
import './Org.css'
import { Icon, Modal, PageHead } from '../components/ui'
import { adalahKetua, bolehUbahRole, daftarIzin, izinBolehDiberi, peringkat } from '../org'
import type { Akses, Cakupan, Izin, Keanggotaan, Organisasi, Role } from '../org'
import type { OrgStore } from '../store'

interface Props {
  org: Organisasi
  saya: Keanggotaan
  members: Keanggotaan[]
  akses: Akses
  store: OrgStore
  programPerUnit: (namaUnit: string) => number
  onGantiNamaUnit: (unitId: string, namaBaru: string) => void
  onBack: () => void
}

const izinTingkatOrganisasi: Izin[] = ['undang', 'kelolaAnggota', 'kelolaRole', 'kelolaUnit']

export default function Pengaturan({ org, saya, members, akses, store, programPerUnit, onGantiNamaUnit, onBack }: Props) {
  const [roleModal, setRoleModal] = useState<null | 'baru' | Role>(null)
  const [unitBaru, setUnitBaru] = useState('')
  const [labelUnit, setLabelUnit] = useState(org.labelUnit)

  const jumlahPemegang = (roleId: string) => members.filter((m) => m.status === 'aktif' && m.roleIds.includes(roleId)).length
  const aku = adalahKetua(org, saya) ? -1 : peringkat(org, saya)

  return (
    <>
      <PageHead eyebrow={org.nama} title="Role dan unit" sticker="pengaturan">
        <button className="btn btn-ghost" onClick={onBack}>
          <Icon name="left" size={16} /> Kembali
        </button>
      </PageHead>

      {akses.kelolaUnit && (
        <section className="panel blok">
          <div className="panel-head">
            <div>
              <h3>{org.labelUnit}</h3>
              <p>Bagian di dalam organisasi. Boleh dikosongkan kalau organisasimu tidak membagi bagian.</p>
            </div>
          </div>

          <div className="pad">
            <label className="field kecilf">
              <span>Sebutan</span>
              <input
                value={labelUnit}
                onChange={(e) => setLabelUnit(e.target.value)}
                onBlur={() => labelUnit.trim() ? store.ubahLabelUnit(org.id, labelUnit.trim()) : setLabelUnit(org.labelUnit)}
                placeholder="Departemen, Divisi, Bidang"
              />
            </label>
          </div>

          <ul className="baris-list">
            {org.units.map((u) => (
              <UnitBaris
                key={u.id}
                nama={u.nama}
                jumlahProgram={programPerUnit(u.nama)}
                jumlahAnggota={members.filter((m) => m.unitId === u.id).length}
                onGanti={(n) => {
                  store.ubahUnit(org.id, u.id, n)
                  onGantiNamaUnit(u.id, n)
                }}
                onHapus={() => {
                  const pesan = programPerUnit(u.nama) > 0
                    ? `Hapus ${u.nama}? Program miliknya tetap ada, tapi tidak lagi terikat ke ${org.labelUnit.toLowerCase()} ini.`
                    : `Hapus ${u.nama}?`
                  if (window.confirm(pesan)) store.hapusUnit(org.id, u.id)
                }}
              />
            ))}
          </ul>

          <form
            className="tambah-baris"
            onSubmit={(e) => {
              e.preventDefault()
              const n = unitBaru.trim()
              if (!n || org.units.some((u) => u.nama.toLowerCase() === n.toLowerCase())) return
              store.tambahUnit(org.id, n)
              setUnitBaru('')
            }}
          >
            <input value={unitBaru} onChange={(e) => setUnitBaru(e.target.value)} placeholder={`Tambah ${org.labelUnit.toLowerCase()} baru`} aria-label="Nama unit baru" />
            <button className="btn btn-primary btn-small" type="submit" disabled={!unitBaru.trim()}>
              <Icon name="plus" size={14} /> Tambah
            </button>
          </form>
        </section>
      )}

      {akses.kelolaRole && (
        <section className="panel blok">
          <div className="panel-head">
            <div>
              <h3>Role dan hierarki</h3>
              <p>Urutan dari atas ke bawah adalah urutan wewenang. Kamu hanya bisa mengatur role di bawah urutanmu sendiri.</p>
            </div>
            <button className="btn btn-primary btn-small" onClick={() => setRoleModal('baru')}>
              <Icon name="plus" size={14} /> Role baru
            </button>
          </div>

          <ol className="role-list">
            {org.roles.map((r, i) => {
              const bisa = bolehUbahRole(org, saya, r)
              const bisaNaik = bisa && !r.bawaan && i - 1 > aku && i - 1 >= 1
              const bisaTurun = bisa && !r.bawaan && org.roles[i + 1] && org.roles[i + 1].bawaan !== 'anggota'
              return (
                <li key={r.id} className="role-item">
                  <span className="role-no">{i + 1}</span>
                  <span className="baris-main">
                    <strong>
                      {r.nama}
                      {r.bawaan === 'ketua' && <Icon name="lock" size={13} />}
                    </strong>
                    <small>
                      {r.cakupan === 'organisasi' ? 'Seluruh organisasi' : `Per ${org.labelUnit.toLowerCase()}`} · {r.izin.length} izin · {jumlahPemegang(r.id)} orang
                    </small>
                  </span>
                  <button className="icon-btn" disabled={!bisaNaik} onClick={() => store.geserRole(org.id, r.id, -1)} aria-label={`Naikkan ${r.nama}`} title="Naikkan urutan">
                    <Icon name="up" size={16} />
                  </button>
                  <button className="icon-btn" disabled={!bisaTurun} onClick={() => store.geserRole(org.id, r.id, 1)} aria-label={`Turunkan ${r.nama}`} title="Turunkan urutan">
                    <Icon name="down" size={16} />
                  </button>
                  <button className="btn btn-ghost btn-small" onClick={() => setRoleModal(r)}>
                    {bisa ? 'Ubah' : 'Lihat'}
                  </button>
                </li>
              )
            })}
          </ol>
        </section>
      )}

      {roleModal && (
        <RoleModal
          org={org}
          saya={saya}
          role={roleModal === 'baru' ? null : roleModal}
          store={store}
          jumlahPemegang={roleModal === 'baru' ? 0 : jumlahPemegang(roleModal.id)}
          onClose={() => setRoleModal(null)}
        />
      )}
    </>
  )
}

/* ---------- Baris unit: ganti nama langsung di tempat ---------- */

function UnitBaris({
  nama, jumlahProgram, jumlahAnggota, onGanti, onHapus,
}: {
  nama: string
  jumlahProgram: number
  jumlahAnggota: number
  onGanti: (n: string) => void
  onHapus: () => void
}) {
  const [v, setV] = useState(nama)
  const simpan = () => {
    const n = v.trim()
    if (!n) return setV(nama)
    if (n !== nama) onGanti(n)
  }
  return (
    <li>
      <input
        className="unit-input"
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={simpan}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        aria-label={`Nama unit ${nama}`}
      />
      <small className="muted">
        {jumlahAnggota} anggota · {jumlahProgram} program
      </small>
      <button className="icon-btn danger" onClick={onHapus} aria-label={`Hapus ${nama}`}>
        <Icon name="trash" size={16} />
      </button>
    </li>
  )
}

/* ---------- Editor role: nama, cakupan, izin ---------- */

function RoleModal({
  org, saya, role, store, jumlahPemegang, onClose,
}: {
  org: Organisasi
  saya: Keanggotaan
  role: Role | null
  store: OrgStore
  jumlahPemegang: number
  onClose: () => void
}) {
  const baru = role === null
  const boleh = baru || bolehUbahRole(org, saya, role)
  const bolehIzin = izinBolehDiberi(org, saya)
  const [nama, setNama] = useState(role?.nama ?? '')
  const [cakupan, setCakupan] = useState<Cakupan>(role?.cakupan ?? 'unit')
  const [izin, setIzin] = useState<Izin[]>(role?.izin ?? ['lihatLaporan'])
  const [error, setError] = useState('')

  const kunci = role?.bawaan === 'ketua'
  const bisaCakupan = boleh && !role?.bawaan
  const toggle = (k: Izin) => setIzin((x) => (x.includes(k) ? x.filter((i) => i !== k) : [...x, k]))

  const simpan = () => {
    if (!nama.trim()) return setError('Nama role wajib diisi.')
    if (org.roles.some((r) => r.id !== role?.id && r.nama.toLowerCase() === nama.trim().toLowerCase())) {
      return setError('Sudah ada role dengan nama itu.')
    }
    // izin yang tidak boleh kusentuh tetap seperti semula
    const lama = role?.izin ?? []
    const akhir = Array.from(new Set([...lama.filter((i) => !bolehIzin.includes(i)), ...izin.filter((i) => bolehIzin.includes(i))]))
      .filter((i) => cakupan === 'organisasi' || !izinTingkatOrganisasi.includes(i))
    if (baru) store.tambahRole(org.id, nama.trim(), cakupan, akhir)
    else store.ubahRole(org.id, role!.id, { nama: nama.trim(), cakupan, izin: akhir })
    onClose()
  }

  const hapus = () => {
    const pesan = jumlahPemegang > 0 ? `Hapus role ${role!.nama}? ${jumlahPemegang} orang akan kembali menjadi anggota biasa.` : `Hapus role ${role!.nama}?`
    if (window.confirm(pesan)) {
      store.hapusRole(org.id, role!.id)
      onClose()
    }
  }

  const kelompok = Array.from(new Set(daftarIzin.map((i) => i.kelompok)))

  return (
    <Modal
      title={baru ? 'Role baru' : role!.nama}
      eyebrow={baru ? 'Tambah role' : boleh ? 'Ubah role' : 'Lihat role'}
      subtitle={kunci ? 'Ketua selalu memegang semua izin dan tidak bisa diubah. Jabatan ini hanya berpindah lewat menu Atur anggota.' : undefined}
      onClose={onClose}
    >
      <div className="form">
        <label className="field">
          <span>Nama role</span>
          <input autoFocus={baru} value={nama} disabled={!boleh} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Koordinator Acara" />
        </label>

        <div className="field">
          <span>Cakupan</span>
          <div className="segmented" role="radiogroup">
            <button type="button" role="radio" aria-checked={cakupan === 'organisasi'} disabled={!bisaCakupan} className={`seg${cakupan === 'organisasi' ? ' active' : ''}`} onClick={() => setCakupan('organisasi')}>
              Seluruh organisasi
            </button>
            <button type="button" role="radio" aria-checked={cakupan === 'unit'} disabled={!bisaCakupan} className={`seg${cakupan === 'unit' ? ' active' : ''}`} onClick={() => setCakupan('unit')}>
              Hanya {org.labelUnit.toLowerCase()} sendiri
            </button>
          </div>
        </div>

        {kelompok.map((k) => (
          <div className="field" key={k}>
            <span>{k}</span>
            <div className="cek-list">
              {daftarIzin
                .filter((i) => i.kelompok === k)
                .map((i) => {
                  const mati = !boleh || !bolehIzin.includes(i.kunci) || (cakupan === 'unit' && izinTingkatOrganisasi.includes(i.kunci))
                  return (
                    <label className={`cek${mati ? ' mati' : ''}`} key={i.kunci}>
                      <input type="checkbox" disabled={mati} checked={(kunci ? true : izin.includes(i.kunci)) && !(cakupan === 'unit' && izinTingkatOrganisasi.includes(i.kunci))} onChange={() => toggle(i.kunci)} />
                      <span>
                        {i.nama}
                        <small>{i.info}</small>
                      </span>
                    </label>
                  )
                })}
            </div>
          </div>
        ))}

        {boleh && bolehIzin.length < daftarIzin.length && (
          <p className="muted kecil">Izin yang tidak kamu miliki sendiri tidak bisa kamu berikan ke role lain.</p>
        )}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions spread">
          {!baru && boleh && !role!.bawaan && (
            <button className="btn btn-danger" onClick={hapus}>
              Hapus role
            </button>
          )}
          <span className="grow" />
          <button className="btn btn-ghost" onClick={onClose}>
            {boleh ? 'Batal' : 'Tutup'}
          </button>
          {boleh && (
            <button className="btn btn-primary" onClick={simpan}>
              Simpan
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

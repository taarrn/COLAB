/* =========================================================
   Penyimpanan akun, organisasi, keanggotaan, dan undangan.
   Prototipe: semuanya di LocalStorage browser. Untuk produksi,
   tiap fungsi di sini menjadi satu panggilan API ke server.
   ========================================================= */

import { useCallback, useEffect, useState } from 'react'
import { load, save } from './data'
import { buatTemplate, dataAwal } from './org'
import type { Akun, Cakupan, Izin, KunciTemplate, Keanggotaan, Organisasi, Role, Undangan } from './org'

interface State {
  akuns: Akun[]
  orgs: Organisasi[]
  members: Keanggotaan[]
  undangan: Undangan[]
  akunId: number | null // akun yang sedang masuk
  orgId: string | null // organisasi yang sedang dibuka
}

const KEY = 'kolab:org:v1'

function awal(): State {
  const d = dataAwal()
  return { akuns: d.akuns, orgs: d.orgs, members: d.members, undangan: d.undangan, akunId: null, orgId: null }
}

const hariIni = () => new Date().toISOString().slice(0, 10)
const tambahHari = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)

function kodeAcak() {
  const huruf = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => huruf[Math.floor(Math.random() * huruf.length)]).join('')
}

export type HasilKode =
  | { ok: true; undangan: Undangan; org: Organisasi; role: Role; unit: string }
  | { ok: false; pesan: string }

export function useOrgStore() {
  const [s, setS] = useState<State>(() => load<State>(KEY, awal()))

  useEffect(() => {
    save(KEY, s)
  }, [s])

  const ubah = useCallback((fn: (d: State) => State) => setS((d) => fn(d)), [])

  const ubahOrg = (orgId: string, fn: (o: Organisasi) => Organisasi) =>
    ubah((d) => ({ ...d, orgs: d.orgs.map((o) => (o.id === orgId ? fn(o) : o)) }))

  const ubahMember = (orgId: string, akunId: number, fn: (m: Keanggotaan) => Keanggotaan) =>
    ubah((d) => ({
      ...d,
      members: d.members.map((m) => (m.orgId === orgId && m.akunId === akunId ? fn(m) : m)),
    }))

  /* ----- akun ----- */

  const daftar = (nama: string, email: string): number => {
    const id = Math.max(0, ...s.akuns.map((a) => a.id)) + 1
    ubah((d) => ({ ...d, akuns: [...d.akuns, { id, nama, email, bio: '' }], akunId: id, orgId: null }))
    return id
  }

  const masuk = (akunId: number) => ubah((d) => ({ ...d, akunId, orgId: null }))
  const keluar = () => ubah((d) => ({ ...d, akunId: null, orgId: null }))
  const setOrg = (orgId: string) => ubah((d) => ({ ...d, orgId }))

  const ubahProfil = (akunId: number, patch: Partial<Pick<Akun, 'nama' | 'bio'>>) =>
    ubah((d) => ({ ...d, akuns: d.akuns.map((a) => (a.id === akunId ? { ...a, ...patch } : a)) }))

  /* ----- organisasi ----- */

  const buatOrganisasi = (nama: string, labelUnit: string, template: KunciTemplate): string => {
    const id = `org-${Date.now().toString(36)}`
    const t = buatTemplate(template)
    const org: Organisasi = {
      id,
      nama,
      labelUnit,
      units: t.unitNama.map((n, i) => ({ id: `u${i + 1}`, nama: n })),
      roles: t.roles,
      dibuat: hariIni(),
    }
    ubah((d) => ({
      ...d,
      orgs: [...d.orgs, org],
      members: [
        ...d.members,
        { akunId: d.akunId as number, orgId: id, roleIds: ['ketua'], unitId: null, status: 'aktif', bergabung: hariIni() },
      ],
      orgId: id,
    }))
    return id
  }

  /* ----- unit ----- */

  const tambahUnit = (orgId: string, nama: string) =>
    ubahOrg(orgId, (o) => ({ ...o, units: [...o.units, { id: `u${Date.now().toString(36)}`, nama }] }))

  const ubahUnit = (orgId: string, unitId: string, nama: string) =>
    ubahOrg(orgId, (o) => ({ ...o, units: o.units.map((u) => (u.id === unitId ? { ...u, nama } : u)) }))

  const hapusUnit = (orgId: string, unitId: string) => {
    ubahOrg(orgId, (o) => ({ ...o, units: o.units.filter((u) => u.id !== unitId) }))
    ubah((d) => ({
      ...d,
      members: d.members.map((m) => (m.orgId === orgId && m.unitId === unitId ? { ...m, unitId: null } : m)),
    }))
  }

  const ubahLabelUnit = (orgId: string, labelUnit: string) => ubahOrg(orgId, (o) => ({ ...o, labelUnit }))

  /* ----- role ----- */

  // Role baru disisipkan tepat di atas role bawaan "anggota" (paling bawah)
  const tambahRole = (orgId: string, nama: string, cakupan: Cakupan, izin: Izin[]) =>
    ubahOrg(orgId, (o) => {
      const baru: Role = { id: `r${Date.now().toString(36)}`, nama, cakupan, izin }
      const i = o.roles.findIndex((r) => r.bawaan === 'anggota')
      const roles = [...o.roles]
      roles.splice(i < 0 ? roles.length : i, 0, baru)
      return { ...o, roles }
    })

  const ubahRole = (orgId: string, roleId: string, patch: Partial<Pick<Role, 'nama' | 'cakupan' | 'izin'>>) =>
    ubahOrg(orgId, (o) => ({ ...o, roles: o.roles.map((r) => (r.id === roleId ? { ...r, ...patch } : r)) }))

  const hapusRole = (orgId: string, roleId: string) => {
    let pengganti = 'anggota'
    ubahOrg(orgId, (o) => {
      pengganti = o.roles.find((r) => r.bawaan === 'anggota')?.id ?? pengganti
      return { ...o, roles: o.roles.filter((r) => r.id !== roleId) }
    })
    ubah((d) => {
      const org = d.orgs.find((o) => o.id === orgId)
      const anggotaId = org?.roles.find((r) => r.bawaan === 'anggota')?.id ?? pengganti
      return {
        ...d,
        members: d.members.map((m) => {
          if (m.orgId !== orgId || !m.roleIds.includes(roleId)) return m
          const sisa = m.roleIds.filter((id) => id !== roleId)
          return { ...m, roleIds: sisa.length ? sisa : [anggotaId] }
        }),
      }
    })
  }

  // arah -1 = naik (lebih tinggi), 1 = turun. Ketua tetap di atas, Anggota tetap di bawah.
  const geserRole = (orgId: string, roleId: string, arah: -1 | 1) =>
    ubahOrg(orgId, (o) => {
      const i = o.roles.findIndex((r) => r.id === roleId)
      const j = i + arah
      if (i < 0 || j < 1 || j > o.roles.length - 1 || o.roles[i].bawaan || o.roles[j].bawaan === 'anggota' && arah === 1) return o
      const roles = [...o.roles]
      ;[roles[i], roles[j]] = [roles[j], roles[i]]
      return { ...o, roles }
    })

  /* ----- anggota ----- */

  const ubahAnggota = (orgId: string, akunId: number, roleIds: string[], unitId: string | null) =>
    ubahMember(orgId, akunId, (m) => ({ ...m, roleIds, unitId }))

  const keluarkan = (orgId: string, akunId: number) =>
    ubah((d) => ({ ...d, members: d.members.filter((m) => !(m.orgId === orgId && m.akunId === akunId)) }))

  const putuskan = (orgId: string, akunId: number, terima: boolean) =>
    terima ? ubahMember(orgId, akunId, (m) => ({ ...m, status: 'aktif' })) : keluarkan(orgId, akunId)

  // Ketua lama menjadi anggota biasa, Ketua baru hanya memegang role Ketua
  const serahkanKetua = (orgId: string, dariId: number, keId: number) =>
    ubah((d) => {
      const org = d.orgs.find((o) => o.id === orgId)
      const anggotaId = org?.roles.find((r) => r.bawaan === 'anggota')?.id ?? 'anggota'
      return {
        ...d,
        members: d.members.map((m) => {
          if (m.orgId !== orgId) return m
          if (m.akunId === dariId) return { ...m, roleIds: [anggotaId] }
          if (m.akunId === keId) return { ...m, roleIds: ['ketua'] }
          return m
        }),
      }
    })

  /* ----- undangan ----- */

  const buatUndangan = (o: {
    orgId: string
    roleId: string
    unitId: string | null
    hari: number
    maks: number
    perluSetuju: boolean
    dibuatOleh: number
  }): string => {
    const kode = kodeAcak()
    ubah((d) => ({
      ...d,
      undangan: [
        {
          kode,
          orgId: o.orgId,
          roleId: o.roleId,
          unitId: o.unitId,
          kedaluwarsa: tambahHari(o.hari),
          maks: o.maks,
          terpakai: 0,
          perluSetuju: o.perluSetuju,
          dibuatOleh: o.dibuatOleh,
          aktif: true,
        },
        ...d.undangan,
      ],
    }))
    return kode
  }

  const cabutUndangan = (kode: string) =>
    ubah((d) => ({ ...d, undangan: d.undangan.map((u) => (u.kode === kode ? { ...u, aktif: false } : u)) }))

  const cekKode = (kodeMentah: string): HasilKode => {
    const kode = kodeMentah.trim().toUpperCase()
    const u = s.undangan.find((x) => x.kode === kode)
    if (!u) return { ok: false, pesan: 'Kode tidak ditemukan. Periksa lagi penulisannya.' }
    if (!u.aktif) return { ok: false, pesan: 'Undangan ini sudah dicabut oleh pengurus.' }
    if (u.kedaluwarsa < hariIni()) return { ok: false, pesan: 'Undangan ini sudah kedaluwarsa.' }
    if (u.maks > 0 && u.terpakai >= u.maks) return { ok: false, pesan: 'Undangan ini sudah mencapai batas pemakaian.' }
    const org = s.orgs.find((o) => o.id === u.orgId)
    const role = org?.roles.find((r) => r.id === u.roleId)
    if (!org || !role) return { ok: false, pesan: 'Organisasi atau role undangan ini sudah tidak ada.' }
    return { ok: true, undangan: u, org, role, unit: org.units.find((x) => x.id === u.unitId)?.nama ?? '' }
  }

  const gabung = (kode: string, akunId: number): { ok: boolean; pesan: string; menunggu?: boolean; orgId?: string } => {
    const h = cekKode(kode)
    if (!h.ok) return h
    const u = h.undangan
    if (s.members.some((m) => m.orgId === u.orgId && m.akunId === akunId)) {
      return { ok: false, pesan: 'Kamu sudah tercatat di organisasi ini.' }
    }
    const status = u.perluSetuju ? 'menunggu' : 'aktif'
    ubah((d) => ({
      ...d,
      undangan: d.undangan.map((x) => (x.kode === u.kode ? { ...x, terpakai: x.terpakai + 1 } : x)),
      members: [
        ...d.members,
        { akunId, orgId: u.orgId, roleIds: [u.roleId], unitId: u.unitId, status, bergabung: hariIni() },
      ],
      orgId: status === 'aktif' ? u.orgId : d.orgId,
    }))
    return {
      ok: true,
      menunggu: status === 'menunggu',
      orgId: u.orgId,
      pesan: status === 'menunggu' ? `Permintaan bergabung ke ${h.org.nama} terkirim. Tunggu persetujuan pengurus.` : `Selamat datang di ${h.org.nama}.`,
    }
  }

  const resetDemo = () => setS(awal())

  return {
    ...s,
    daftar, masuk, keluar, setOrg, ubahProfil,
    buatOrganisasi,
    tambahUnit, ubahUnit, hapusUnit, ubahLabelUnit,
    tambahRole, ubahRole, hapusRole, geserRole,
    ubahAnggota, keluarkan, putuskan, serahkanKetua,
    buatUndangan, cabutUndangan, cekKode, gabung,
    resetDemo,
  }
}

export type OrgStore = ReturnType<typeof useOrgStore>

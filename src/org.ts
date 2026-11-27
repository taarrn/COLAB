/* =========================================================
   Model multi-organisasi: akun, organisasi, role kustom, unit,
   keanggotaan, undangan, dan semua aturan izin.
   Kode tidak pernah mengecek nama jabatan, hanya izin.
   ========================================================= */

import type { Program } from './data'

/* ---------- Izin ---------- */

export type Izin =
  | 'undang'
  | 'kelolaAnggota'
  | 'kelolaRole'
  | 'kelolaUnit'
  | 'buatProgram'
  | 'hapusProgram'
  | 'editProgram'
  | 'kelolaTugas'
  | 'tandaiTugas'
  | 'lihatLaporan'

export type KelompokIzin = 'Organisasi' | 'Program' | 'Tugas' | 'Laporan'

export const daftarIzin: { kunci: Izin; nama: string; info: string; kelompok: KelompokIzin }[] = [
  { kunci: 'undang', nama: 'Mengundang anggota', info: 'Membuat link atau kode undangan.', kelompok: 'Organisasi' },
  { kunci: 'kelolaAnggota', nama: 'Mengatur anggota', info: 'Menyetujui anggota baru, mengubah jabatan dan unit, mengeluarkan anggota.', kelompok: 'Organisasi' },
  { kunci: 'kelolaRole', nama: 'Mengatur role', info: 'Membuat dan mengubah role di bawah urutannya sendiri.', kelompok: 'Organisasi' },
  { kunci: 'kelolaUnit', nama: 'Mengatur unit', info: 'Menambah, mengganti nama, dan menghapus unit.', kelompok: 'Organisasi' },
  { kunci: 'buatProgram', nama: 'Membuat program', info: 'Membuat program baru dan menunjuk ketua proker.', kelompok: 'Program' },
  { kunci: 'hapusProgram', nama: 'Menghapus program', info: 'Menghapus program beserta tugasnya.', kelompok: 'Program' },
  { kunci: 'editProgram', nama: 'Mengubah data program', info: 'Mengubah nama, jadwal, deskripsi, dan ketua proker.', kelompok: 'Program' },
  { kunci: 'kelolaTugas', nama: 'Membagi tugas', info: 'Menambah, mengubah, menghapus tugas, dan mengatur bobot.', kelompok: 'Tugas' },
  { kunci: 'tandaiTugas', nama: 'Menandai tugas selesai', info: 'Menandai tugas siapa saja di cakupannya. Pemilik tugas selalu bisa menandai tugasnya sendiri.', kelompok: 'Tugas' },
  { kunci: 'lihatLaporan', nama: 'Melihat laporan', info: 'Membuka halaman Laporan Progres.', kelompok: 'Laporan' },
]

export const SEMUA_IZIN: Izin[] = daftarIzin.map((i) => i.kunci)

/* ---------- Tipe data ---------- */

export type Cakupan = 'organisasi' | 'unit'

export interface Role {
  id: string
  nama: string
  cakupan: Cakupan // organisasi = berlaku di semua unit, unit = hanya di unit milik anggota
  izin: Izin[]
  bawaan?: 'ketua' | 'anggota' // dua role ini tidak bisa dihapus
}

export interface Unit {
  id: string
  nama: string
}

export interface Organisasi {
  id: string
  nama: string
  labelUnit: string // Departemen, Divisi, Bidang, dst
  units: Unit[]
  roles: Role[] // urutan array = urutan hierarki, indeks 0 = tertinggi
  dibuat: string
}

export interface Akun {
  id: number
  nama: string
  email: string
  bio: string
}

export interface Keanggotaan {
  akunId: number
  orgId: string
  roleIds: string[] // boleh lebih dari satu jabatan
  unitId: string | null
  status: 'aktif' | 'menunggu'
  bergabung: string
}

export interface Undangan {
  kode: string
  orgId: string
  roleId: string
  unitId: string | null
  kedaluwarsa: string // YYYY-MM-DD
  maks: number // 0 = tanpa batas
  terpakai: number
  perluSetuju: boolean
  dibuatOleh: number
  aktif: boolean
}

/* ---------- Template organisasi ---------- */

export type KunciTemplate = 'bem' | 'ukm' | 'kosong'

export const labelUnitPilihan = ['Departemen', 'Divisi', 'Bidang', 'Seksi']

const roleKetua: Role = { id: 'ketua', nama: 'Ketua', cakupan: 'organisasi', izin: SEMUA_IZIN, bawaan: 'ketua' }

export const daftarTemplate: { kunci: KunciTemplate; nama: string; info: string }[] = [
  { kunci: 'bem', nama: 'BEM lengkap', info: 'Ketua, DPH, Kadep, Wakadep, Sekdep, Staff. Lima departemen awal.' },
  { kunci: 'ukm', nama: 'UKM sederhana', info: 'Ketua, Pengurus Inti, Koordinator Divisi, Anggota. Tiga divisi awal.' },
  { kunci: 'kosong', nama: 'Kosong', info: 'Hanya Ketua dan Anggota. Atur sendiri sesukamu.' },
]

export function buatTemplate(kunci: KunciTemplate): { unitNama: string[]; roles: Role[] } {
  if (kunci === 'bem') {
    return {
      unitNama: ['Sosial Masyarakat', 'Pendidikan', 'Minat dan Bakat', 'Humas dan Media', 'Kewirausahaan'],
      roles: [
        roleKetua,
        { id: 'dph', nama: 'DPH', cakupan: 'organisasi', izin: [...SEMUA_IZIN] },
        { id: 'kadep', nama: 'Kadep', cakupan: 'unit', izin: ['buatProgram', 'hapusProgram', 'editProgram', 'kelolaTugas', 'tandaiTugas', 'lihatLaporan'] },
        { id: 'wakadep', nama: 'Wakadep', cakupan: 'unit', izin: ['buatProgram', 'hapusProgram', 'editProgram', 'kelolaTugas', 'tandaiTugas', 'lihatLaporan'] },
        { id: 'sekdep', nama: 'Sekdep', cakupan: 'unit', izin: ['editProgram', 'tandaiTugas', 'lihatLaporan'] },
        { id: 'staff', nama: 'Staff', cakupan: 'organisasi', izin: ['lihatLaporan'], bawaan: 'anggota' },
      ],
    }
  }
  if (kunci === 'ukm') {
    return {
      unitNama: ['Acara', 'Desain', 'Humas'],
      roles: [
        roleKetua,
        { id: 'inti', nama: 'Pengurus Inti', cakupan: 'organisasi', izin: ['undang', 'kelolaAnggota', 'buatProgram', 'hapusProgram', 'editProgram', 'kelolaTugas', 'tandaiTugas', 'lihatLaporan'] },
        { id: 'koordinator', nama: 'Koordinator Divisi', cakupan: 'unit', izin: ['buatProgram', 'editProgram', 'kelolaTugas', 'tandaiTugas', 'lihatLaporan'] },
        { id: 'anggota', nama: 'Anggota', cakupan: 'organisasi', izin: ['lihatLaporan'], bawaan: 'anggota' },
      ],
    }
  }
  return {
    unitNama: [],
    roles: [roleKetua, { id: 'anggota', nama: 'Anggota', cakupan: 'organisasi', izin: ['lihatLaporan'], bawaan: 'anggota' }],
  }
}

/* ---------- Pembacaan jabatan ---------- */

const indeksRole = (org: Organisasi, roleId: string) => org.roles.findIndex((r) => r.id === roleId)

// Role milik anggota, diurutkan dari yang tertinggi
export function roleAnggota(org: Organisasi, m: Keanggotaan): Role[] {
  return m.roleIds
    .map((id) => org.roles.find((r) => r.id === id))
    .filter((r): r is Role => !!r)
    .sort((a, b) => indeksRole(org, a.id) - indeksRole(org, b.id))
}

export const adalahKetua = (org: Organisasi, m: Keanggotaan) => roleAnggota(org, m).some((r) => r.bawaan === 'ketua')

// Makin kecil makin tinggi. Anggota tanpa role dianggap paling bawah.
export function peringkat(org: Organisasi, m: Keanggotaan): number {
  const r = roleAnggota(org, m)
  return r.length ? indeksRole(org, r[0].id) : org.roles.length
}

export const labelJabatan = (org: Organisasi, m: Keanggotaan) => roleAnggota(org, m)[0]?.nama ?? 'Anggota'
export const semuaJabatan = (org: Organisasi, m: Keanggotaan) => roleAnggota(org, m).map((r) => r.nama)
export const unitAnggota = (org: Organisasi, m: Keanggotaan) => org.units.find((u) => u.id === m.unitId)
export const namaUnit = (org: Organisasi, m: Keanggotaan) => unitAnggota(org, m)?.nama ?? ''

/* ---------- Cek izin ---------- */

const izinSeOrganisasi: Izin[] = ['undang', 'kelolaAnggota', 'kelolaRole', 'kelolaUnit']

// unit: nama unit yang sedang dituju, '*' artinya "di unit mana saja", undefined artinya tingkat organisasi
export function punyaIzin(org: Organisasi, m: Keanggotaan | undefined, izin: Izin, unit?: string): boolean {
  if (!m || m.status !== 'aktif') return false
  if (adalahKetua(org, m)) return true
  const unitSaya = namaUnit(org, m)
  return roleAnggota(org, m).some((r) => {
    if (!r.izin.includes(izin)) return false
    if (r.cakupan === 'organisasi') return true
    if (izin === 'lihatLaporan' || unit === '*') return true
    return !izinSeOrganisasi.includes(izin) && unit !== undefined && unit === unitSaya
  })
}

export interface Akses {
  undang: boolean
  kelolaAnggota: boolean
  kelolaRole: boolean
  kelolaUnit: boolean
  lihatLaporan: boolean
  buatProgram: (unit?: string) => boolean
  editProgram: (p: Program) => boolean
  hapusProgram: (p: Program) => boolean
  kelolaTugas: (p: Program) => boolean
  tandaiTugas: (anggotaIdTugas: number, p?: Program) => boolean
}

const tanpaAkses: Akses = {
  undang: false,
  kelolaAnggota: false,
  kelolaRole: false,
  kelolaUnit: false,
  lihatLaporan: false,
  buatProgram: () => false,
  editProgram: () => false,
  hapusProgram: () => false,
  kelolaTugas: () => false,
  tandaiTugas: () => false,
}

// Ketua proker (pjId) mengendalikan programnya sendiri: ubah data, bagi tugas, tandai tugas
export function buatAkses(org: Organisasi | undefined, m: Keanggotaan | undefined): Akses {
  if (!org || !m || m.status !== 'aktif') return tanpaAkses
  const aku = m.akunId
  return {
    undang: punyaIzin(org, m, 'undang'),
    kelolaAnggota: punyaIzin(org, m, 'kelolaAnggota'),
    kelolaRole: punyaIzin(org, m, 'kelolaRole'),
    kelolaUnit: punyaIzin(org, m, 'kelolaUnit'),
    lihatLaporan: punyaIzin(org, m, 'lihatLaporan'),
    buatProgram: (unit = '*') => punyaIzin(org, m, 'buatProgram', unit),
    editProgram: (p) => p.pjId === aku || punyaIzin(org, m, 'editProgram', p.departemen),
    hapusProgram: (p) => punyaIzin(org, m, 'hapusProgram', p.departemen),
    kelolaTugas: (p) => p.pjId === aku || punyaIzin(org, m, 'kelolaTugas', p.departemen),
    tandaiTugas: (anggotaIdTugas, p) =>
      anggotaIdTugas === aku || (!!p && (p.pjId === aku || punyaIzin(org, m, 'tandaiTugas', p.departemen))),
  }
}

/* ---------- Pengaman hierarki ---------- */

// Aktor boleh mengatur target kalau jabatannya lebih tinggi (Ketua boleh semuanya)
export function bolehAturAnggota(org: Organisasi, aktor: Keanggotaan | undefined, target: Keanggotaan): boolean {
  if (!aktor || !punyaIzin(org, aktor, 'kelolaAnggota') || aktor.akunId === target.akunId) return false
  return adalahKetua(org, aktor) ? !adalahKetua(org, target) : peringkat(org, aktor) < peringkat(org, target)
}

// Role yang boleh diberikan aktor: hanya yang berada di bawah urutannya, dan bukan Ketua
export function roleBolehDiberi(org: Organisasi, aktor: Keanggotaan | undefined): Role[] {
  if (!aktor) return []
  const p = adalahKetua(org, aktor) ? -1 : peringkat(org, aktor)
  return org.roles.filter((r, i) => r.bawaan !== 'ketua' && i > p)
}

export function bolehUbahRole(org: Organisasi, aktor: Keanggotaan | undefined, role: Role): boolean {
  if (!aktor || !punyaIzin(org, aktor, 'kelolaRole') || role.bawaan === 'ketua') return false
  return adalahKetua(org, aktor) || indeksRole(org, role.id) > peringkat(org, aktor)
}

// Aktor hanya boleh menyalakan izin yang dia sendiri punya
export function izinBolehDiberi(org: Organisasi, aktor: Keanggotaan | undefined): Izin[] {
  if (!aktor) return []
  if (adalahKetua(org, aktor)) return SEMUA_IZIN
  return SEMUA_IZIN.filter((i) => roleAnggota(org, aktor).some((r) => r.izin.includes(i)))
}

/* ---------- Data awal untuk demo ---------- */

const hariIni = () => new Date().toISOString().slice(0, 10)

export function dataAwal() {
  const nama = [
    'Aulia Rahman', 'Bima Pratama', 'Dina Safitri', 'Eko Prasetyo', 'Rizky Maulana',
    'Salsa Amelia', 'Nadia Putri', 'Gilang Ramadhan', 'Fajar Hidayat', 'Hana Maharani', 'Putri Ananda',
  ]
  const akuns: Akun[] = nama.map((n, i) => ({
    id: i + 1,
    nama: n,
    email: n.toLowerCase().replace(/ /g, '.') + '@mail.com',
    bio: '',
  }))

  const bem = buatTemplate('bem')
  const ukm = buatTemplate('ukm')
  const unit = (prefix: string, nama: string[]): Unit[] => nama.map((n, i) => ({ id: `${prefix}${i + 1}`, nama: n }))

  const orgs: Organisasi[] = [
    { id: 'hmif', nama: 'HMIF FMIPA USK', labelUnit: 'Departemen', units: unit('h', bem.unitNama), roles: bem.roles, dibuat: '2026-01-10' },
    { id: 'ukm-kreatif', nama: 'UKM Kreatif', labelUnit: 'Divisi', units: unit('k', ukm.unitNama), roles: ukm.roles, dibuat: '2026-02-01' },
  ]

  const a = (akunId: number, orgId: string, roleIds: string[], unitId: string | null, status: 'aktif' | 'menunggu' = 'aktif'): Keanggotaan => ({
    akunId, orgId, roleIds, unitId, status, bergabung: '2026-01-15',
  })

  const members: Keanggotaan[] = [
    a(6, 'hmif', ['ketua'], 'h3'),
    a(3, 'hmif', ['dph', 'kadep'], 'h2'),
    a(1, 'hmif', ['kadep'], 'h1'),
    a(2, 'hmif', ['staff'], 'h1'),
    a(4, 'hmif', ['wakadep'], 'h2'),
    a(5, 'hmif', ['kadep'], 'h3'),
    a(7, 'hmif', ['kadep'], 'h4'),
    a(8, 'hmif', ['sekdep'], 'h4'),
    a(9, 'hmif', ['kadep'], 'h5'),
    a(10, 'hmif', ['staff'], 'h5'),
    a(11, 'hmif', ['staff'], 'h1', 'menunggu'),
    a(7, 'ukm-kreatif', ['ketua'], null),
    a(6, 'ukm-kreatif', ['koordinator'], 'k2'),
    a(1, 'ukm-kreatif', ['anggota'], 'k1'),
    a(10, 'ukm-kreatif', ['anggota'], 'k2'),
  ]

  const undangan: Undangan[] = [
    { kode: 'HMIF26', orgId: 'hmif', roleId: 'staff', unitId: null, kedaluwarsa: '2027-12-31', maks: 0, terpakai: 1, perluSetuju: true, dibuatOleh: 6, aktif: true },
  ]

  return { akuns, orgs, members, undangan, dibuat: hariIni() }
}

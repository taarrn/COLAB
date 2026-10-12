export type Status = 'Perencanaan' | 'Berjalan' | 'Selesai'
export type Tone = 'purple' | 'orange' | 'blue' | 'green'
export type Prioritas = 'Tinggi' | 'Sedang' | 'Rendah'

export interface Anggota {
  id: number
  nama: string
  divisi: string // salah satu isi departemenList
}

export interface Program {
  id: number
  nama: string
  departemen: string
  deskripsi: string
  pjId: number // id anggota penanggung jawab program
  mulai: string // format YYYY-MM-DD
  selesai: string // format YYYY-MM-DD
}

export interface Tugas {
  id: number
  nama: string
  programId: number
  anggotaId: number // satu tugas dipegang satu anggota
  prioritas: Prioritas
  tenggat: string // format YYYY-MM-DD, boleh kosong
  bobot: number // bobot tugas terhadap program, dalam persen (diatur PJ)
  selesai: boolean
}

export type TugasInput = Omit<Tugas, 'id' | 'selesai'>

export const departemenList = [
  'Departemen Sosial Masyarakat',
  'Departemen Pendidikan',
  'Departemen Minat dan Bakat',
  'Departemen Humas dan Media',
  'Departemen Kewirausahaan',
]

export const statusList: Status[] = ['Perencanaan', 'Berjalan', 'Selesai']
export const prioritasList: Prioritas[] = ['Tinggi', 'Sedang', 'Rendah']

// Daftar anggota sementara ditulis di kode. Ganti dengan nama anggota
// sebenarnya; nanti bisa dipindah ke menu Anggota atau database.
export const daftarAnggota: Anggota[] = [
  { id: 1, nama: 'Aulia Rahman', divisi: 'Departemen Sosial Masyarakat' },
  { id: 2, nama: 'Bima Pratama', divisi: 'Departemen Sosial Masyarakat' },
  { id: 3, nama: 'Dina Safitri', divisi: 'Departemen Pendidikan' },
  { id: 4, nama: 'Eko Prasetyo', divisi: 'Departemen Pendidikan' },
  { id: 5, nama: 'Rizky Maulana', divisi: 'Departemen Minat dan Bakat' },
  { id: 6, nama: 'Salsa Amelia', divisi: 'Departemen Minat dan Bakat' },
  { id: 7, nama: 'Nadia Putri', divisi: 'Departemen Humas dan Media' },
  { id: 8, nama: 'Gilang Ramadhan', divisi: 'Departemen Humas dan Media' },
  { id: 9, nama: 'Fajar Hidayat', divisi: 'Departemen Kewirausahaan' },
  { id: 10, nama: 'Hana Maharani', divisi: 'Departemen Kewirausahaan' },
]

export function anggotaById(id: number): Anggota {
  return (
    daftarAnggota.find((a) => a.id === id) ?? {
      id,
      nama: 'Anggota tidak dikenal',
      divisi: '',
    }
  )
}

export const singkatDivisi = (divisi: string) => divisi.replace('Departemen ', '')

// Warna program mengikuti departemennya, memakai kelas warna di App.css
const tones: Tone[] = ['purple', 'orange', 'blue', 'green']

export function toneOf(departemen: string): Tone {
  const index = departemenList.indexOf(departemen)
  return tones[(index < 0 ? 0 : index) % tones.length]
}

export const formatTanggal = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

// Persentase selesai dari sekumpulan tugas, ditimbang dengan bobot.
// Kalau semua bobot 0, tiap tugas dianggap sama besar.
function persen(daftar: Tugas[]) {
  if (daftar.length === 0) return 0
  const totalBobot = daftar.reduce((sum, t) => sum + t.bobot, 0)
  if (totalBobot === 0) {
    return Math.round((daftar.filter((t) => t.selesai).length / daftar.length) * 100)
  }
  const bobotSelesai = daftar.filter((t) => t.selesai).reduce((sum, t) => sum + t.bobot, 0)
  return Math.round((bobotSelesai / totalBobot) * 100)
}

export function totalBobot(programId: number, tugas: Tugas[]) {
  return tugas
    .filter((t) => t.programId === programId)
    .reduce((sum, t) => sum + t.bobot, 0)
}

// Progres program dihitung dari bobot tugas yang selesai.
// Status: belum ada tugas selesai = Perencanaan, sebagian = Berjalan, semua = Selesai
export function hitungProgres(programId: number, tugas: Tugas[]) {
  const milik = tugas.filter((t) => t.programId === programId)
  const total = milik.length
  const selesai = milik.filter((t) => t.selesai).length
  const status: Status =
    selesai === 0 ? 'Perencanaan' : selesai === total ? 'Selesai' : 'Berjalan'
  return { total, selesai, progres: persen(milik), status }
}

// Ringkasan per anggota yang terlibat di sebuah program.
// "inti" = anggota dari divisi pemilik program, selain itu berarti dibantu.
export function ringkasAnggota(program: Program, tugas: Tugas[]) {
  const milik = tugas.filter((t) => t.programId === program.id)
  const bobotProgram = milik.reduce((sum, t) => sum + t.bobot, 0)
  const ids = Array.from(new Set([program.pjId, ...milik.map((t) => t.anggotaId)]))

  return ids
    .map((id) => {
      const anggota = anggotaById(id)
      const tugasAnggota = milik.filter((t) => t.anggotaId === id)
      const bobot = tugasAnggota.reduce((sum, t) => sum + t.bobot, 0)
      const beban =
        bobotProgram > 0
          ? Math.round((bobot / bobotProgram) * 100)
          : milik.length > 0
            ? Math.round((tugasAnggota.length / milik.length) * 100)
            : 0
      return {
        anggota,
        tugas: tugasAnggota,
        beban,
        progres: persen(tugasAnggota),
        inti: anggota.divisi === program.departemen,
        pj: id === program.pjId,
      }
    })
    .sort((a, b) => Number(b.pj) - Number(a.pj) || Number(b.inti) - Number(a.inti))
}

export const initialPrograms: Program[] = [
  {
    id: 1,
    nama: 'Informatika Menyapa',
    departemen: 'Departemen Sosial Masyarakat',
    deskripsi: 'Kegiatan pengabdian ke sekolah untuk mengenalkan dunia informatika.',
    pjId: 1,
    mulai: '2026-02-01',
    selesai: '2026-11-30',
  },
  {
    id: 2,
    nama: 'Pelatihan Internal',
    departemen: 'Departemen Pendidikan',
    deskripsi: 'Pelatihan rutin untuk pengurus dan anggota, dari dasar web hingga Git.',
    pjId: 3,
    mulai: '2026-03-10',
    selesai: '2026-12-15',
  },
  {
    id: 3,
    nama: 'Dies Natalis Informatika',
    departemen: 'Departemen Minat dan Bakat',
    deskripsi: 'Perayaan ulang tahun prodi dengan lomba, seminar, dan malam apresiasi.',
    pjId: 5,
    mulai: '2026-08-01',
    selesai: '2026-12-20',
  },
  {
    id: 4,
    nama: 'Media Kreatif HMIF',
    departemen: 'Departemen Humas dan Media',
    deskripsi: 'Pengelolaan konten Instagram dan dokumentasi seluruh kegiatan himpunan.',
    pjId: 7,
    mulai: '2026-01-15',
    selesai: '2026-12-31',
  },
  {
    id: 5,
    nama: 'Bazar Merchandise',
    departemen: 'Departemen Kewirausahaan',
    deskripsi: 'Penjualan merchandise himpunan untuk menambah kas organisasi.',
    pjId: 9,
    mulai: '2026-11-05',
    selesai: '2027-01-10',
  },
]

export const initialTugas: Tugas[] = [
  { id: 1, nama: 'Menyusun proposal kegiatan', programId: 1, anggotaId: 1, prioritas: 'Tinggi', tenggat: '2026-10-20', bobot: 25, selesai: true },
  { id: 2, nama: 'Menghubungi pemateri', programId: 2, anggotaId: 4, prioritas: 'Sedang', tenggat: '2026-10-25', bobot: 40, selesai: false },
  { id: 3, nama: 'Menyiapkan desain poster', programId: 3, anggotaId: 8, prioritas: 'Rendah', tenggat: '2026-11-05', bobot: 25, selesai: false },
  { id: 4, nama: 'Survei sekolah tujuan', programId: 1, anggotaId: 2, prioritas: 'Sedang', tenggat: '2026-10-15', bobot: 20, selesai: true },
  { id: 5, nama: 'Menyiapkan materi pengenalan', programId: 1, anggotaId: 3, prioritas: 'Sedang', tenggat: '2026-10-28', bobot: 25, selesai: true },
  { id: 6, nama: 'Koordinasi transportasi', programId: 1, anggotaId: 2, prioritas: 'Rendah', tenggat: '2026-11-10', bobot: 10, selesai: true },
  { id: 7, nama: 'Menyusun laporan kegiatan', programId: 1, anggotaId: 1, prioritas: 'Tinggi', tenggat: '2026-11-25', bobot: 20, selesai: false },
  { id: 8, nama: 'Menyiapkan modul pelatihan', programId: 2, anggotaId: 3, prioritas: 'Tinggi', tenggat: '2026-10-22', bobot: 40, selesai: true },
  { id: 9, nama: 'Menyusun susunan acara', programId: 3, anggotaId: 5, prioritas: 'Tinggi', tenggat: '2026-10-30', bobot: 35, selesai: true },
  { id: 10, nama: 'Mencari sponsor', programId: 3, anggotaId: 10, prioritas: 'Sedang', tenggat: '2026-11-15', bobot: 40, selesai: false },
  { id: 11, nama: 'Membuat kalender konten', programId: 4, anggotaId: 7, prioritas: 'Sedang', tenggat: '2026-09-30', bobot: 50, selesai: true },
  { id: 12, nama: 'Dokumentasi kegiatan bulanan', programId: 4, anggotaId: 8, prioritas: 'Rendah', tenggat: '2026-10-10', bobot: 50, selesai: true },
  { id: 13, nama: 'Publikasi pelatihan', programId: 2, anggotaId: 8, prioritas: 'Sedang', tenggat: '2026-11-01', bobot: 20, selesai: false },
]

// Key diberi v2 karena bentuk datanya berubah (ada pjId, anggotaId, bobot)
const PROGRAM_KEY = 'kolab:programs:v2'
const TUGAS_KEY = 'kolab:tugas:v2'
const USER_KEY = 'kolab:user:v2'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {
    // data rusak atau localStorage tidak tersedia: pakai data awal
  }
  return fallback
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // abaikan jika penyimpanan penuh atau diblokir
  }
}

export const loadPrograms = () => load<Program[]>(PROGRAM_KEY, initialPrograms)
export const savePrograms = (programs: Program[]) => save(PROGRAM_KEY, programs)
export const loadTugas = () => load<Tugas[]>(TUGAS_KEY, initialTugas)
export const saveTugas = (tugas: Tugas[]) => save(TUGAS_KEY, tugas)
export const loadUserId = () => load<number>(USER_KEY, daftarAnggota[0].id)
export const saveUserId = (id: number) => save(USER_KEY, id)
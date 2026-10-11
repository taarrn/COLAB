export type Status = 'Perencanaan' | 'Berjalan' | 'Selesai'
export type Tone = 'purple' | 'orange' | 'blue' | 'green'

export interface Program {
  id: number
  nama: string
  departemen: string
  deskripsi: string
  penanggungJawab: string
  mulai: string // format YYYY-MM-DD
  selesai: string // format YYYY-MM-DD
  progres: number // 0 - 100
  status: Status
}

export const departemenList = [
  'Departemen Sosial Masyarakat',
  'Departemen Pendidikan',
  'Departemen Minat dan Bakat',
  'Departemen Humas dan Media',
  'Departemen Kewirausahaan',
]

export const statusList: Status[] = ['Perencanaan', 'Berjalan', 'Selesai']

// Warna program mengikuti departemennya, memakai kelas warna di App.css
const tones: Tone[] = ['purple', 'orange', 'blue', 'green']

export function toneOf(departemen: string): Tone {
  const index = departemenList.indexOf(departemen)
  return tones[(index < 0 ? 0 : index) % tones.length]
}

export const initialPrograms: Program[] = [
  {
    id: 1,
    nama: 'Informatika Menyapa',
    departemen: 'Departemen Sosial Masyarakat',
    deskripsi: 'Kegiatan pengabdian ke sekolah untuk mengenalkan dunia informatika.',
    penanggungJawab: 'Aulia Rahman',
    mulai: '2026-02-01',
    selesai: '2026-11-30',
    progres: 80,
    status: 'Berjalan',
  },
  {
    id: 2,
    nama: 'Pelatihan Internal',
    departemen: 'Departemen Pendidikan',
    deskripsi: 'Pelatihan rutin untuk pengurus dan anggota, dari dasar web hingga Git.',
    penanggungJawab: 'Dina Safitri',
    mulai: '2026-03-10',
    selesai: '2026-12-15',
    progres: 55,
    status: 'Berjalan',
  },
  {
    id: 3,
    nama: 'Dies Natalis Informatika',
    departemen: 'Departemen Minat dan Bakat',
    deskripsi: 'Perayaan ulang tahun prodi dengan lomba, seminar, dan malam apresiasi.',
    penanggungJawab: 'Rizky Maulana',
    mulai: '2026-08-01',
    selesai: '2026-12-20',
    progres: 30,
    status: 'Berjalan',
  },
  {
    id: 4,
    nama: 'Media Kreatif HMIF',
    departemen: 'Departemen Humas dan Media',
    deskripsi: 'Pengelolaan konten Instagram dan dokumentasi seluruh kegiatan himpunan.',
    penanggungJawab: 'Nadia Putri',
    mulai: '2026-01-15',
    selesai: '2026-12-31',
    progres: 100,
    status: 'Selesai',
  },
  {
    id: 5,
    nama: 'Bazar Merchandise',
    departemen: 'Departemen Kewirausahaan',
    deskripsi: 'Penjualan merchandise himpunan untuk menambah kas organisasi.',
    penanggungJawab: 'Fajar Hidayat',
    mulai: '2026-11-05',
    selesai: '2027-01-10',
    progres: 0,
    status: 'Perencanaan',
  },
]

const STORAGE_KEY = 'kolab:programs'

export function loadPrograms(): Program[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Program[]
  } catch {
    // data rusak atau localStorage tidak tersedia: pakai data awal
  }
  return initialPrograms
}

export function savePrograms(programs: Program[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(programs))
  } catch {
    // abaikan jika penyimpanan penuh atau diblokir
  }
}
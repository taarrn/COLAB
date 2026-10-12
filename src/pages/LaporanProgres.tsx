import { useState } from 'react'
import './LaporanProgres.css'
import {
  anggotaById,
  daftarAnggota,
  departemenList,
  faseProgram,
  formatTanggal,
  hariIniKey,
  hitungProgres,
  singkatDivisi,
  statusList,
  toneOf,
} from '../data'
import type { FaseProgram, Program, Status, Tone, Tugas } from '../data'

interface Props {
  programs: Program[]
  tugas: Tugas[]
}

type Kondisi = 'Selesai' | 'Sesuai jadwal' | 'Belum mulai' | 'Tertinggal' | 'Lewat jadwal'

interface BarisProgram {
  program: Program
  tone: Tone
  total: number
  selesai: number
  terlambat: number
  progres: number
  status: Status
  fase: FaseProgram
  target: number // persen waktu program yang sudah berjalan
  kondisi: Kondisi
}

// Program dianggap tertinggal kalau progresnya lebih dari 10 poin di bawah target waktu
const TOLERANSI = 10
// Tugas yang tenggatnya dalam 7 hari ke depan masuk daftar "Perlu perhatian"
const SEGERA = 7

const kondisiClass: Record<Kondisi, string> = {
  Selesai: 'ok',
  'Sesuai jadwal': 'ok',
  'Belum mulai': 'neutral',
  Tertinggal: 'warn',
  'Lewat jadwal': 'bad',
}

const pad = (n: number) => String(n).padStart(2, '0')
const persenDari = (bagian: number, total: number) =>
  total === 0 ? 0 : Math.round((bagian / total) * 100)

const waktu = (iso: string) => new Date(iso + 'T00:00:00').getTime()
const selisihHari = (dari: string, ke: string) =>
  Math.round((waktu(ke) - waktu(dari)) / 86_400_000)

// Tugas terlambat = belum selesai dan sudah lewat tenggat
const telat = (t: Tugas, hariIni: string) => !!t.tenggat && !t.selesai && t.tenggat < hariIni

// Berapa persen waktu program yang sudah terpakai (0-100)
function targetWaktu(p: Program, hariIni: string) {
  const durasi = selisihHari(p.mulai, p.selesai)
  if (durasi <= 0) return hariIni >= p.selesai ? 100 : 0
  return Math.min(100, Math.max(0, persenDari(selisihHari(p.mulai, hariIni), durasi)))
}

function tentukanKondisi(status: Status, fase: FaseProgram, progres: number, target: number): Kondisi {
  if (status === 'Selesai') return 'Selesai'
  if (fase === 'Akan datang') return 'Belum mulai'
  if (fase === 'Berakhir') return 'Lewat jadwal'
  return progres + TOLERANSI >= target ? 'Sesuai jadwal' : 'Tertinggal'
}

// Unduh rekap program sebagai CSV (BOM supaya terbaca benar di Excel)
function unduhCsv(baris: BarisProgram[]) {
  const kepala = [
    'Program', 'Departemen', 'Penanggung jawab', 'Mulai', 'Selesai',
    'Total tugas', 'Tugas selesai', 'Tugas terlambat', 'Progres (%)', 'Status', 'Kondisi',
  ]
  const isi = baris.map((b) => [
    b.program.nama, b.program.departemen, anggotaById(b.program.pjId).nama,
    b.program.mulai, b.program.selesai, b.total, b.selesai, b.terlambat,
    b.progres, b.status, b.kondisi,
  ])
  // Awalan ' mencegah teks yang diawali = + - @ dibaca sebagai rumus di spreadsheet
  const sel = (v: string | number) => {
    const teks = /^[=+\-@]/.test(String(v)) ? `'${v}` : String(v)
    return `"${teks.replace(/"/g, '""')}"`
  }
  const csv = [kepala, ...isi].map((r) => r.map(sel).join(',')).join('\r\n')

  const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `laporan-progres-${hariIniKey()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Batang progres. "target" menampilkan garis penanda posisi ideal menurut waktu.
function Bar({
  progres,
  tone,
  label,
  target,
}: {
  progres: number
  tone: Tone
  label: string
  target?: number
}) {
  return (
    <div
      className="lp-bar"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progres}
    >
      <div className={`progress-fill ${tone}-fill`} style={{ width: `${progres}%` }} />
      {target !== undefined && (
        <span className="lp-tick" style={{ left: `${target}%` }} title={`Target menurut waktu: ${target}%`} />
      )}
    </div>
  )
}

export default function LaporanProgres({ programs, tugas }: Props) {
  const [filterStatus, setFilterStatus] = useState<Status | 'Semua'>('Semua')
  const [filterDept, setFilterDept] = useState('semua')

  const hariIni = hariIniKey()

  // ---------- Data per program ----------
  const semua: BarisProgram[] = programs.map((p) => {
    const { total, selesai, progres, status } = hitungProgres(p.id, tugas)
    const fase = faseProgram(p, hariIni)
    const target = targetWaktu(p, hariIni)
    return {
      program: p,
      tone: toneOf(p.departemen),
      total,
      selesai,
      terlambat: tugas.filter((t) => t.programId === p.id && telat(t, hariIni)).length,
      progres,
      status,
      fase,
      target,
      kondisi: tentukanKondisi(status, fase, progres, target),
    }
  })

  // Filter berlaku ke seluruh halaman, jadi semua angka di bawah ikut berubah
  const sesuaiDept = semua.filter((b) => filterDept === 'semua' || b.program.departemen === filterDept)
  const baris = sesuaiDept.filter((b) => filterStatus === 'Semua' || b.status === filterStatus)
  const idTampil = new Set(baris.map((b) => b.program.id))
  const tugasTampil = tugas.filter((t) => idTampil.has(t.programId))

  const countOf = (s: Status | 'Semua') =>
    s === 'Semua' ? sesuaiDept.length : sesuaiDept.filter((b) => b.status === s).length

  // ---------- Ringkasan ----------
  const totalTugas = tugasTampil.length
  const tugasSelesai = tugasTampil.filter((t) => t.selesai).length
  const tugasTerlambat = tugasTampil.filter((t) => telat(t, hariIni)).length
  const tugasBerjalan = totalTugas - tugasSelesai - tugasTerlambat
  const progresKeseluruhan = baris.length
    ? Math.round(baris.reduce((sum, b) => sum + b.progres, 0) / baris.length)
    : 0
  const programSelesai = baris.filter((b) => b.status === 'Selesai').length
  const programBerjalan = baris.filter((b) => b.status === 'Berjalan').length
  const perluPerhatian = baris.filter(
    (b) => b.kondisi === 'Tertinggal' || b.kondisi === 'Lewat jadwal',
  ).length

  // ---------- Donat status tugas ----------
  const segmen = [
    { label: 'Selesai', jumlah: tugasSelesai, warna: '#3dbb88', kelas: 'done' },
    { label: 'Sedang dikerjakan', jumlah: tugasBerjalan, warna: '#7669e8', kelas: 'progress' },
    { label: 'Terlambat', jumlah: tugasTerlambat, warna: '#e4736f', kelas: 'late' },
  ]
  const aktif = segmen.filter((s) => s.jumlah > 0)
  const donat =
    totalTugas > 0
      ? `conic-gradient(${aktif
          .map((s, i) => {
            const awal = aktif.slice(0, i).reduce((sum, x) => sum + x.jumlah, 0)
            return `${s.warna} ${(awal / totalTugas) * 100}% ${((awal + s.jumlah) / totalTugas) * 100}%`
          })
          .join(', ')})`
      : '#efeff6'

  // ---------- Per departemen ----------
  const perDept = departemenList
    .map((nama) => {
      const milik = baris.filter((b) => b.program.departemen === nama)
      return {
        nama,
        tone: toneOf(nama),
        jumlahProgram: milik.length,
        total: milik.reduce((sum, b) => sum + b.total, 0),
        selesai: milik.reduce((sum, b) => sum + b.selesai, 0),
        progres: milik.length
          ? Math.round(milik.reduce((sum, b) => sum + b.progres, 0) / milik.length)
          : 0,
      }
    })
    .filter((d) => d.jumlahProgram > 0)

  // ---------- Tugas yang perlu perhatian ----------
  const perhatian = tugasTampil
    .filter((t) => !t.selesai && t.tenggat)
    .map((t) => ({ tugas: t, sisa: selisihHari(hariIni, t.tenggat) }))
    .filter((x) => x.sisa <= SEGERA)
    .sort((a, b) => a.sisa - b.sisa)
  const segera = perhatian.filter((x) => x.sisa >= 0).length
  const namaProgram = (id: number) => programs.find((p) => p.id === id)?.nama ?? 'Program dihapus'

  // ---------- Kontribusi anggota ----------
  const perAnggota = daftarAnggota
    .map((a) => {
      const milik = tugasTampil.filter((t) => t.anggotaId === a.id)
      const selesai = milik.filter((t) => t.selesai).length
      return {
        anggota: a,
        total: milik.length,
        selesai,
        terlambat: milik.filter((t) => telat(t, hariIni)).length,
        progres: persenDari(selesai, milik.length),
      }
    })
    .filter((m) => m.total > 0)
    .sort((a, b) => b.total - a.total || a.anggota.nama.localeCompare(b.anggota.nama, 'id'))

  const judul =
    perluPerhatian === 0
      ? 'Semua program berjalan sesuai rencana'
      : `${perluPerhatian} dari ${baris.length} program perlu perhatian`

  return (
    <>
      <header className="topbar lp-topbar">
        <div>
          <p className="breadcrumb">Menu Utama / Laporan Progres</p>
          <h1>Laporan Progres</h1>
        </div>
        <div className="lp-actions no-print">
          <button className="btn btn-ghost" onClick={() => unduhCsv(baris)} disabled={baris.length === 0}>
            Unduh CSV
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            Cetak laporan
          </button>
        </div>
      </header>

      <div className="toolbar no-print">
        <div className="tabs" role="tablist">
          {(['Semua', ...statusList] as const).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={filterStatus === s}
              className={`tab${filterStatus === s ? ' active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s} <span className="tab-count">{countOf(s)}</span>
            </button>
          ))}
        </div>
        <select
          className="lp-select"
          aria-label="Filter departemen"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
        >
          <option value="semua">Semua departemen</option>
          {departemenList.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {baris.length === 0 ? (
        <div className="panel empty-state">
          <h3>{programs.length === 0 ? 'Belum ada data untuk dilaporkan' : 'Tidak ada program yang cocok'}</h3>
          <p>
            {programs.length === 0
              ? 'Tambahkan program kerja dan tugas dulu, laporannya akan muncul di sini.'
              : 'Coba ubah filter status atau departemen.'}
          </p>
        </div>
      ) : (
        <>
          <section className="lp-hero">
            <div>
              <p className="lp-hero-label">RINGKASAN LAPORAN</p>
              <h2>{judul}</h2>
              <p className="lp-hero-text">
                Per {formatTanggal(hariIni)}: {tugasSelesai} dari {totalTugas} tugas selesai,{' '}
                {tugasTerlambat} terlambat, dan {segera} jatuh tempo dalam {SEGERA} hari ke depan.
              </p>
            </div>
            <div className="lp-hero-score">
              <strong>{progresKeseluruhan}%</strong>
              <span>Progres keseluruhan</span>
              <div className="lp-hero-bar">
                <div style={{ width: `${progresKeseluruhan}%` }} />
              </div>
            </div>
          </section>

          <section className="stats">
            <div className="stat-card">
              <div className="stat-top">
                <span>Program Kerja</span>
                <span className="stat-icon purple">▤</span>
              </div>
              <h3>{pad(baris.length)}</h3>
              <p>
                {programSelesai} selesai, {programBerjalan} berjalan
              </p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Tugas Selesai</span>
                <span className="stat-icon green">✓</span>
              </div>
              <h3>{pad(tugasSelesai)}</h3>
              <p>dari {totalTugas} tugas</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Tugas Terlambat</span>
                <span className="stat-icon red">!</span>
              </div>
              <h3>{pad(tugasTerlambat)}</h3>
              <p>Lewat tenggat, belum selesai</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Perlu Perhatian</span>
                <span className="stat-icon orange">▲</span>
              </div>
              <h3>{pad(perluPerhatian)}</h3>
              <p>Program tertinggal dari jadwal</p>
            </div>
          </section>

          <section className="lp-grid lp-grid-a">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h3>Status Tugas</h3>
                  <p>Sebaran tugas berdasarkan kondisinya saat ini.</p>
                </div>
              </div>
              <div className="lp-donut-wrap">
                <div className="lp-donut" style={{ background: donat }} role="img" aria-label={`${tugasSelesai} dari ${totalTugas} tugas selesai`}>
                  <div className="lp-donut-center">
                    <strong>
                      {tugasSelesai}/{totalTugas}
                    </strong>
                    <span>tugas selesai</span>
                  </div>
                </div>
                <ul className="lp-legend">
                  {segmen.map((s) => (
                    <li key={s.label}>
                      <span className={`lp-dot ${s.kelas}`} />
                      {s.label}
                      <b>{s.jumlah}</b>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div>
                  <h3>Progres per Departemen</h3>
                  <p>Rata-rata progres program di tiap departemen.</p>
                </div>
              </div>
              <div className="lp-dept">
                {perDept.map((d) => (
                  <div key={d.nama}>
                    <div className="lp-row-head">
                      <strong>{singkatDivisi(d.nama)}</strong>
                      <span className={`status status-${d.tone}`}>{d.progres}%</span>
                    </div>
                    <Bar progres={d.progres} tone={d.tone} label={`Progres ${d.nama}`} />
                    <p className="lp-row-meta">
                      {d.jumlahProgram} program · {d.selesai} dari {d.total} tugas selesai
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="panel lp-section">
            <div className="panel-header">
              <div>
                <h3>Rincian per Program</h3>
                <p>Progres tiap program dibandingkan dengan waktu yang sudah berjalan.</p>
              </div>
            </div>

            <div className="lp-table-wrap">
              <table className="lp-table">
                <thead>
                  <tr>
                    <th scope="col">Program</th>
                    <th scope="col">Penanggung jawab</th>
                    <th scope="col">Jadwal</th>
                    <th scope="col">Tugas</th>
                    <th scope="col">Progres</th>
                    <th scope="col">Kondisi</th>
                  </tr>
                </thead>
                <tbody>
                  {baris.map((b) => (
                    <tr key={b.program.id}>
                      <td>
                        <div className="lp-prog-name">
                          <strong>{b.program.nama}</strong>
                          <span className={`badge ${b.tone}`}>{singkatDivisi(b.program.departemen)}</span>
                        </div>
                      </td>
                      <td>{anggotaById(b.program.pjId).nama}</td>
                      <td>
                        {formatTanggal(b.program.mulai)} – {formatTanggal(b.program.selesai)}
                        <div className="lp-muted">{b.fase}</div>
                      </td>
                      <td>
                        {b.total === 0 ? '—' : `${b.selesai}/${b.total}`}
                        {b.terlambat > 0 && <div className="lp-late">{b.terlambat} terlambat</div>}
                      </td>
                      <td>
                        <div className="lp-cell-progress">
                          <Bar
                            progres={b.progres}
                            tone={b.tone}
                            label={`Progres ${b.program.nama}`}
                            target={b.fase === 'Berlangsung' && b.status !== 'Selesai' ? b.target : undefined}
                          />
                          <span className={`status status-${b.tone}`}>{b.progres}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`lp-pill ${kondisiClass[b.kondisi]}`}>{b.kondisi}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="lp-note">
              Garis tegak pada batang progres menandai target menurut waktu yang sudah berjalan. Program
              dinilai “Tertinggal” kalau progresnya lebih dari {TOLERANSI} poin di bawah garis itu.
            </p>
          </section>

          <section className="lp-grid lp-grid-b">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h3>Perlu Perhatian</h3>
                  <p>Tugas terlambat dan yang jatuh tempo dalam {SEGERA} hari.</p>
                </div>
              </div>
              {perhatian.length === 0 ? (
                <p className="lp-empty">Tidak ada tugas yang mendesak. Kerja bagus!</p>
              ) : (
                <ul className="lp-list">
                  {perhatian.slice(0, 6).map(({ tugas: t, sisa }) => (
                    <li key={t.id}>
                      <span className={`lp-alert-dot ${sisa < 0 ? 'bad' : 'warn'}`} />
                      <div className="lp-item-main">
                        <strong>{t.nama}</strong>
                        <p>
                          {namaProgram(t.programId)} · {anggotaById(t.anggotaId).nama}
                        </p>
                      </div>
                      <span className={`lp-pill ${sisa < 0 ? 'bad' : 'warn'}`}>
                        {sisa < 0 ? `Terlambat ${-sisa} hari` : sisa === 0 ? 'Hari ini' : `${sisa} hari lagi`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {perhatian.length > 6 && (
                <p className="lp-note">dan {perhatian.length - 6} tugas lainnya di menu Manajemen Tugas.</p>
              )}
            </div>

            <div className="panel">
              <div className="panel-header">
                <div>
                  <h3>Kontribusi Anggota</h3>
                  <p>Tugas yang dipegang tiap anggota dan berapa yang sudah selesai.</p>
                </div>
              </div>
              {perAnggota.length === 0 ? (
                <p className="lp-empty">Belum ada tugas yang dibagikan.</p>
              ) : (
                <ul className="lp-list">
                  {perAnggota.map((m) => (
                    <li key={m.anggota.id}>
                      <span className={`lp-avatar ${toneOf(m.anggota.divisi)}`}>{m.anggota.nama.charAt(0)}</span>
                      <div className="lp-item-main">
                        <strong>
                          {m.anggota.nama}
                          {m.terlambat > 0 && <span className="lp-pill bad lp-pill-sm">{m.terlambat} terlambat</span>}
                        </strong>
                        <p>{singkatDivisi(m.anggota.divisi)}</p>
                      </div>
                      <div className="lp-member-progress">
                        <Bar progres={m.progres} tone={toneOf(m.anggota.divisi)} label={`Progres ${m.anggota.nama}`} />
                        <span>
                          {m.selesai}/{m.total} tugas
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </>
  )
}
import { useEffect, useMemo, useState } from 'react'
import './KalenderKegiatan.css'
import TugasForm from '../components/TugasForm'
import {
  anggotaById,
  faseProgram,
  formatTanggal,
  hariIniKey,
  keyTanggal,
  rentangTugas,
  toneOf,
} from '../data'
import type { Anggota, Program, Tugas, TugasInput } from '../data'

interface Props {
  programs: Program[]
  tugas: Tugas[]
  user: Anggota
  onAddTugas: (data: TugasInput) => void
  onToggleTugas: (id: number) => void
}

const namaBulan = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
const hari = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export default function KalenderKegiatan({ programs, tugas, user, onAddTugas, onToggleTugas }: Props) {
  const hariIni = hariIniKey()
  const sekarang = new Date()
  const [bulan, setBulan] = useState(sekarang.getMonth())
  const [tahun, setTahun] = useState(sekarang.getFullYear())
  const [dipilih, setDipilih] = useState(hariIni)
  const [showForm, setShowForm] = useState(false)
  const [popup, setPopup] = useState(false) // popup agenda saat tanggal diklik

  useEffect(() => {
    if (!showForm && !popup) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setShowForm(false)
      setPopup(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showForm, popup])

  // Hanya PJ program yang boleh menambah tugas ke kalender
  const programSaya = programs.filter((p) => p.pjId === user.id)
  const adalahPj = (programId: number) => programSaya.some((p) => p.id === programId)
  const bolehDone = (t: Tugas) => t.anggotaId === user.id || adalahPj(t.programId)

  const namaProgram = (id: number) => programs.find((p) => p.id === id)?.nama ?? 'Program dihapus'
  const toneTugas = (t: Tugas) => {
    const p = programs.find((x) => x.id === t.programId)
    return p ? toneOf(p.departemen) : 'purple'
  }

  // Semua tugas yang punya tanggal, lengkap dengan rentang tampilnya
  const tugasBerjadwal = useMemo(
    () =>
      tugas.flatMap((t) => {
        const r = rentangTugas(t, hariIni)
        return r ? [{ t, ...r }] : []
      }),
    [tugas, hariIni],
  )

  const programPadaTanggal = (key: string) => programs.filter((p) => key >= p.mulai && key <= p.selesai)
  const tugasPadaTanggal = (key: string) =>
    tugasBerjadwal.filter((x) => key >= x.awal && key <= x.akhir)

  const ubahBulan = (arah: number) => {
    const d = new Date(tahun, bulan + arah, 1)
    setBulan(d.getMonth())
    setTahun(d.getFullYear())
    setDipilih(keyTanggal(d))
  }

  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate()
  const hariPertama = new Date(tahun, bulan, 1).getDay()
  const grid = [
    ...Array.from({ length: hariPertama }, () => null as number | null),
    ...Array.from({ length: jumlahHari }, (_, i) => i + 1),
  ]
  const keyHari = (n: number) => keyTanggal(new Date(tahun, bulan, n))

  // Ringkasan bulan ini: program yang bersinggungan dengan bulan tampil dan tugas berjadwal
  const awalBulan = keyHari(1)
  const akhirBulan = keyHari(jumlahHari)
  const programBulanIni = programs.filter((p) => p.mulai <= akhirBulan && p.selesai >= awalBulan).length
  const tugasBulanIni = tugasBerjadwal.filter((x) => x.awal <= akhirBulan && x.akhir >= awalBulan).length

  const programDipilih = programPadaTanggal(dipilih)
  const tugasDipilih = tugasPadaTanggal(dipilih).sort((a, b) => Number(a.t.selesai) - Number(b.t.selesai))

  // Isi agenda dipakai di panel kanan dan di popup
  const isiAgenda = (
    <>
      {programDipilih.length === 0 && tugasDipilih.length === 0 && (
        <div className="agenda-empty">
          <span>▦</span>
          <strong>Tidak ada agenda</strong>
          <p>Tidak ada program atau tugas pada tanggal ini.</p>
        </div>
      )}

      {programDipilih.length > 0 && (
        <>
          <h3 className="agenda-section">Program kerja</h3>
          {programDipilih.map((p) => {
            const fase = faseProgram(p, dipilih)
            const label =
              dipilih === p.mulai ? 'Dimulai hari ini' : dipilih === p.selesai ? 'Berakhir hari ini' : 'Berlangsung'
            return (
              <div className="agenda-card" key={p.id}>
                <span className={`agenda-stripe ${toneOf(p.departemen)}`} />
                <div>
                  <strong>{p.nama}</strong>
                  <small>
                    {formatTanggal(p.mulai)} – {formatTanggal(p.selesai)}
                  </small>
                  <small>
                    {label} · PJ {anggotaById(p.pjId).nama}
                  </small>
                  {fase === 'Berakhir' && <small>Program sudah berakhir</small>}
                </div>
              </div>
            )
          })}
        </>
      )}

      {tugasDipilih.length > 0 && (
        <>
          <h3 className="agenda-section">Tugas</h3>
          {tugasDipilih.map(({ t, awal }) => {
            const telat = !t.selesai && hariIni > (t.tenggat || awal)
            return (
              <div className={`agenda-card${t.selesai ? ' selesai' : ''}`} key={t.id}>
                <span className={`agenda-stripe ${toneTugas(t)}`} />
                <div className="agenda-card-body">
                  <strong>{t.nama}</strong>
                  <small>
                    {t.mulai ? `${formatTanggal(t.mulai)} – ` : 'Tenggat '}
                    {formatTanggal(t.tenggat || awal)}
                  </small>
                  <small>
                    {namaProgram(t.programId)} · {anggotaById(t.anggotaId).nama}
                  </small>
                  {telat && <small className="telat">Terlambat, belum ditandai selesai</small>}
                </div>
                <button
                  className={`btn-done${t.selesai ? ' sudah' : ''}`}
                  onClick={() => onToggleTugas(t.id)}
                  disabled={!bolehDone(t)}
                  title={bolehDone(t) ? undefined : 'Hanya yang ditugaskan atau PJ yang bisa menandai'}
                >
                  {t.selesai ? '✓ Selesai' : 'Done'}
                </button>
              </div>
            )
          })}
        </>
      )}
    </>
  )

  return (
    <div className="kalender-page">
      <header className="kalender-header">
        <div>
          <p className="kalender-breadcrumb">Menu Utama / Kalender Kegiatan</p>
          <h1>Kalender Kegiatan</h1>
          <p className="kalender-subtitle">
            Jadwal program kerja dan tugas tim dalam satu kalender.
          </p>
        </div>
        <button
          className="kalender-add"
          onClick={() => setShowForm(true)}
          disabled={programSaya.length === 0}
          title={programSaya.length === 0 ? 'Hanya penanggung jawab program yang bisa menambah tugas' : undefined}
        >
          + Tambah Tugas
        </button>
      </header>

      <section className="kalender-layout">
        <div className="kalender-card">
          <div className="kalender-month-header">
            <div>
              <h2>{namaBulan[bulan]} {tahun}</h2>
              <p>{programBulanIni} program · {tugasBulanIni} tugas bulan ini</p>
            </div>
            <div className="kalender-navigation">
              <button aria-label="Bulan sebelumnya" onClick={() => ubahBulan(-1)}>‹</button>
              <button
                onClick={() => {
                  setBulan(sekarang.getMonth())
                  setTahun(sekarang.getFullYear())
                  setDipilih(hariIni)
                }}
              >
                Hari ini
              </button>
              <button aria-label="Bulan berikutnya" onClick={() => ubahBulan(1)}>›</button>
            </div>
          </div>

          <div className="kalender-legend">
            <span><i className="lg-program" /> Program kerja</span>
            <span><i className="lg-tugas" /> Tugas</span>
            <span><i className="lg-done" /> Selesai</span>
            <span><i className="lg-late" /> Terlambat</span>
          </div>

          <div className="kalender-grid">
            {hari.map((n) => (
              <div className="kalender-weekday" key={n}>{n}</div>
            ))}

            {grid.map((n, i) => {
              if (n === null) return <div className="kalender-day kosong" key={`k-${i}`} />
              const key = keyHari(n)
              const progs = programPadaTanggal(key)
              const tgs = tugasPadaTanggal(key)
              // Maksimal 3 baris di sel, sisanya diringkas "+N lagi"
              const baris = [
                ...progs.map((p) => ({ k: `p${p.id}`, jenis: 'program' as const, p })),
                ...tgs.map((x) => ({ k: `t${x.t.id}`, jenis: 'tugas' as const, x })),
              ]
              return (
                <button
                  key={key}
                  className={`kalender-day${dipilih === key ? ' dipilih' : ''}`}
                  onClick={() => {
                    setDipilih(key)
                    setPopup(true)
                  }}
                >
                  <span className={`kalender-date${key === hariIni ? ' hari-ini' : ''}`}>{n}</span>
                  {baris.slice(0, 3).map((b) => {
                    if (b.jenis === 'program') {
                      const awal = key === b.p.mulai
                      const akhir = key === b.p.selesai
                      return (
                        <span
                          key={b.k}
                          className={`kal-bar ${toneOf(b.p.departemen)}${awal ? ' awal' : ''}${akhir ? ' akhir' : ''}`}
                          title={b.p.nama}
                        >
                          {awal ? b.p.nama : akhir ? 'Berakhir' : '\u00A0'}
                        </span>
                      )
                    }
                    const telat = !b.x.t.selesai && key > (b.x.t.tenggat || b.x.awal)
                    return (
                      <span
                        key={b.k}
                        className={`kal-chip${b.x.t.selesai ? ' done' : ''}${telat ? ' late' : ''}`}
                        title={b.x.t.nama}
                      >
                        {b.x.t.nama}
                      </span>
                    )
                  })}
                  {baris.length > 3 && <span className="kalender-more">+{baris.length - 3} lagi</span>}
                </button>
              )
            })}
          </div>
        </div>

        <aside className="kalender-card kalender-agenda">
          <div className="agenda-heading">
            <div>
              <h2>Agenda</h2>
              <p>{formatTanggal(dipilih)}</p>
            </div>
          </div>

          {isiAgenda}
        </aside>
      </section>

      {popup && (
        <div className="kalender-overlay" onMouseDown={() => setPopup(false)}>
          <section
            className="kalender-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span className="detail-label">AGENDA</span>
                <h2 id="popup-title">{formatTanggal(dipilih)}</h2>
              </div>
              <button className="modal-close" onClick={() => setPopup(false)}>×</button>
            </div>

            {isiAgenda}

            <div className="form-actions">
              <button className="btn-batal" onClick={() => setPopup(false)}>Tutup</button>
              {programSaya.length > 0 && (
                <button
                  className="kalender-add"
                  onClick={() => {
                    setPopup(false)
                    setShowForm(true)
                  }}
                >
                  + Tambah Tugas
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      {showForm && programSaya.length > 0 && (
        <div className="kalender-overlay" onMouseDown={() => setShowForm(false)}>
          <section
            className="kalender-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tugas-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <h2 id="tugas-title">Tambah Tugas</h2>
                <p>Tugas akan tampil di kalender dan tidak berakhir sebelum ditandai selesai.</p>
              </div>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <TugasForm
              programs={programSaya}
              defaultMulai={dipilih}
              defaultTenggat={dipilih}
              onCancel={() => setShowForm(false)}
              onSubmit={(data) => {
                onAddTugas(data)
                setShowForm(false)
              }}
            />
          </section>
        </div>
      )}
    </div>
  )
}
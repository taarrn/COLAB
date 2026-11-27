import { useMemo, useState } from 'react'
import './KalenderKegiatan.css'
import TugasForm from '../components/TugasForm'
import { Icon, Modal, PageHead } from '../components/ui'
import {
  anggotaById,
  faseProgram,
  formatTanggal,
  hariIniKey,
  keyTanggal,
  rentangTugas,
  toneOf,
} from '../data'
import type { Anggota, Program, Tone, Tugas, TugasInput } from '../data'
import type { Akses } from '../org'

interface Props {
  programs: Program[]
  tugas: Tugas[]
  user: Anggota
  akses: Akses
  onAddTugas: (data: TugasInput) => void
  onToggleTugas: (id: number) => void
}

const namaBulan = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
const hari = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export default function KalenderKegiatan({ programs, tugas, akses, onAddTugas, onToggleTugas }: Props) {
  const hariIni = hariIniKey()
  const sekarang = new Date()
  const [bulan, setBulan] = useState(sekarang.getMonth())
  const [tahun, setTahun] = useState(sekarang.getFullYear())
  const [dipilih, setDipilih] = useState(hariIni)
  const [showForm, setShowForm] = useState(false)
  const [popup, setPopup] = useState(false) // popup agenda saat tanggal diklik

  // Hanya PJ program yang boleh menambah tugas ke kalender
  const programSaya = programs.filter((p) => akses.kelolaTugas(p))
  const bolehDone = (t: Tugas) => akses.tandaiTugas(t.anggotaId, programs.find((p) => p.id === t.programId))

  const namaProgram = (id: number) => programs.find((p) => p.id === id)?.nama ?? 'Program dihapus'
  const toneTugas = (t: Tugas): Tone => {
    const p = programs.find((x) => x.id === t.programId)
    return p ? toneOf(p.departemen) : 'lilac'
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
          <Icon name="calendar" size={26} />
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
              <div className={`agenda-card tone-${toneOf(p.departemen)}`} key={p.id}>
                <span className="agenda-stripe" />
                <div className="agenda-body">
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
              <div className={`agenda-card tone-${toneTugas(t)}${t.selesai ? ' selesai' : ''}`} key={t.id}>
                <span className="agenda-stripe" />
                <div className="agenda-body">
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
                  title={bolehDone(t) ? undefined : 'Hanya yang ditugaskan atau pengurus berwenang yang bisa menandai'}
                >
                  {t.selesai ? 'Selesai' : 'Done'}
                </button>
              </div>
            )
          })}
        </>
      )}
    </>
  )

  return (
    <>
      <PageHead eyebrow="Kalender" title="Kalender Kegiatan" sticker={`${tugasBulanIni} tugas bulan ini`}>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={programSaya.length === 0}
          title={programSaya.length === 0 ? 'Kamu belum punya wewenang membagi tugas di program mana pun' : undefined}
        >
          <Icon name="plus" size={16} /> Tambah tugas
        </button>
      </PageHead>

      <section className="cal-layout">
        <div className="panel cal">
          <div className="cal-head">
            <div>
              <h2>
                {namaBulan[bulan]} <span>{tahun}</span>
              </h2>
              <p>
                {programBulanIni} program · {tugasBulanIni} tugas bulan ini
              </p>
            </div>
            <div className="cal-nav">
              <button className="icon-btn" aria-label="Bulan sebelumnya" onClick={() => ubahBulan(-1)}>
                <Icon name="left" size={18} />
              </button>
              <button
                className="btn btn-ghost btn-small"
                onClick={() => {
                  setBulan(sekarang.getMonth())
                  setTahun(sekarang.getFullYear())
                  setDipilih(hariIni)
                }}
              >
                Hari ini
              </button>
              <button className="icon-btn" aria-label="Bulan berikutnya" onClick={() => ubahBulan(1)}>
                <Icon name="right" size={18} />
              </button>
            </div>
          </div>

          <div className="cal-legend">
            <span><i className="lg-program" /> Program kerja</span>
            <span><i className="lg-tugas" /> Tugas</span>
            <span><i className="lg-done" /> Selesai</span>
            <span><i className="lg-late" /> Terlambat</span>
          </div>

          <div className="cal-grid">
            {hari.map((n) => (
              <div className="cal-weekday" key={n}>{n}</div>
            ))}

            {grid.map((n, i) => {
              if (n === null) return <div className="cal-day kosong" key={`k-${i}`} />
              const key = keyHari(n)
              const progs = programPadaTanggal(key)
              const tgs = tugasPadaTanggal(key)
              // Program tampil sebagai garis tipis, tugas maksimal 2 baris, sisanya "+N lagi"
              const tampilTugas = tgs.slice(0, 2)
              const baris = [
                ...progs.map((p) => ({ k: `p${p.id}`, jenis: 'program' as const, p })),
                ...tampilTugas.map((x) => ({ k: `t${x.t.id}`, jenis: 'tugas' as const, x })),
              ]
              return (
                <button
                  key={key}
                  className={`cal-day${dipilih === key ? ' dipilih' : ''}`}
                  onClick={() => {
                    setDipilih(key)
                    setPopup(true)
                  }}
                >
                  <span className={`cal-date${key === hariIni ? ' hari-ini' : ''}`}>{n}</span>
                  {baris.map((b) => {
                    if (b.jenis === 'program') {
                      const awal = key === b.p.mulai
                      const akhir = key === b.p.selesai
                      return (
                        <span
                          key={b.k}
                          className={`cal-bar tone-${toneOf(b.p.departemen)}${awal ? ' awal' : ''}${akhir ? ' akhir' : ''}`}
                          title={b.p.nama}
                        >
                        </span>
                      )
                    }
                    const telat = !b.x.t.selesai && key > (b.x.t.tenggat || b.x.awal)
                    return (
                      <span
                        key={b.k}
                        className={`cal-chip${b.x.t.selesai ? ' done' : ''}${telat ? ' late' : ''}`}
                        title={b.x.t.nama}
                      >
                        {b.x.t.nama}
                      </span>
                    )
                  })}
                  {tgs.length > 2 && <span className="cal-more">+{tgs.length - 2} lagi</span>}
                </button>
              )
            })}
          </div>
        </div>

        <aside className="panel agenda">
          <div className="agenda-heading">
            <span className="oval oval-sm">Agenda</span>
            <h2>{formatTanggal(dipilih)}</h2>
          </div>

          {isiAgenda}
        </aside>
      </section>

      {popup && (
        <Modal title={formatTanggal(dipilih)} eyebrow="Agenda" onClose={() => setPopup(false)}>
          {isiAgenda}

          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setPopup(false)}>Tutup</button>
            {programSaya.length > 0 && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setPopup(false)
                  setShowForm(true)
                }}
              >
                <Icon name="plus" size={16} /> Tambah tugas
              </button>
            )}
          </div>
        </Modal>
      )}

      {showForm && programSaya.length > 0 && (
        <Modal
          title="Tambah tugas"
          eyebrow="Tugas baru"
          subtitle="Tugas akan tampil di kalender dan tidak berakhir sebelum ditandai selesai."
          onClose={() => setShowForm(false)}
        >
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
        </Modal>
      )}
    </>
  )
}

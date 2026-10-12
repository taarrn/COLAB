import type { Program, Tugas } from '../data'
import { hitungProgres, toneOf } from '../data'
import type { Page } from '../components/Sidebar'

interface Props {
  programs: Program[]
  tugas: Tugas[]
  onNavigate: (page: Page) => void
}

const pad = (n: number) => String(n).padStart(2, '0')

const prioritasClass = { Tinggi: 'high', Sedang: 'medium', Rendah: 'low' } as const

export default function Dashboard({ programs, tugas, onNavigate }: Props) {
  const hasil = programs.map((p) => ({ program: p, ...hitungProgres(p.id, tugas) }))
  const rataRata = hasil.length
    ? Math.round(hasil.reduce((sum, h) => sum + h.progres, 0) / hasil.length)
    : 0
  const tugasBerjalan = tugas.filter((t) => !t.selesai).length

  return (
    <>
      <header className="topbar">
        <div>
          <p className="breadcrumb">Menu Utama / Dashboard</p>
          <h1>Dashboard</h1>
        </div>
        <div className="date-label">📅 Tahun 2026</div>
      </header>

      <section className="welcome">
        <div>
          <p className="welcome-label">ORGANIZATION WORKSPACE</p>
          <h2>Halo, Pengurus! 👋</h2>
          <p>
            Kelola program kerja dan kolaborasi tim organisasi dalam satu tempat.
          </p>
        </div>
        <div className="welcome-decoration">K</div>
      </section>

      <section className="stats">
        <div className="stat-card">
          <div className="stat-top">
            <span>Total Program Kerja</span>
            <span className="stat-icon purple">▤</span>
          </div>
          <h3>{pad(programs.length)}</h3>
          <p>Program kerja terdaftar</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Tugas Berjalan</span>
            <span className="stat-icon orange">☷</span>
          </div>
          <h3>{pad(tugasBerjalan)}</h3>
          <p>Tugas perlu diselesaikan</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Kegiatan Mendatang</span>
            <span className="stat-icon blue">▦</span>
          </div>
          <h3>04</h3>
          <p>Agenda yang akan datang</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Progres Keseluruhan</span>
            <span className="stat-icon green">↗</span>
          </div>
          <h3>{rataRata}%</h3>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${rataRata}%` }} />
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Program Kerja</h3>
              <p>Pantau perkembangan program kerja organisasi.</p>
            </div>
            <button className="text-button" onClick={() => onNavigate('program')}>
              Lihat semua →
            </button>
          </div>

          {hasil.slice(0, 3).map(({ program: p, progres }, i) => {
            const tone = toneOf(p.departemen)
            return (
              <div className="program-item" key={p.id}>
                <div className={`program-icon ${tone}`}>{pad(i + 1)}</div>
                <div className="program-info">
                  <strong>{p.nama}</strong>
                  <p>{p.departemen}</p>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${tone}-fill`}
                      style={{ width: `${progres}%` }}
                    />
                  </div>
                </div>
                <span className={`status status-${tone}`}>{progres}%</span>
              </div>
            )
          })}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Tugas Terbaru</h3>
              <p>Daftar tugas yang perlu diperhatikan.</p>
            </div>
            <button className="text-button" onClick={() => onNavigate('tugas')}>
              Lihat semua →
            </button>
          </div>

          {tugas.length === 0 && <p className="panel-empty">Belum ada tugas.</p>}

          {tugas.slice(0, 3).map((t) => (
            <div className="task-item" key={t.id}>
              <span className={t.selesai ? 'task-check' : 'task-check empty'}>
                {t.selesai ? '✓' : ''}
              </span>
              <div className="task-info">
                <strong>{t.nama}</strong>
                <p>{programs.find((p) => p.id === t.programId)?.nama ?? 'Program dihapus'}</p>
              </div>
              <span className={`priority ${prioritasClass[t.prioritas]}`}>{t.prioritas}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
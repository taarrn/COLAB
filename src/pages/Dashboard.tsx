import type { Program } from '../data'
import { toneOf } from '../data'
import type { Page } from '../components/Sidebar'

interface Props {
  programs: Program[]
  onNavigate: (page: Page) => void
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function Dashboard({ programs, onNavigate }: Props) {
  const rataRata = programs.length
    ? Math.round(programs.reduce((sum, p) => sum + p.progres, 0) / programs.length)
    : 0

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
          <h3>08</h3>
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

          {programs.slice(0, 3).map((p, i) => {
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
                      style={{ width: `${p.progres}%` }}
                    />
                  </div>
                </div>
                <span className={`status status-${tone}`}>{p.progres}%</span>
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
            <button className="text-button">Lihat semua →</button>
          </div>

          <div className="task-item">
            <span className="task-check">✓</span>
            <div className="task-info">
              <strong>Menyusun proposal kegiatan</strong>
              <p>Informatika Menyapa</p>
            </div>
            <span className="priority high">Tinggi</span>
          </div>

          <div className="task-item">
            <span className="task-check empty"></span>
            <div className="task-info">
              <strong>Menghubungi pemateri</strong>
              <p>Pelatihan Internal</p>
            </div>
            <span className="priority medium">Sedang</span>
          </div>

          <div className="task-item">
            <span className="task-check empty"></span>
            <div className="task-info">
              <strong>Menyiapkan desain poster</strong>
              <p>Dies Natalis Informatika</p>
            </div>
            <span className="priority low">Rendah</span>
          </div>
        </div>
      </section>
    </>
  )
}
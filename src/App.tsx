import './App.css'

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">K</div>
          <span>KOLAB</span>
        </div>

        <div className="menu-label">MENU UTAMA</div>

        <nav className="menu">
          <a href="#" className="menu-item active">
            <span>▦</span> Dashboard
          </a>
          <a href="#" className="menu-item">
            <span>▤</span> Program Kerja
          </a>
          <a href="#" className="menu-item">
            <span>☷</span> Manajemen Tugas
          </a>
          <a href="#" className="menu-item">
            <span>▦</span> Kalender Kegiatan
          </a>
          <a href="#" className="menu-item">
            <span>▥</span> Laporan Progres
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-avatar">A</div>
          <div>
            <strong>Admin Organisasi</strong>
            <p>Pengurus HMIF</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
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
              Kelola program kerja dan kolaborasi tim organisasi
              dalam satu tempat.
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
            <h3>12</h3>
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
            <h3>75%</h3>
            <div className="progress-track">
              <div className="progress-fill" />
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
              <button className="text-button">Lihat semua →</button>
            </div>

            <div className="program-item">
              <div className="program-icon purple">01</div>
              <div className="program-info">
                <strong>Informatika Menyapa</strong>
                <p>Departemen Sosial Masyarakat</p>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: '80%' }} />
                </div>
              </div>
              <span className="status status-green">80%</span>
            </div>

            <div className="program-item">
              <div className="program-icon orange">02</div>
              <div className="program-info">
                <strong>Pelatihan Internal</strong>
                <p>Departemen Pendidikan</p>
                <div className="progress-track">
                  <div className="progress-fill orange-fill" style={{ width: '55%' }} />
                </div>
              </div>
              <span className="status status-orange">55%</span>
            </div>

            <div className="program-item">
              <div className="program-icon blue">03</div>
              <div className="program-info">
                <strong>Dies Natalis Informatika</strong>
                <p>Departemen Minat dan Bakat</p>
                <div className="progress-track">
                  <div className="progress-fill blue-fill" style={{ width: '30%' }} />
                </div>
              </div>
              <span className="status status-blue">30%</span>
            </div>
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

        <footer className="footer">
          KOLAB © 2026 — Kolaborasi lebih terarah, organisasi lebih produktif.
        </footer>
      </main>
    </div>
  )
}

export default App

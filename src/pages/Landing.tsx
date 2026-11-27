import { useState } from 'react'
import './Landing.css'
import Intro from '../components/Intro'
import { Icon, Meter } from '../components/ui'
import type { IconName } from '../components/ui'
import type { Tone } from '../data'

interface Props {
  onEnter: () => void
}

const fitur: { icon: IconName; tone: Tone; judul: string; teks: string }[] = [
  {
    icon: 'folder',
    tone: 'red',
    judul: 'Program Kerja',
    teks: 'Catat program per departemen lengkap dengan jadwal, penanggung jawab, dan status yang dihitung otomatis dari tugas.',
  },
  {
    icon: 'check',
    tone: 'blue',
    judul: 'Manajemen Tugas',
    teks: 'Bagikan tugas ke anggota, atur prioritas dan bobot, lalu tandai selesai. Progres program ikut terhitung.',
  },
  {
    icon: 'calendar',
    tone: 'lilac',
    judul: 'Kalender Kegiatan',
    teks: 'Lihat program dan tenggat tugas dalam satu kalender bulanan, lengkap dengan agenda di tiap tanggal.',
  },
  {
    icon: 'chart',
    tone: 'mint',
    judul: 'Laporan Progres',
    teks: 'Ringkasan progres per departemen dan anggota, tugas terlambat, siap diunduh sebagai CSV atau dicetak.',
  },
]

const langkah = [
  { judul: 'Buat program kerja', teks: 'Isi nama, departemen, jadwal, dan tentukan penanggung jawabnya.' },
  { judul: 'Bagikan tugas', teks: 'Penanggung jawab membagi tugas ke anggota dan mengatur bobotnya.' },
  { judul: 'Pantau dan laporkan', teks: 'Progres terhitung otomatis. Laporan siap dilihat, diunduh, atau dicetak.' },
]

// Intro hanya tampil sekali per sesi tab
const sudahIntro = () => {
  try {
    return sessionStorage.getItem('kolab-intro') === '1'
  } catch {
    return false
  }
}

export default function Landing({ onEnter }: Props) {
  const [tampilIntro, setTampilIntro] = useState(() => !sudahIntro())
  const [siap, setSiap] = useState(() => sudahIntro()) // landing mulai beranimasi saat tirai naik

  const selesaiIntro = () => {
    try {
      sessionStorage.setItem('kolab-intro', '1')
    } catch {
      /* abaikan jika penyimpanan diblokir */
    }
    setTampilIntro(false)
  }

  return (
    <div className={`ld${siap ? ' ld-ready' : ''}`}>
      {tampilIntro && <Intro onReveal={() => setSiap(true)} onDone={selesaiIntro} />}

      <header className="ld-nav">
        <div className="ld-wrap ld-nav-in">
          <a className="ld-brand" href="#atas" aria-label="KOLAB">
            <span className="brand-mark">K</span>
            <span className="brand-name">Kolab</span>
          </a>
          <nav className="ld-links" aria-label="Bagian halaman">
            <a href="#fitur">Fitur</a>
            <a href="#cara">Cara kerja</a>
            <a href="#peran">Peran</a>
          </nav>
          <button className="btn btn-primary" onClick={onEnter}>
            Masuk
          </button>
        </div>
      </header>

      <main id="atas">
        {/* ---------- Hero ---------- */}
        <section className="ld-wrap ld-hero">
          <div className="ld-hero-text">
            <span className="oval">Untuk organisasi mahasiswa</span>
            <h1>
              Program kerja <em>tertata</em>, dari rencana sampai laporan.
            </h1>
            <p>
              KOLAB membantu pengurus membagi tugas, memantau progres, dan menyiapkan laporan kegiatan
              di satu tempat, tanpa lembar catatan yang tercecer.
            </p>
            <div className="ld-cta">
              <button className="btn btn-primary ld-big" onClick={onEnter}>
                Buka aplikasi <Icon name="arrow" size={17} />
              </button>
              <a className="btn btn-ghost ld-big" href="#fitur">
                Lihat fitur
              </a>
            </div>
            <p className="ld-note">Tanpa akun. Data tersimpan di browser perangkatmu.</p>
          </div>

          {/* Pratinjau aplikasi */}
          <div className="ld-preview" aria-hidden="true">
            <div className="ld-window">
              <div className="ld-window-bar">
                <span className="ld-win-title">Beranda</span>
                <span className="ld-win-pill">Nov 2026</span>
              </div>

              <div className="ld-window-body">
                <p className="ld-mini-label">Progres keseluruhan</p>
                <div className="ld-mini-number">
                  62<span>%</span>
                </div>
                <Meter value={62} label="Contoh progres" />

                <ul className="ld-mini-list">
                  <li className="tone-red">
                    <div>
                      <strong>Informatika Menyapa</strong>
                      <span className="badge">Sosial Masyarakat</span>
                    </div>
                    <Meter value={80} tone="red" label="Contoh 80 persen" />
                    <b>80%</b>
                  </li>
                  <li className="tone-blue">
                    <div>
                      <strong>Pelatihan Internal</strong>
                      <span className="badge">Pendidikan</span>
                    </div>
                    <Meter value={40} tone="blue" label="Contoh 40 persen" />
                    <b>40%</b>
                  </li>
                  <li className="tone-lilac">
                    <div>
                      <strong>Dies Natalis</strong>
                      <span className="badge">Minat dan Bakat</span>
                    </div>
                    <Meter value={35} tone="lilac" label="Contoh 35 persen" />
                    <b>35%</b>
                  </li>
                </ul>
              </div>
            </div>

            <div className="ld-float">
              <span className="ld-float-date">
                <b>15</b>
                <i>Nov</i>
              </span>
              <div>
                <strong>Menyusun laporan kegiatan</strong>
                <small>Tenggat minggu ini</small>
              </div>
              <span className="prio high">Tinggi</span>
            </div>
          </div>
        </section>

        {/* ---------- Fitur ---------- */}
        <section className="ld-wrap ld-section" id="fitur">
          <div className="ld-head">
            <span className="oval">Fitur</span>
            <h2>Satu tempat untuk seluruh program kerja</h2>
            <p>Empat bagian yang saling terhubung, jadi data yang kamu isi sekali langsung terpakai di mana-mana.</p>
          </div>

          <div className="ld-features">
            {fitur.map((f) => (
              <article className={`panel ld-feature tone-${f.tone}`} key={f.judul}>
                <span className="ld-feature-icon">
                  <Icon name={f.icon} size={22} />
                </span>
                <h3>{f.judul}</h3>
                <p>{f.teks}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Cara kerja ---------- */}
        <section className="ld-wrap ld-section" id="cara">
          <div className="ld-head">
            <span className="oval">Cara kerja</span>
            <h2>Tiga langkah, tanpa pengaturan rumit</h2>
          </div>

          <ol className="ld-steps">
            {langkah.map((l, i) => (
              <li className="panel" key={l.judul}>
                <span className="ld-step-no">{String(i + 1).padStart(2, '0')}</span>
                <h3>{l.judul}</h3>
                <p>{l.teks}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Peran ---------- */}
        <section className="ld-wrap ld-section" id="peran">
          <div className="ld-head">
            <span className="oval">Peran</span>
            <h2>Hak akses yang jelas untuk tiap anggota</h2>
            <p>Supaya data program tidak berubah sembarangan, kewenangan dibedakan berdasarkan peran.</p>
          </div>

          <div className="ld-roles">
            <article className="panel ld-role">
              <span className="role-tag core">Penanggung jawab</span>
              <ul>
                <li>Menambah, mengubah, dan menghapus program kerja miliknya</li>
                <li>Membagikan tugas ke anggota dan mengatur bobotnya</li>
                <li>Menandai tugas selesai untuk seluruh programnya</li>
              </ul>
            </article>
            <article className="panel ld-role">
              <span className="role-tag helper">Anggota</span>
              <ul>
                <li>Melihat seluruh program, tugas, dan kalender kegiatan</li>
                <li>Menandai selesai tugas yang diberikan kepadanya</li>
                <li>Memantau progres dan laporan organisasi</li>
              </ul>
            </article>
          </div>
        </section>

        {/* ---------- Ajakan ---------- */}
        <section className="ld-wrap ld-section">
          <div className="ld-banner">
            <div>
              <h2>Siap merapikan program kerja organisasimu?</h2>
              <p>Mulai dari program pertama, progresnya langsung terpantau.</p>
            </div>
            <button className="btn ld-banner-btn" onClick={onEnter}>
              Buka aplikasi <Icon name="arrow" size={17} />
            </button>
          </div>
        </section>
      </main>

      <footer className="ld-footer">
        <div className="ld-wrap">
          <span className="ld-brand">
            <span className="brand-mark">K</span>
            <span className="brand-name">Kolab</span>
          </span>
          <p>KOLAB © 2026 · Kolaborasi lebih terarah, organisasi lebih produktif.</p>
        </div>
      </footer>
    </div>
  )
}

import './Dashboard.css'
import type { Anggota, Program, Tugas } from '../data'
import { hariIniKey, hitungProgres, keyTanggal, toneOf } from '../data'
import type { Page } from '../components/Sidebar'
import { Icon, Meter, PageHead } from '../components/ui'

interface Props {
  programs: Program[]
  tugas: Tugas[]
  user: Anggota
  onNavigate: (page: Page) => void
}

const pad = (n: number) => String(n).padStart(2, '0')
const prioritasClass = { Tinggi: 'high', Sedang: 'medium', Rendah: 'low' } as const

// Berapa hari ke depan yang dihitung sebagai "mendatang"
const JENDELA_HARI = 14

export default function Dashboard({ programs, tugas, user, onNavigate }: Props) {
  const hariIni = hariIniKey()
  const batas = new Date()
  batas.setDate(batas.getDate() + JENDELA_HARI)
  const batasKey = keyTanggal(batas)

  const hasil = programs.map((p) => ({ program: p, ...hitungProgres(p.id, tugas) }))
  const rataRata = hasil.length
    ? Math.round(hasil.reduce((sum, h) => sum + h.progres, 0) / hasil.length)
    : 0
  const tugasBerjalan = tugas.filter((t) => !t.selesai).length
  const tugasMendatang = tugas.filter(
    (t) => !t.selesai && t.tenggat && t.tenggat >= hariIni && t.tenggat <= batasKey,
  ).length

  const tanggalLabel = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const namaDepan = user.nama.split(' ')[0]
  const namaProgram = (id: number) => programs.find((p) => p.id === id)?.nama ?? 'Program dihapus'

  return (
    <>
      <PageHead
        eyebrow={tanggalLabel}
        title={`Halo, ${namaDepan}`}
        sticker={tugasBerjalan === 0 ? 'semua tugas beres' : `${tugasBerjalan} tugas menunggu`}
      />

      <div className="home-grid">
        <section className="panel hero">
          <p className="hero-label">Progres keseluruhan</p>
          <div className="hero-number" aria-label={`${rataRata} persen`}>
            {rataRata}
            <span>%</span>
          </div>
          <Meter value={rataRata} label="Progres keseluruhan" />

          <dl className="hero-facts">
            <div>
              <dt>Program kerja</dt>
              <dd>{pad(programs.length)}</dd>
            </div>
            <div>
              <dt>Tugas berjalan</dt>
              <dd>{pad(tugasBerjalan)}</dd>
            </div>
            <div>
              <dt>Tenggat {JENDELA_HARI} hari</dt>
              <dd>{pad(tugasMendatang)}</dd>
            </div>
          </dl>
        </section>

        <section className="panel home-tasks">
          <div className="panel-head">
            <div>
              <h3>Tugas terbaru</h3>
              <p>Yang paling baru ditambahkan.</p>
            </div>
            <button className="link-btn" onClick={() => onNavigate('tugas')}>
              Semua <Icon name="arrow" size={15} />
            </button>
          </div>

          {tugas.length === 0 && <p className="home-empty">Belum ada tugas.</p>}

          <ul className="mini-list">
            {tugas.slice(0, 4).map((t) => {
              const telat = !t.selesai && !!t.tenggat && t.tenggat < hariIni
              const tgl = t.tenggat ? new Date(t.tenggat + 'T00:00:00') : null
              return (
                <li key={t.id} className={t.selesai ? 'is-done' : ''}>
                  <time className={`date-tile${telat ? ' late' : ''}`}>
                    {tgl ? (
                      <>
                        <b>{tgl.getDate()}</b>
                        <i>{tgl.toLocaleDateString('id-ID', { month: 'short' })}</i>
                      </>
                    ) : (
                      <b>–</b>
                    )}
                  </time>
                  <div className="mini-main">
                    <strong>{t.nama}</strong>
                    <p>{namaProgram(t.programId)}</p>
                  </div>
                  <span className={`prio ${prioritasClass[t.prioritas]}`}>{t.prioritas}</span>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="panel home-programs">
          <div className="panel-head">
            <div>
              <h3>Program kerja</h3>
              <p>Pantau perkembangan tiap program.</p>
            </div>
            <button className="link-btn" onClick={() => onNavigate('program')}>
              Lihat semua <Icon name="arrow" size={15} />
            </button>
          </div>

          {hasil.length === 0 && <p className="home-empty">Belum ada program kerja.</p>}

          <ol className="prog-list">
            {hasil.slice(0, 5).map(({ program: p, progres }, i) => {
              const tone = toneOf(p.departemen)
              return (
                <li key={p.id} className={`tone-${tone}`}>
                  <span className="prog-index">{pad(i + 1)}</span>
                  <div className="prog-main">
                    <strong>{p.nama}</strong>
                    <span className="badge">{p.departemen.replace('Departemen ', '')}</span>
                  </div>
                  <div className="prog-meter">
                    <Meter value={progres} tone={tone} label={`Progres ${p.nama}`} />
                  </div>
                  <span className="pct">{progres}%</span>
                </li>
              )
            })}
          </ol>
        </section>
      </div>
    </>
  )
}

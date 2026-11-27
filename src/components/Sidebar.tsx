import { singkatDivisi, toneOf } from '../data'
import type { Anggota } from '../data'
import { Avatar, Icon } from './ui'
import type { IconName } from './ui'

export type Page = 'dashboard' | 'program' | 'tugas' | 'kalender' | 'laporan' | 'anggota' | 'pengaturan'

const items: { label: string; page: Page; icon: IconName }[] = [
  { label: 'Beranda', page: 'dashboard', icon: 'home' },
  { label: 'Program', page: 'program', icon: 'folder' },
  { label: 'Tugas', page: 'tugas', icon: 'check' },
  { label: 'Kalender', page: 'kalender', icon: 'calendar' },
  { label: 'Laporan', page: 'laporan', icon: 'chart' },
  { label: 'Anggota', page: 'anggota', icon: 'users' },
]

interface Props {
  page: Page
  onNavigate: (page: Page) => void
  user: Anggota // identitas akun di organisasi aktif
  namaOrg: string
  jumlahOrg: number
  bolehLaporan: boolean
  menunggu: number // permintaan bergabung yang perlu diputuskan
  onBukaOrg: () => void
  onBukaAkun: () => void
}

export default function Sidebar({ page, onNavigate, user, namaOrg, jumlahOrg, bolehLaporan, menunggu, onBukaOrg, onBukaAkun }: Props) {
  const tampil = items.filter((i) => i.page !== 'laporan' || bolehLaporan)

  return (
    <aside className="sidebar">
      <div className="traffic" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="brand">
        <div className="brand-mark">K</div>
        <span className="brand-name">Kolab</span>
      </div>

      <button className="org-switch" onClick={onBukaOrg} aria-label="Ganti organisasi">
        <span className="org-switch-text">
          <small>Organisasi</small>
          <strong>{namaOrg}</strong>
          <em>{user.jabatan ?? 'Anggota'}{user.divisi ? ` · ${singkatDivisi(user.divisi)}` : ''}</em>
        </span>
        <span className="org-switch-icon" title={`${jumlahOrg} organisasi`}>
          <Icon name="swap" size={16} />
        </span>
      </button>

      <div className="menu-label">Menu</div>

      <nav className="menu" aria-label="Menu utama">
        {tampil.map((item) => {
          const active = item.page === page || (item.page === 'anggota' && page === 'pengaturan')
          return (
            <a
              key={item.page}
              href="#"
              className={`menu-item${active ? ' active' : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault()
                onNavigate(item.page)
              }}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.page === 'anggota' && menunggu > 0 && <i className="menu-dot">{menunggu}</i>}
            </a>
          )
        })}
      </nav>

      <button className="sidebar-bottom account-btn" onClick={onBukaAkun} aria-label="Profil dan akun">
        <Avatar nama={user.nama} tone={toneOf(user.divisi)} size={34} />
        <span className="user-info">
          <strong>{user.nama}</strong>
          <p>Profil dan akun</p>
        </span>
      </button>
    </aside>
  )
}

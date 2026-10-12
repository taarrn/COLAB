import { daftarAnggota, singkatDivisi } from '../data'
import type { Anggota } from '../data'

export type Page = 'dashboard' | 'program' | 'tugas' | 'kalender'

interface MenuItem {
  label: string
  icon: string
  page?: Page // menu tanpa page berarti halamannya belum dibuat
}

const items: MenuItem[] = [
  { label: 'Dashboard', icon: '▦', page: 'dashboard' },
  { label: 'Program Kerja', icon: '▤', page: 'program' },
  { label: 'Manajemen Tugas', icon: '☷', page: 'tugas' },
  { label: 'Kalender Kegiatan', icon: '▦', page: 'kalender' },
  { label: 'Laporan Progres', icon: '▥' },
]

interface Props {
  page: Page
  onNavigate: (page: Page) => void
  user: Anggota
  onChangeUser: (id: number) => void
}

export default function Sidebar({ page, onNavigate, user, onChangeUser }: Props) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">K</div>
        <span>KOLAB</span>
      </div>

      <div className="menu-label">MENU UTAMA</div>

      <nav className="menu">
        {items.map((item) => {
          const active = item.page === page
          return (
            <a
              key={item.label}
              href="#"
              className={`menu-item${active ? ' active' : ''}${item.page ? '' : ' soon'}`}
              aria-current={active ? 'page' : undefined}
              title={item.page ? undefined : 'Segera hadir'}
              onClick={(e) => {
                e.preventDefault()
                if (item.page) onNavigate(item.page)
              }}
            >
              <span>{item.icon}</span> {item.label}
            </a>
          )
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="profile-avatar">{user.nama.charAt(0)}</div>
        <div className="user-info">
          <label htmlFor="user-select">Masuk sebagai</label>
          <select
            id="user-select"
            value={user.id}
            onChange={(e) => onChangeUser(Number(e.target.value))}
          >
            {daftarAnggota.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nama}
              </option>
            ))}
          </select>
          <p>{singkatDivisi(user.divisi)}</p>
        </div>
      </div>
    </aside>
  )
}
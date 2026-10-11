export type Page = 'dashboard' | 'program'

interface MenuItem {
  label: string
  icon: string
  page?: Page // menu tanpa page berarti halamannya belum dibuat
}

const items: MenuItem[] = [
  { label: 'Dashboard', icon: '▦', page: 'dashboard' },
  { label: 'Program Kerja', icon: '▤', page: 'program' },
  { label: 'Manajemen Tugas', icon: '☷' },
  { label: 'Kalender Kegiatan', icon: '▦' },
  { label: 'Laporan Progres', icon: '▥' },
]

interface Props {
  page: Page
  onNavigate: (page: Page) => void
}

export default function Sidebar({ page, onNavigate }: Props) {
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
        <div className="profile-avatar">A</div>
        <div>
          <strong>Admin Organisasi</strong>
          <p>Pengurus HMIF</p>
        </div>
      </div>
    </aside>
  )
}
import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import type { Tone } from '../data'

/* ---------- Ikon: satu keluarga, garis 1.6, ujung membulat ---------- */

const paths = {
  home: (
    <>
      <path d="M4 10.8 12 4l8 6.8" />
      <path d="M6 9.6V19a1 1 0 0 0 1 1h3.5v-5.5h3V20H17a1 1 0 0 0 1-1V9.6" />
    </>
  ),
  folder: (
    <path d="M3.5 8a2 2 0 0 1 2-2h3.6l1.9 2.2h7.5a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.4 12.2 2.5 2.5 4.7-5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3.5" />
      <path d="M3.5 10h17M8 3.5v3M16 3.5v3" />
    </>
  ),
  chart: (
    <>
      <path d="M5 20v-7M12 20V5M19 20v-10" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  left: <path d="m14.5 6-6 6 6 6" />,
  right: <path d="m9.5 6 6 6-6 6" />,
  arrow: <path d="M5 12h14m-5.5-5.5L19 12l-5.5 5.5" />,
  edit: (
    <>
      <path d="M4.5 19.5 5 15.8 15.7 5.1a1.8 1.8 0 0 1 2.5 0l.7.7a1.8 1.8 0 0 1 0 2.5L8.2 19z" />
      <path d="m13.8 7 3.2 3.2" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 7h15M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2" />
      <path d="M6.5 7l.8 11.2a1.5 1.5 0 0 0 1.5 1.3h6.4a1.5 1.5 0 0 0 1.5-1.3L17.5 7" />
    </>
  ),
  close: <path d="m6.5 6.5 11 11m0-11-11 11" />,
  download: (
    <>
      <path d="M12 4v11m-4.5-4.5L12 15l4.5-4.5" />
      <path d="M5 19.5h14" />
    </>
  ),
  print: (
    <>
      <path d="M7 9V4.5h10V9" />
      <rect x="4" y="9" width="16" height="8" rx="2.2" />
      <path d="M7 14h10v5.5H7z" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 3.2 19h17.6z" />
      <path d="M12 10v4.2M12 16.6v.1" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="9" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M15.5 6.2a3 3 0 0 1 0 5.6M17 14.2a5.4 5.4 0 0 1 3.5 4.8" />
    </>
  ),
  swap: (
    <>
      <path d="M5 8.5h13m-3.5-3.5 3.5 3.5-3.5 3.5" />
      <path d="M19 15.5H6m3.5-3.5L6 15.5l3.5 3.5" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
      <path d="m4.5 8 7.5 5.5L19.5 8" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" />
    </>
  ),
  up: <path d="m6.5 14.5 5.5-5.5 5.5 5.5" />,
  down: <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
    </>
  ),
} as const

export type IconName = keyof typeof paths

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  )
}

/* Bintang empat sudut, dipakai di stiker */
export function Sparkle({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 1.5c.7 6.2 4.3 9.8 10.5 10.5-6.2.7-9.8 4.3-10.5 10.5C11.3 16.3 7.7 12.7 1.5 12 7.7 11.3 11.3 7.7 12 1.5Z"
      />
    </svg>
  )
}

/* Awan kecil untuk keadaan kosong */
export function Cloud() {
  return (
    <svg viewBox="0 0 120 70" width="96" height="56" aria-hidden="true" focusable="false">
      <path
        fill="#fff"
        stroke="rgba(196,18,28,.35)"
        strokeWidth="1.5"
        d="M30 58a18 18 0 0 1-2-35.9A24 24 0 0 1 73 16a20 20 0 0 1 21 21 14 14 0 0 1-2 21z"
      />
      <path d="M88 8l1.6 4.4 4.4 1.6-4.4 1.6L88 20l-1.6-4.4L82 14l4.4-1.6z" fill="#C4121C" />
    </svg>
  )
}

/* ---------- Kepala halaman: oval kecil, judul serif, stiker lilac ---------- */

interface PageHeadProps {
  eyebrow: string
  title: string
  sticker?: string
  children?: ReactNode // tombol aksi di kanan
}

export function PageHead({ eyebrow, title, sticker, children }: PageHeadProps) {
  return (
    <header className="page-head">
      <div className="page-head-text">
        <span className="oval">{eyebrow}</span>
        <h1>
          <span className="title-word">{title}</span>
          {sticker && (
            <span className="sticker">
              {sticker}
            </span>
          )}
        </h1>
      </div>
      {children && <div className="page-head-actions">{children}</div>}
    </header>
  )
}

/* ---------- Modal bergaya sheet macOS, Escape menutup ---------- */

interface ModalProps {
  title: string
  eyebrow?: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, eyebrow, subtitle, onClose, children }: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="overlay" onMouseDown={onClose}>
      <section
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="sheet-head">
          <div>
            {eyebrow && <span className="oval oval-sm">{eyebrow}</span>}
            <h2 id={titleId}>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Tutup">
            <Icon name="close" size={16} />
          </button>
        </div>
        {children}
      </section>
    </div>,
    document.body,
  )
}

/* ---------- Batang progres tipis. "target" = garis ideal menurut waktu ---------- */

interface MeterProps {
  value: number
  tone?: Tone
  label: string
  target?: number
}

export function Meter({ value, tone, label, target }: MeterProps) {
  return (
    <div
      className={`meter${tone ? ` tone-${tone}` : ''}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <div className="meter-fill" style={{ width: `${value}%` }} />
      {target !== undefined && (
        <span className="meter-tick" style={{ left: `${target}%` }} title={`Target menurut waktu: ${target}%`} />
      )}
    </div>
  )
}

/* ---------- Avatar inisial ---------- */

export function Avatar({ nama, tone, size = 36 }: { nama: string; tone: Tone; size?: number }) {
  return (
    <span
      className={`avatar tone-${tone}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      aria-hidden="true"
    >
      {nama.charAt(0)}
    </span>
  )
}

/* Kartu kosong yang dipakai semua halaman */
export function Empty({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <Cloud />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  )
}

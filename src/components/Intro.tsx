import { useEffect, useRef, useState } from 'react'
import './Intro.css'

interface Props {
  onReveal: () => void // tirai mulai naik, landing boleh mulai beranimasi
  onDone: () => void // tirai selesai, intro dilepas
}

const KATA = 'Kolab'
const MULAI_MS = 700 // jeda sebelum bar mulai terisi
const ISI_MS = 1900 // lama bar terisi
const TIRAI_MS = 850 // lama tirai naik

export default function Intro({ onReveal, onDone }: Props) {
  const [persen, setPersen] = useState(0)
  const [keluar, setKeluar] = useState(false)
  const selesai = useRef(false)

  const tutup = () => {
    if (selesai.current) return
    selesai.current = true
    setKeluar(true)
    onReveal()
    window.setTimeout(onDone, TIRAI_MS)
  }

  // Pengguna yang mematikan animasi langsung dilewatkan
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      selesai.current = true
      onReveal()
      onDone()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Hitung naik 0 sampai 100, lalu tirai naik
  useEffect(() => {
    let raf = 0
    let mulai = 0
    const tick = (t: number) => {
      if (!mulai) mulai = t
      const p = Math.min(1, Math.max(0, (t - mulai - MULAI_MS) / ISI_MS))
      const eased = 1 - Math.pow(1 - p, 3)
      setPersen(Math.round(eased * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
      else window.setTimeout(tutup, 380)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Kunci scroll selama intro
  useEffect(() => {
    const awal = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = awal
    }
  }, [])

  return (
    <div className={`intro${keluar ? ' keluar' : ''}`} role="presentation" aria-hidden="true">
      <span className="intro-awan a" />
      <span className="intro-awan b" />
      <span className="intro-awan c" />

      <div className="intro-isi">
        <div className="intro-mark">K</div>

        <div className="intro-kata" aria-label={KATA}>
          {KATA.split('').map((h, i) => (
            <span className="intro-baris" key={i}>
              <span className="intro-huruf" style={{ ['--i' as string]: i }}>
                {h}
              </span>
            </span>
          ))}
        </div>

        <p className="intro-tag">Kolaborasi lebih terarah, organisasi lebih produktif.</p>

        <div className="intro-progres">
          <div className="intro-bar">
            <span style={{ width: `${persen}%` }} />
          </div>
          <b>{persen}%</b>
        </div>
      </div>

      <button className="intro-lewati" onClick={tutup}>
        Lewati
      </button>
    </div>
  )
}

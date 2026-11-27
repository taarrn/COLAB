import { Icon } from '../components/ui'

interface Props {
  nama: string
  menungguNama: string[]
  onBuat: () => void
  onGabung: () => void
  onKeluar: () => void
}

export default function Mulai({ nama, menungguNama, onBuat, onGabung, onKeluar }: Props) {
  return (
    <div className="masuk-wrap">
      <div className="masuk">
        <div className="brand masuk-brand">
          <div className="brand-mark">K</div>
          <span className="brand-name">Kolab</span>
        </div>
        <h1>Halo, {nama.split(' ')[0]}</h1>
        <p className="masuk-sub">Kamu belum aktif di organisasi mana pun. Mulai dari salah satu cara di bawah.</p>

        {menungguNama.length > 0 && (
          <p className="note">
            Permintaan bergabung ke {menungguNama.join(', ')} sedang menunggu persetujuan pengurus.
          </p>
        )}

        <div className="masuk-cols">
          <button className="panel mulai-card" onClick={onBuat}>
            <span className="mulai-ikon tone-red">
              <Icon name="plus" size={22} />
            </span>
            <strong>Buat organisasi</strong>
            <small>Kamu jadi Ketua, lalu atur role, unit, dan undang anggotamu.</small>
          </button>
          <button className="panel mulai-card" onClick={onGabung}>
            <span className="mulai-ikon tone-blue">
              <Icon name="link" size={22} />
            </span>
            <strong>Gabung dengan kode</strong>
            <small>Punya kode atau link undangan dari pengurus? Masukkan di sini.</small>
          </button>
        </div>

        <button className="link-btn masuk-back" onClick={onKeluar}>
          Ganti akun
        </button>
      </div>
    </div>
  )
}

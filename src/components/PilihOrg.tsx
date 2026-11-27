import { Icon, Modal } from './ui'
import { labelJabatan, namaUnit } from '../org'
import type { Keanggotaan, Organisasi } from '../org'

export default function PilihOrg({
  orgs,
  saya,
  aktifId,
  onPilih,
  onBuat,
  onGabung,
  onClose,
}: {
  orgs: Organisasi[]
  saya: Keanggotaan[]
  aktifId: string
  onPilih: (id: string) => void
  onBuat: () => void
  onGabung: () => void
  onClose: () => void
}) {
  return (
    <Modal title="Organisasimu" eyebrow="Pindah organisasi" subtitle="Jabatan dan akses di tiap organisasi berbeda." onClose={onClose}>
      <ul className="org-list">
        {saya.map((m) => {
          const o = orgs.find((x) => x.id === m.orgId)
          if (!o) return null
          const menunggu = m.status === 'menunggu'
          return (
            <li key={o.id}>
              <button disabled={menunggu} className={o.id === aktifId ? 'on' : ''} onClick={() => onPilih(o.id)}>
                <span className="org-badge">{o.nama.charAt(0)}</span>
                <span className="baris-main">
                  <strong>{o.nama}</strong>
                  <small>
                    {menunggu ? 'Menunggu persetujuan pengurus' : `${labelJabatan(o, m)}${namaUnit(o, m) ? ` · ${namaUnit(o, m)}` : ''}`}
                  </small>
                </span>
                {o.id === aktifId && <Icon name="check" size={18} />}
              </button>
            </li>
          )
        })}
      </ul>
      <div className="form-actions spread">
        <button className="btn btn-ghost" onClick={onGabung}>
          <Icon name="link" size={15} /> Gabung dengan kode
        </button>
        <button className="btn btn-primary" onClick={onBuat}>
          <Icon name="plus" size={15} /> Buat organisasi
        </button>
      </div>
    </Modal>
  )
}

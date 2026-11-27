import { useEffect, useMemo, useState } from 'react'
import './App.css'
import './pages/Org.css'
import Sidebar from './components/Sidebar'
import type { Page } from './components/Sidebar'
import PilihOrg from './components/PilihOrg'
import { BuatOrganisasi, GabungModal } from './components/OrgModals'
import { ProfilAkun, ProfilOrg } from './components/Profil'
import Dashboard from './pages/Dashboard'
import ProgramKerja from './pages/ProgramKerja'
import ProgramDetail from './pages/ProgramDetail'
import ManajemenTugas from './pages/ManajemenTugas'
import KalenderKegiatan from './pages/KalenderKegiatan'
import LaporanProgres from './pages/LaporanProgres'
import Anggota from './pages/Anggota'
import Pengaturan from './pages/Pengaturan'
import Landing from './pages/Landing'
import Masuk from './pages/Masuk'
import Mulai from './pages/Mulai'
import { Empty } from './components/ui'

import { loadPrograms, loadTugas, savePrograms, saveTugas, setKonteks } from './data'
import type { Anggota as AnggotaData, Program, Tugas, TugasInput } from './data'
import { buatAkses, labelJabatan, namaUnit, peringkat } from './org'
import { useOrgStore } from './store'

type Modal = null | 'org' | 'akun' | 'buat' | 'gabung' | { profil: number }

// Link undangan berbentuk  #/gabung/KODE
const bacaKode = () => {
  const m = /^#\/gabung\/([A-Za-z0-9]+)/.exec(location.hash)
  return m ? m[1].toUpperCase() : undefined
}

function App() {
  const store = useOrgStore()
  const [page, setPage] = useState<Page>('dashboard')
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null)
  const [programs, setPrograms] = useState<Program[]>(loadPrograms)
  const [tugas, setTugas] = useState<Tugas[]>(loadTugas)
  const [modal, setModal] = useState<Modal>(null)
  const [kode, setKode] = useState<string | undefined>(bacaKode)

  // Landing tampil di awal; setelah masuk, refresh tidak kembali ke landing selama tab masih terbuka
  const [masuk, setMasuk] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('kolab-masuk') === '1' || !!bacaKode()
    } catch {
      return !!bacaKode()
    }
  })

  const setMasukFlag = (v: boolean) => {
    try {
      sessionStorage.setItem('kolab-masuk', v ? '1' : '0')
    } catch {
      /* abaikan jika penyimpanan diblokir */
    }
    window.scrollTo(0, 0)
    setMasuk(v)
  }

  useEffect(() => {
    const onHash = () => {
      const k = bacaKode()
      if (k) {
        setKode(k)
        setMasuk(true)
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => savePrograms(programs), [programs])
  useEffect(() => saveTugas(tugas), [tugas])

  /* ---------- Turunan dari akun dan organisasi aktif ---------- */

  const akun = store.akuns.find((a) => a.id === store.akunId)
  const milikku = store.members.filter((m) => m.akunId === store.akunId)
  const aktifku = milikku.filter((m) => m.status === 'aktif')
  const saya = aktifku.find((m) => m.orgId === store.orgId) ?? aktifku[0]
  const org = saya ? store.orgs.find((o) => o.id === saya.orgId) : undefined
  const akses = useMemo(() => buatAkses(org, saya), [org, saya])

  const anggotaOrg: AnggotaData[] = useMemo(() => {
    if (!org) return []
    return store.members
      .filter((m) => m.orgId === org.id && m.status === 'aktif')
      .sort((a, b) => peringkat(org, a) - peringkat(org, b))
      .map((m) => ({
        id: m.akunId,
        nama: store.akuns.find((a) => a.id === m.akunId)?.nama ?? '-',
        divisi: namaUnit(org, m),
        jabatan: labelJabatan(org, m),
      }))
  }, [org, store.members, store.akuns])

  // Halaman lama membaca daftar anggota dan unit lewat registri ini
  setKonteks(
    anggotaOrg,
    org ? org.units.map((u) => u.nama) : [],
    store.akuns.map((a) => ({ id: a.id, nama: a.nama })),
  )

  const programsOrg = useMemo(() => programs.filter((p) => p.orgId === org?.id), [programs, org])
  const tugasOrg = useMemo(() => {
    const ids = new Set(programsOrg.map((p) => p.id))
    return tugas.filter((t) => ids.has(t.programId))
  }, [tugas, programsOrg])

  const selectedProgram = programsOrg.find((p) => p.id === selectedProgramId)
  const user: AnggotaData = anggotaOrg.find((a) => a.id === store.akunId) ?? {
    id: akun?.id ?? 0,
    nama: akun?.nama ?? '',
    divisi: '',
  }

  const unitBoleh = org ? org.units.map((u) => u.nama).filter((n) => akses.buatProgram(n)) : []
  const bolehTambahProgram = !!org && (org.units.length === 0 ? akses.buatProgram() : unitBoleh.length > 0)
  const menunggu = org && akses.kelolaAnggota ? store.members.filter((m) => m.orgId === org.id && m.status === 'menunggu').length : 0

  // Link undangan: setelah masuk, tawarkan bergabung
  useEffect(() => {
    if (kode && akun && modal === null) setModal('gabung')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kode, akun?.id])

  const selesaiKode = () => {
    setKode(undefined)
    if (location.hash.startsWith('#/gabung')) history.replaceState(null, '', location.pathname + location.search)
  }

  const navigate = (target: Page) => {
    setPage(target)
    setSelectedProgramId(null)
  }

  const pindahOrg = (id: string) => {
    store.setOrg(id)
    navigate('dashboard')
    setModal(null)
  }

  /* ---------- Penanganan program dan tugas ---------- */

  const addProgram = (data: Omit<Program, 'id'>) =>
    setPrograms((prev) => [{ ...data, orgId: org!.id, id: Date.now() }, ...prev])

  const updateProgram = (id: number, data: Omit<Program, 'id'>) =>
    setPrograms((prev) => prev.map((p) => (p.id === id ? { ...data, orgId: p.orgId, id } : p)))

  // Menghapus program ikut menghapus semua tugasnya
  const deleteProgram = (id: number) => {
    setPrograms((prev) => prev.filter((p) => p.id !== id))
    setTugas((prev) => prev.filter((t) => t.programId !== id))
    setSelectedProgramId(null)
  }

  const addTugas = (data: TugasInput) =>
    setTugas((prev) => [{ ...data, id: Date.now(), selesai: false }, ...prev])

  const updateTugas = (id: number, data: TugasInput) =>
    setTugas((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)))

  const toggleTugas = (id: number) =>
    setTugas((prev) => prev.map((t) => (t.id === id ? { ...t, selesai: !t.selesai } : t)))

  const deleteTugas = (id: number) => setTugas((prev) => prev.filter((t) => t.id !== id))

  const setBobot = (id: number, bobot: number) => {
    const aman = Math.min(100, Math.max(0, Math.round(bobot) || 0))
    setTugas((prev) => prev.map((t) => (t.id === id ? { ...t, bobot: aman } : t)))
  }

  // Bagi bobot sama rata ke semua tugas program, sisa pembulatan ke tugas pertama
  const bagiRata = (programId: number) =>
    setTugas((prev) => {
      const jumlah = prev.filter((t) => t.programId === programId).length
      if (jumlah === 0) return prev
      const dasar = Math.floor(100 / jumlah)
      let sisa = 100 - dasar * jumlah
      return prev.map((t) => {
        if (t.programId !== programId) return t
        const tambahan = sisa > 0 ? 1 : 0
        sisa -= tambahan
        return { ...t, bobot: dasar + tambahan }
      })
    })

  // Ganti nama unit: program yang memakai nama lama ikut berganti
  const gantiNamaUnit = (unitId: string, namaBaru: string) => {
    const lama = org?.units.find((u) => u.id === unitId)?.nama
    if (!lama || !org) return
    setPrograms((prev) => prev.map((p) => (p.orgId === org.id && p.departemen === lama ? { ...p, departemen: namaBaru } : p)))
  }

  const programPerUnit = (namaUnitIni: string) => programsOrg.filter((p) => p.departemen === namaUnitIni).length

  /* ---------- Modal bersama ---------- */

  const modals = akun && (
    <>
      {modal === 'org' && (
        <PilihOrg
          orgs={store.orgs}
          saya={milikku}
          aktifId={org?.id ?? ''}
          onPilih={pindahOrg}
          onBuat={() => setModal('buat')}
          onGabung={() => setModal('gabung')}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'buat' && (
        <BuatOrganisasi
          onClose={() => setModal(null)}
          onBuat={(nama, label, template) => {
            store.buatOrganisasi(nama, label, template)
            navigate('dashboard')
            setModal(null)
          }}
        />
      )}
      {modal === 'gabung' && (
        <GabungModal
          kodeAwal={kode}
          cekKode={store.cekKode}
          onGabung={(k) => {
            const h = store.gabung(k, akun.id)
            if (h.ok) {
              selesaiKode()
              if (!h.menunggu) navigate('dashboard')
            }
            return h
          }}
          onClose={() => {
            selesaiKode()
            setModal(null)
          }}
        />
      )}
      {modal === 'akun' && (
        <ProfilAkun
          akun={akun}
          orgs={store.orgs}
          members={store.members}
          onSimpan={(patch) => store.ubahProfil(akun.id, patch)}
          onKeluar={() => {
            store.keluar()
            setModal(null)
            navigate('dashboard')
          }}
          onClose={() => setModal(null)}
        />
      )}
      {typeof modal === 'object' && modal && org && (() => {
        const a = store.akuns.find((x) => x.id === modal.profil)
        const m = store.members.find((x) => x.orgId === org.id && x.akunId === modal.profil)
        return a && m ? (
          <ProfilOrg akun={a} org={org} member={m} programs={programsOrg} tugas={tugasOrg} onClose={() => setModal(null)} />
        ) : null
      })()}
    </>
  )

  /* ---------- Gerbang: landing, masuk, mulai ---------- */

  if (!masuk) return <Landing onEnter={() => setMasukFlag(true)} />

  if (!akun) {
    return (
      <Masuk
        akuns={store.akuns}
        orgs={store.orgs}
        members={store.members}
        kodeUndangan={kode}
        onMasuk={store.masuk}
        onDaftar={store.daftar}
        onKembali={() => setMasukFlag(false)}
      />
    )
  }

  if (!org || !saya) {
    const menungguNama = milikku
      .filter((m) => m.status === 'menunggu')
      .map((m) => store.orgs.find((o) => o.id === m.orgId)?.nama ?? '')
      .filter(Boolean)
    return (
      <>
        <Mulai
          nama={akun.nama}
          menungguNama={menungguNama}
          onBuat={() => setModal('buat')}
          onGabung={() => setModal('gabung')}
          onKeluar={store.keluar}
        />
        {modals}
      </>
    )
  }

  /* ---------- Aplikasi ---------- */

  return (
    <div className="app">
      <Sidebar
        page={page}
        onNavigate={navigate}
        user={user}
        namaOrg={org.nama}
        jumlahOrg={aktifku.length}
        bolehLaporan={akses.lihatLaporan}
        menunggu={menunggu}
        onBukaOrg={() => setModal('org')}
        onBukaAkun={() => setModal('akun')}
      />

      <main className="main-content">
        <div className="page" key={`${org.id}-${page}-${selectedProgramId ?? 'list'}`}>
          {page === 'dashboard' && (
            <Dashboard programs={programsOrg} tugas={tugasOrg} user={user} onNavigate={navigate} />
          )}

          {page === 'program' &&
            (selectedProgram ? (
              <ProgramDetail
                program={selectedProgram}
                tugas={tugasOrg}
                akses={akses}
                unitBoleh={unitBoleh}
                labelUnit={org.labelUnit}
                onBack={() => setSelectedProgramId(null)}
                onUpdate={(data) => updateProgram(selectedProgram.id, data)}
                onDelete={() => deleteProgram(selectedProgram.id)}
                onSetBobot={setBobot}
                onBagiRata={() => bagiRata(selectedProgram.id)}
                onAddTugas={addTugas}
                onUpdateTugas={updateTugas}
                onDeleteTugas={deleteTugas}
              />
            ) : (
              <ProgramKerja
                programs={programsOrg}
                tugas={tugasOrg}
                onAdd={addProgram}
                bolehTambah={bolehTambahProgram}
                unitBoleh={unitBoleh}
                labelUnit={org.labelUnit}
                onOpen={setSelectedProgramId}
              />
            ))}

          {page === 'tugas' && (
            <ManajemenTugas
              programs={programsOrg}
              tugas={tugasOrg}
              user={user}
              akses={akses}
              onAdd={addTugas}
              onUpdate={updateTugas}
              onToggle={toggleTugas}
              onDelete={deleteTugas}
            />
          )}

          {page === 'kalender' && (
            <KalenderKegiatan
              programs={programsOrg}
              tugas={tugasOrg}
              user={user}
              akses={akses}
              onAddTugas={addTugas}
              onToggleTugas={toggleTugas}
            />
          )}

          {page === 'laporan' &&
            (akses.lihatLaporan ? (
              <LaporanProgres programs={programsOrg} tugas={tugasOrg} />
            ) : (
              <Empty title="Laporan tidak tersedia" text="Role kamu belum punya izin melihat laporan. Hubungi pengurus organisasi." />
            ))}

          {page === 'anggota' && (
            <Anggota
              org={org}
              saya={saya}
              akuns={store.akuns}
              members={store.members.filter((m) => m.orgId === org.id)}
              undangan={store.undangan.filter((u) => u.orgId === org.id)}
              programs={programsOrg}
              tugas={tugasOrg}
              akses={akses}
              store={store}
              onBukaProfil={(id) => setModal({ profil: id })}
              onPengaturan={() => navigate('pengaturan')}
            />
          )}

          {page === 'pengaturan' &&
            (akses.kelolaRole || akses.kelolaUnit ? (
              <Pengaturan
                org={org}
                saya={saya}
                members={store.members.filter((m) => m.orgId === org.id)}
                akses={akses}
                store={store}
                programPerUnit={programPerUnit}
                onGantiNamaUnit={gantiNamaUnit}
                onBack={() => navigate('anggota')}
              />
            ) : (
              <Empty title="Tidak ada akses" text="Hanya pengurus dengan izin mengatur role atau unit yang bisa membuka halaman ini." />
            ))}
        </div>

        <footer className="footer">KOLAB © 2026 · Kolaborasi lebih terarah, organisasi lebih produktif.</footer>
      </main>
      {modals}
    </div>
  )
}

export default App

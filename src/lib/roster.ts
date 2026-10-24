// Direktori mahasiswa KelasHub — data kehadiran 20 Oktober 2026 (diberikan user).
// Dipakai sebagai source of truth akun mahasiswa pada Mode Demo & daftar anggota.
export interface RosterStudent {
  nim: string
  name: string
}

export const ROSTER: RosterStudent[] = [
  { nim: '19261199', name: 'Muhamad Nabil' },
  { nim: '19261338', name: 'Ruth Sahanaya' },
  { nim: '19261114', name: 'Adistia Yunita Putri' },
  { nim: '192611754', name: 'Rani Adila' },
  { nim: '19261366', name: 'Lusihuan Angela' },
  { nim: '19261521', name: 'Fakhri Adis Nabil' },
  { nim: '19261508', name: 'Delciya Rustianti' },
  { nim: '19261290', name: 'Cheryl Azzahra Rizer' },
  { nim: '19261112', name: 'Fikri Aziz' },
  { nim: '19261533', name: 'Wafa Ayla Dara' },
  { nim: '19261540', name: 'Tuah Firliano' },
  { nim: '19261409', name: 'Revan Krestian' },
  { nim: '19261154', name: 'Selly Ramadhani' },
  { nim: '19261391', name: 'Sherly Sea Seffani' },
  { nim: '19261539', name: 'Anjela Siska Novi Ambar' },
  { nim: '19261413', name: 'Yoli Meliana' },
  { nim: '19261403', name: 'Zenety Zafira' },
  { nim: '19261142', name: 'Yohana Biata Yuniarti Lemia' },
  { nim: '19261434', name: 'Syarif Muhamad Ridwan Fadila' },
  { nim: '19261329', name: 'Selo Tri Anugrah' },
  { nim: '19261400', name: 'Margaret' },
  { nim: '19261090', name: 'Fazar Aditio' },
  { nim: '19261327', name: 'Aditya Nugraha' },
  { nim: '19261526', name: 'Kristia Efalina Florida' },
  { nim: '19261519', name: 'Riska Wulandari' },
  { nim: '19261241', name: 'Daeng Axellendra Armeina' },
  { nim: '19261458', name: 'Rihandari Putri' },
  { nim: '19261454', name: 'Yuris Catur Wahyu Nugraha' },
  { nim: '19261314', name: 'Julio Tgar Ade Kedua' },
  { nim: '19261322', name: 'Muhammad Najmi Washil' },
  { nim: '19261355', name: 'Rifqi Zakwan Abyan' },
  { nim: '19261507', name: 'Rafly Dwi Andika' },
  { nim: '19261116', name: 'Diah Fitriani' },
  { nim: '19261167', name: 'Nayla Wafa Azzahra' },
  { nim: '19261300', name: 'Amsal Gabril' },
  { nim: '19261449', name: 'Ardinuari Angga Chavara' },
]

export const ADMIN_ACCOUNT = {
  username: 'admin',
  name: 'Admin Kelas',
  role: 'admin' as const,
}

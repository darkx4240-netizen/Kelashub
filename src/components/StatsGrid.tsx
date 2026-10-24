import {
  ClipboardList,
  Clock3,
  CalendarClock,
  BookOpen,
  Megaphone,
  Users,
  CalendarDays,
  FileText,
  type LucideIcon,
} from 'lucide-react'
import type { StatItem } from './StatCard'
import { StatCard } from './StatCard'

export interface StatRecord {
  totalTasks: number
  pendingTasks: number
  upcomingDeadline: string | null
  materials: number
  announcements: number
  members?: number
}

interface StatsGridProps {
  stats: StatRecord
  live: boolean
  admin?: boolean
  className?: string
}

function card(
  id: string,
  label: string,
  value: number,
  icon: LucideIcon,
  accent: string,
  tint: string,
  sublabel?: string,
): StatItem {
  return { id, label, value, icon, accent, tint, sublabel }
}

export function StatsGrid({ stats, live, admin = false, className = '' }: StatsGridProps) {
  const items: StatItem[] = admin
    ? [
        card('students', 'Mahasiswa Terdaftar', stats.members ?? 0, Users, '#7c3aed', '#f3e8ff', 'Total anggota kelas'),
        card('tasks', 'Tugas Aktif', stats.totalTasks, ClipboardList, '#2563eb', '#dbeafe', `${stats.pendingTasks} belum selesai`),
        card('schedule', 'Jadwal Kuliah', stats.materials, CalendarDays, '#0891b2', '#cffafe', 'Sesi minggu ini'),
        card('materials', 'Materi Tersedia', stats.materials, BookOpen, '#059669', '#d1fae5', 'Dokumen & modul'),
        card('announcements', 'Pengumuman Kelas', stats.announcements, Megaphone, '#ea580c', '#ffedd5', 'Pengumuman terbaru'),
      ]
    : [
        card('tasks', 'Total Tugas', stats.totalTasks, ClipboardList, '#2563eb', '#eef2ff', 'Semua tugas kelas'),
        card('pending', 'Belum Selesai', stats.pendingTasks, Clock3, '#7c3aed', '#f3e8ff', 'Perlu dikerjakan'),
        card('deadline', 'Deadline Terdekat', deadlineDays(stats.upcomingDeadline), CalendarClock, '#e11d48', '#ffe4e6', stats.upcomingDeadline ?? 'Tidak ada'),
        card('materials', 'Materi Pembelajaran', stats.materials, BookOpen, '#059669', '#ecfdf5', 'Tersedia di kelas'),
        card('announcements', 'Pengumuman Terbaru', stats.announcements, Megaphone, '#ea580c', '#fff7ed', 'Info dari dosen'),
      ]

  return (
    <div className={`grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-5 ${className}`}>
      {items.map((item, i) => (
        <StatCard key={item.id} item={item} index={i} live={live} />
      ))}
    </div>
  )
}

function deadlineDays(iso: string | null): number {
  if (!iso) return 0
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 0
  const diff = Math.ceil((d.getTime() - Date.now()) / 86400000)
  return Math.max(0, diff)
}

export { FileText }
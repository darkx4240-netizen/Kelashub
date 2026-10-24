import { useMemo } from 'react'
import { Hero } from '../components/Hero'
import { StatsGrid } from '../components/StatsGrid'
import { ScheduleList, type ScheduleItem } from '../components/ScheduleList'
import { TaskList, type TaskItem } from '../components/TaskList'
import { AnnouncementList, type Announcement } from '../components/AnnouncementList'
import { ActivityList, MaterialsQuick, type ActivityItem, type MaterialQuickItem } from '../components/ActivityList'
import { Section, Panel } from '../components/Section'
import type { DatabaseRow } from '../lib/data'

interface DashboardPageProps {
  name: string
  live: boolean
  tables: Record<string, DatabaseRow[] | null>
}

const fmtDate = (iso?: string) =>
  iso
    ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(
        new Date(iso),
      )
    : undefined

export function DashboardPage({ name, live, tables }: DashboardPageProps) {
  const schedule = useMemo<ScheduleItem[]>(() => {
    const rows = tables.schedules
    if (!Array.isArray(rows)) return []
    return rows.slice(0, 4).map((r, i) => ({
      id: String(r.id ?? i),
      course: String(r.course ?? r.title ?? '—'),
      room: r.room ? String(r.room) : undefined,
      day: String(r.day ?? ''),
      time: String(r.start_time ?? r.time ?? ''),
      lecturer: r.lecturer ? String(r.lecturer) : undefined,
    }))
  }, [tables.schedules])

  const tasks = useMemo<TaskItem[]>(() => {
    const rows = tables.tasks
    if (!Array.isArray(rows)) return []
    return rows.slice(0, 5).map((r, i) => ({
      id: String(r.id ?? i),
      title: String(r.title ?? '—'),
      course: r.course ? String(r.course) : undefined,
      due: fmtDate(r.due_date ? String(r.due_date) : undefined),
      done: Boolean(r.done ?? r.is_completed),
    }))
  }, [tables.tasks])

  const announcements = useMemo<Announcement[]>(() => {
    const rows = tables.announcements
    if (!Array.isArray(rows)) return []
    return rows.slice(0, 3).map((r, i) => ({
      id: String(r.id ?? i),
      title: String(r.title ?? '—'),
      body: r.body ? String(r.body) : undefined,
      date: fmtDate(r.created_at ? String(r.created_at) : undefined),
      pinned: Boolean(r.pinned),
    }))
  }, [tables.announcements])

  const activity = useMemo<ActivityItem[]>(() => {
    const rows = tables.activity
    if (!Array.isArray(rows)) return []
    return rows.slice(0, 5).map((r, i) => ({
      id: String(r.id ?? i),
      text: String(r.text ?? r.action ?? '—'),
      time: fmtDate(r.created_at ? String(r.created_at) : undefined),
    }))
  }, [tables.activity])

  const stats = {
    totalTasks: tasks.length,
    pendingTasks: tasks.filter((t) => !t.done).length,
    upcomingDeadline: tasks.find((t) => !t.done)?.due ?? null,
    materials: Array.isArray(tables.materials) ? tables.materials.length : 0,
    announcements: Array.isArray(tables.announcements) ? tables.announcements.length : 0,
  }

  const materialItems = useMemo<MaterialQuickItem[]>(() => {
    const rows = tables.materials
    if (!Array.isArray(rows)) return []
    return rows.slice(0, 4).map((r, i) => ({
      id: String(r.id ?? i),
      title: String(r.title ?? r.name ?? '—'),
      size: r.size ? String(r.size) : undefined,
    }))
  }, [tables.materials])

  const nextClass = live && schedule[0]
    ? {
        course: schedule[0].course,
        time: schedule[0].time,
        room: schedule[0].room,
      }
    : null

  return (
    <div className="space-y-6">
      <Hero
        name={name}
        live={live}
        pendingTasks={live ? stats.pendingTasks : null}
        todayClasses={null}
        nextClass={nextClass}
      />

      <StatsGrid stats={stats} live={live} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Section id="jadwal" title="Jadwal Kuliah Berikutnya" className="lg:col-span-1">
          <Panel className="p-0">
            <div className="p-4">
              <ScheduleList items={schedule} live={live} />
            </div>
          </Panel>
        </Section>

        <Section id="tugas" title="Deadline Tugas" className="lg:col-span-2">
          <Panel className="p-0">
            <div className="p-4">
              <TaskList items={tasks} live={live} />
            </div>
          </Panel>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Pengumuman Terbaru" className="lg:col-span-2">
          <Panel className="p-0">
            <div className="p-4">
              <AnnouncementList items={announcements} live={live} />
            </div>
          </Panel>
        </Section>

        <div className="space-y-6">
          <Section title="Materi Pembelajaran">
            <Panel className="p-0">
              <div className="p-4">
                <MaterialsQuick live={live} items={materialItems} />
              </div>
            </Panel>
          </Section>

          <Section title="Aktivitas Kelas">
            <Panel className="p-0">
              <div className="p-4">
                <ActivityList items={activity} live={live} />
              </div>
            </Panel>
          </Section>
        </div>
      </div>
    </div>
  )
}
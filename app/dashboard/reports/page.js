'use client';

import { motion } from 'framer-motion';
import { BarChart3, Download, FileText, Leaf, PieChart, Recycle, Trophy } from 'lucide-react';

const reportCards = [
  { title: 'Weekly EcoPoints', value: '+185', note: 'Team Green gained momentum', icon: Trophy, bg: 'bg-yellow-100', color: 'text-yellow-700' },
  { title: 'Waste Logged', value: '124', note: 'Across 4 categories', icon: Recycle, bg: 'bg-emerald-100', color: 'text-emerald-700' },
  { title: 'Smart Bin Accuracy', value: '91%', note: 'Latest AI confidence', icon: PieChart, bg: 'bg-sky-100', color: 'text-sky-700' },
  { title: 'Impact Score', value: 'A-', note: 'Great sorting this week', icon: Leaf, bg: 'bg-lime-100', color: 'text-lime-700' },
];

const weeklyRows = [
  { day: 'Monday', plastic: 12, paper: 8, organic: 4 },
  { day: 'Tuesday', plastic: 14, paper: 9, organic: 5 },
  { day: 'Wednesday', plastic: 9, paper: 6, organic: 7 },
  { day: 'Thursday', plastic: 16, paper: 7, organic: 3 },
  { day: 'Friday', plastic: 7, paper: 6, organic: 3 },
];

export default function ReportsPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-lg border border-white/80 bg-white/88 p-6 shadow-xl shadow-emerald-900/6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[1.8px] text-emerald-700">Reports</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Campus Sustainability Report</h1>
          <p className="mt-2 text-slate-500">Clean, presentation-ready data for the EcoQuest Bhutan demo.</p>
        </div>
        <a
          href="/reports/activity"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 font-black text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-700"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-lg border border-white/80 bg-white p-5 shadow-lg shadow-emerald-900/5"
          >
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-sm font-bold text-slate-500">{card.title}</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{card.value}</p>
            <p className="mt-1 text-sm text-slate-500">{card.note}</p>
          </motion.div>
        ))}
      </div>

      <section className="rounded-lg border border-white/80 bg-white p-5 shadow-xl shadow-emerald-900/6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[1.8px] text-sky-700">Weekly Breakdown</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Waste category logs</h2>
          </div>
          <FileText className="h-7 w-7 text-sky-500" />
        </div>

        <div className="space-y-4">
          {weeklyRows.map((row) => {
            const total = row.plastic + row.paper + row.organic;
            return (
              <div key={row.day} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-black text-slate-900">{row.day}</p>
                  <p className="text-sm font-bold text-slate-500">{total} items</p>
                </div>
                <div className="flex h-4 overflow-hidden rounded-full bg-white">
                  <div className="bg-sky-400" style={{ width: `${(row.plastic / total) * 100}%` }} />
                  <div className="bg-yellow-400" style={{ width: `${(row.paper / total) * 100}%` }} />
                  <div className="bg-lime-400" style={{ width: `${(row.organic / total) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-emerald-100 bg-emerald-50 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-black text-emerald-950">Presentation Insight</h2>
            <p className="mt-1 text-sm leading-6 text-emerald-800">
              Team Green is close to Rank #1. Plastic sorting is the fastest path to overtake Hostel A this week.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

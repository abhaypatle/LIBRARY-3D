import { AlertTriangle, BellRing, LogIn, Settings2, Users, Wallet } from 'lucide-react';

export default function AdminDashboard({ overview, students, offers }) {
  return (
    <section id="admin" className="mx-auto max-w-7xl px-4 py-16">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.28em] text-brand-300">Owner dashboard</p>
        <h3 className="mt-2 text-3xl font-bold text-white">Remote control and analytics</h3>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Active students', value: overview.activeStudents, icon: <Users size={18} />, accent: 'bg-brand-500/10 text-brand-200' },
          { label: 'Attendance today', value: overview.todayAttendance, icon: <LogIn size={18} />, accent: 'bg-emerald-500/10 text-emerald-200' },
          { label: 'Total collection', value: `₹${overview.totalCollection.toLocaleString()}`, icon: <Wallet size={18} />, accent: 'bg-amber-500/10 text-amber-200' },
          { label: 'Pending fees', value: `₹${overview.pendingFees.toLocaleString()}`, icon: <AlertTriangle size={18} />, accent: 'bg-rose-500/10 text-rose-200' }
        ].map((card) => (
          <div key={card.label} className="glass rounded-[24px] p-5">
            <div className={`inline-flex rounded-2xl p-2 ${card.accent}`}>{card.icon}</div>
            <p className="mt-4 text-sm text-slate-400">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass rounded-[28px] p-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-semibold text-white">Attendance log</h4>
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200"><Settings2 size={16} /> Manage</button>
          </div>

          <div className="mt-6 space-y-3">
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/70 p-3">
                <div>
                  <p className="font-medium text-white">{student.name}</p>
                  <p className="text-xs text-slate-400">Seat #{student.seatId} • {student.membershipPlan}</p>
                </div>
                <div className="text-right text-xs text-slate-300">
                  <p>In: {student.attendance.in ? new Date(student.attendance.in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                  <p>Out: {student.attendance.out ? new Date(student.attendance.out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-[28px] p-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-semibold text-white">Offers Engine</h4>
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200"><BellRing size={16} /> Active</button>
          </div>

          <div className="mt-6 space-y-4">
            {offers.map((offer) => (
              <div key={offer.id} className="rounded-2xl border border-brand-400/20 bg-brand-500/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">{offer.title}</p>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-200">{offer.discount}%</span>
                </div>
                <p className="mt-2 text-sm text-slate-300">{offer.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

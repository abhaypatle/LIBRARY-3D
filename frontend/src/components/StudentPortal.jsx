import { BadgeCheck, BookOpen, Clock3, MapPinned, MessageSquareText, QrCode, Wallet } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function StudentPortal({ student, complaints }) {
  return (
    <section id="portal" className="mx-auto max-w-7xl px-4 py-16">
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass rounded-[28px] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-brand-300">Student portal</p>
              <h3 className="mt-2 text-3xl font-bold text-white">Membership snapshot</h3>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-300"><BadgeCheck size={20} /></div>
          </div>

          <div className="mt-6 rounded-[28px] border border-slate-700 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Member</p>
                <h4 className="mt-2 text-2xl font-bold text-white">{student.name}</h4>
              </div>
              <div className="rounded-2xl bg-brand-500/10 px-2 py-1 text-brand-200">{student.status}</div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoTile title="Plan" value={student.membershipPlan} icon={<BookOpen size={16} />} />
              <InfoTile title="Due in" value={`${daysUntil(student.dueDate)} days`} icon={<Clock3 size={16} />} />
              <InfoTile title="Seat" value={`#${student.seatId}`} icon={<MapPinned size={16} />} />
              <InfoTile title="Fee owed" value={`₹${(student.feeTotal - student.feePaid).toLocaleString()}`} icon={<Wallet size={16} />} />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Fee ledger</span>
                <span>₹{student.feePaid.toLocaleString()} / ₹{student.feeTotal.toLocaleString()}</span>
              </div>
              <div className="mt-3 h-2.5 rounded-full bg-slate-800">
                <div className="h-2.5 rounded-full bg-gradient-to-r from-brand-400 to-emerald-400" style={{ width: `${(student.feePaid / student.feeTotal) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-brand-300">Digital pass</p>
                <h3 className="mt-2 text-3xl font-bold text-white">Access card</h3>
              </div>
              <div className="rounded-2xl bg-cyan-500/10 p-2 text-cyan-300"><QrCode size={20} /></div>
            </div>

            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="rounded-[24px] border border-slate-700 bg-slate-950/80 p-4">
                <QRCodeSVG value={student.qrCode} size={160} bgColor="#0f172a" fgColor="#e2e8f0" />
              </div>
              <div className="flex-1 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-2xl bg-slate-900/60 p-3"><span>ID</span><strong>{student.qrCode}</strong></div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-900/60 p-3"><span>Email</span><strong>{student.email}</strong></div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-900/60 p-3"><span>Check-in status</span><strong>{student.attendance.in ? 'Checked in' : 'Not yet'}</strong></div>
              </div>
            </div>
          </div>

          <div className="glass rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-brand-300">Support</p>
                <h3 className="mt-2 text-3xl font-bold text-white">Help & complaints</h3>
              </div>
              <div className="rounded-2xl bg-amber-500/10 p-2 text-amber-300"><MessageSquareText size={20} /></div>
            </div>

            <div className="mt-6 space-y-3">
              {complaints.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-start justify-between rounded-2xl border border-slate-700 bg-slate-900/70 p-3">
                  <div>
                    <p className="font-medium text-white">{item.category}</p>
                    <p className="mt-1 text-sm text-slate-300">{item.message}</p>
                  </div>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-200">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoTile({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">{icon}{title}</div>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function daysUntil(dateString) {
  const target = new Date(dateString);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

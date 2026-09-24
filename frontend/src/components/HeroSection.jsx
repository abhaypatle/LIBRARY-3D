import { ArrowRight, BookOpen, CheckCircle2, ChevronRight, Sparkles, Wifi } from 'lucide-react';

export default function HeroSection({ overview, onRegister }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-24">
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-400/25 bg-brand-500/10 px-3 py-1 text-sm text-brand-200">
            <Sparkles size={14} /> Smart library for focused learning
          </div>
          <h2 className="max-w-xl text-5xl font-black leading-tight text-white md:text-6xl">
            Build your study streak in a premium library ecosystem.
          </h2>
          <p className="mt-6 max-w-xl text-lg text-slate-300">
            Avani Library blends flexible seating, digital access control, and smart ownership tools for a campus-ready learning space.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button onClick={onRegister} className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-6 py-3 font-semibold text-white shadow-glow hover:bg-brand-400">
              Register Now <ChevronRight size={16} />
            </button>
            <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-3 font-semibold text-slate-200 hover:border-slate-500">
              Explore Seat Map <ArrowRight size={16} />
            </button>
          </div>

          <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
            {[
              { label: 'Available seats', value: `${overview.availableSeats}/70` },
              { label: 'Today check-ins', value: `${overview.todayAttendance}` },
              { label: 'Collection', value: `₹${overview.totalCollection.toLocaleString()}` }
            ].map((item) => (
              <div key={item.label} className="glass rounded-2xl p-4">
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex justify-center">
          <div className="relative w-full max-w-[450px]">
            <div className="absolute -left-10 top-12 h-36 w-36 rounded-full bg-brand-500/30 blur-3xl" />
            <div className="absolute -right-6 bottom-12 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="glass relative rounded-[30px] p-6">
              <div className="flex items-center justify-between pb-4 text-sm text-slate-300">
                <div className="flex items-center gap-2"><Wifi size={14} /> Live availability</div>
                <div className="flex items-center gap-2 text-emerald-300"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Open now</div>
              </div>

              <div className="relative">
                <div className="book-3d relative mx-auto flex h-72 w-52 items-center justify-center">
                  <div className="absolute inset-x-5 top-6 h-52 rounded-[28px] bg-gradient-to-br from-slate-200 to-slate-500 opacity-90 shadow-2xl" style={{ transform: 'rotate(-18deg) translateZ(18px)' }} />
                  <div className="absolute inset-x-8 top-9 h-52 rounded-[28px] bg-gradient-to-br from-brand-200 to-brand-400 shadow-2xl" style={{ transform: 'rotate(-12deg) translateZ(32px)' }} />
                  <div className="absolute inset-x-10 top-12 h-52 rounded-[28px] bg-gradient-to-br from-cyan-200 to-sky-600 shadow-2xl" style={{ transform: 'rotate(-4deg) translateZ(48px)' }} />
                  <div className="absolute bottom-6 left-1/2 h-10 w-40 -translate-x-1/2 rounded-full bg-slate-900/30 blur-xl" />
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">Seat status</p>
                    <p className="mt-2 text-3xl font-black text-white">{overview.availableSeats}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-300">
                    <CheckCircle2 size={26} />
                  </div>
                </div>
                <div className="mt-3 h-2.5 rounded-full bg-slate-800">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-brand-500" style={{ width: `${overview.occupancyRate}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

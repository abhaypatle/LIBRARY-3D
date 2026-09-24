import { TicketPercent } from 'lucide-react';

const planOptions = [
  { value: 'monthly', label: 'Monthly Plan', price: '₹2,800', details: 'Perfect for short study cycles' },
  { value: 'quarterly', label: 'Quarterly Plan', price: '₹6,200', details: 'Best value for intensive prep' }
];

export default function SeatLayout({ seats, selectedSeat, selectedPlan, onSeatSelect, onPlanSelect }) {
  return (
    <section id="layout" className="mx-auto max-w-7xl px-4 py-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-brand-300">Seat layout</p>
          <h3 className="mt-2 text-3xl font-bold text-white">70-seat interactive floor plan</h3>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-400" /> Available</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-rose-500" /> Booked</span>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="glass rounded-[28px] p-5">
          <div className="grid-availability">
            {seats.map((seat) => (
              <button
                key={seat.id}
                onClick={() => onSeatSelect(seat)}
                className={`seat-button flex h-10 items-center justify-center rounded-xl border text-xs font-medium ${
                  seat.status === 'available'
                    ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'
                    : 'border-rose-500/40 bg-rose-500/15 text-rose-200 cursor-not-allowed'
                } ${selectedSeat?.id === seat.id ? 'ring' : ''}`}
              >
                {seat.id}
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-[28px] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-brand-300">Quick booking</p>
              <h4 className="mt-2 text-2xl font-bold text-white">Reserve a seat</h4>
            </div>
            <div className="rounded-2xl bg-brand-500/10 p-2 text-brand-300"><TicketPercent size={20} /></div>
          </div>

          <div className="mt-6 space-y-4 text-sm text-slate-300">
            {selectedSeat ? (
              <div className="rounded-2xl border border-brand-400/30 bg-brand-500/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-brand-200">Selected seat</p>
                <p className="mt-2 text-xl font-semibold text-white">Seat #{selectedSeat.id}</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 text-slate-400">
                Choose any green seat to continue.
              </div>
            )}

            <div className="space-y-3">
              {planOptions.map((plan) => (
                <button
                  key={plan.value}
                  onClick={() => onPlanSelect(plan.value)}
                  className={`w-full rounded-2xl border p-4 text-left ${
                    selectedPlan === plan.value
                      ? 'border-brand-400 bg-brand-500/10 text-white'
                      : 'border-slate-700 bg-slate-900/60 text-slate-300'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{plan.label}</span>
                    <span className="text-xs text-brand-200">{plan.price}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{plan.details}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

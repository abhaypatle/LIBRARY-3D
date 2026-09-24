import { ChevronRight } from 'lucide-react';

export default function TermsPanel() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-12">
      <div className="glass rounded-[26px] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-brand-300">Terms & conditions</p>
            <h4 className="mt-2 text-2xl font-bold text-white">Mandatory digital agreement</h4>
          </div>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-5 py-3 font-medium text-white hover:bg-brand-400">
            Review T&C <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

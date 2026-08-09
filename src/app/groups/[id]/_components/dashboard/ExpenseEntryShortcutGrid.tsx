import { Camera, Plus } from "lucide-react";

/** ダッシュボード上の OCR（未実装）・手入力へのショートカット */
export function ExpenseEntryShortcutGrid() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        disabled
        className="flex flex-col items-start space-y-3 rounded-3xl border border-slate-100 bg-white/95 p-5 text-left shadow-card opacity-70 transition-all duration-200 active:scale-95"
        aria-disabled
      >
        <div className="rounded-xl bg-orange-50 p-2.5 text-left shadow-inner">
          <Camera className="h-5 w-5 text-orange-600" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Rapid
          </p>
          <p className="text-sm font-bold leading-tight text-slate-800">OCR撮影</p>
        </div>
      </button>
      <a
        href="#expense-form"
        className="group flex flex-col items-start space-y-3 rounded-3xl border border-indigo-100 bg-indigo-50/90 p-5 text-left shadow-card transition-all duration-200 hover:border-indigo-200 hover:shadow-card-hover active:scale-95"
      >
        <div className="rounded-xl bg-indigo-600 p-2.5 shadow-lg transition-transform group-hover:rotate-12">
          <Plus className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
            Simple
          </p>
          <p className="text-sm font-bold leading-tight text-indigo-900">手入力</p>
        </div>
      </a>
    </div>
  );
}

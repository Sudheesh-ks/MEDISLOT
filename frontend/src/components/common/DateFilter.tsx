// src/components/Admin/DateFilter.tsx
import React from 'react';

export type DateRange = {
  type: 'today' | 'yesterday' | 'lastweek' | 'lastmonth' | 'custom';
  startDate?: string | null;
  endDate?: string | null;
};

const options = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last Week', value: 'lastweek' },
  { label: 'Last Month', value: 'lastmonth' },
  { label: 'Custom', value: 'custom' },
];

export default function DateFilter({ value, onChange }: { value: DateRange; onChange: (v: DateRange) => void; }) {
  return (
    <div className="flex items-center gap-3">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange({ type: opt.value as any, startDate: null, endDate: null })}
          className={`px-3 py-1 rounded ${value.type === opt.value ? 'bg-blue-600' : 'bg-slate-700'}`}
        >
          {opt.label}
        </button>
      ))}

      {value.type === 'custom' && (
        <div className="flex gap-2 items-center">
          <input type="date" value={value.startDate ?? ''} onChange={e => onChange({ ...value, startDate: e.target.value })} className="bg-slate-800 text-white px-2 py-1 rounded" />
          <input type="date" value={value.endDate ?? ''} onChange={e => onChange({ ...value, endDate: e.target.value })} className="bg-slate-800 text-white px-2 py-1 rounded" />
        </div>
      )}
    </div>
  );
}

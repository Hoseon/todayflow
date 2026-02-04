"use client";

import { FormEvent, useState } from "react";

type QuickAddProps = {
  selectedDate: string;
  onCreate: (payload: { title: string; dueDate: string; priority: 1 | 2 | 3 }) => Promise<boolean> | boolean;
};

export function QuickAdd({ selectedDate, onCreate }: QuickAddProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<1 | 2 | 3>(2);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const ok = await onCreate({ title: trimmed, dueDate: selectedDate, priority });
    if (ok) {
      setTitle("");
      setPriority(2);
      setError("");
      return;
    }

    setError("저장에 실패했어요. DB 연결 상태를 확인해 주세요.");
  }

  return (
    <form className="rounded-xl2 border border-ink/10 bg-white p-4 shadow-soft sm:p-5" onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">빠른 추가</p>
        <p className="rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-ink/65">날짜 {selectedDate}</p>
      </div>
      <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 11시 데일리 스탠드업 준비"
          className="h-12 w-full rounded-xl border border-ink/10 bg-paper px-3.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <div className="flex gap-2">
          <select
            className="h-12 rounded-xl border border-ink/10 bg-paper px-3 text-sm"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value) as 1 | 2 | 3)}
          >
            <option value={1}>높음</option>
            <option value={2}>보통</option>
            <option value={3}>낮음</option>
          </select>
          <button
            type="submit"
            className="h-12 rounded-xl bg-ink px-5 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:bg-[#171d2a]"
          >
            추가
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-[#b63e1f]">{error}</p>}
    </form>
  );
}

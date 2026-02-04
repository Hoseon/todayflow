type BrandHeaderProps = {
  totalCount: number;
  completedCount: number;
  selectedDate: string;
};

export function BrandHeader({ totalCount, completedCount, selectedDate }: BrandHeaderProps) {
  const now = new Date();
  const formatted = new Intl.DateTimeFormat("ko-KR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(now);

  return (
    <header className="rounded-xl2 border border-white/65 bg-white/80 p-5 shadow-soft backdrop-blur">
      <p className="text-xs uppercase tracking-[0.24em] text-ink/45">TodayFlow</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">오늘 해야 할 일</h1>
        <p className="rounded-full bg-ink/5 px-3 py-1 text-sm font-medium text-ink/70">{formatted}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <p className="rounded-full border border-ink/10 bg-paper px-3 py-1 text-xs font-medium text-ink/70">
          완료 {completedCount}/{totalCount}
        </p>
        <p className="rounded-full border border-accent/20 bg-[#fff3ef] px-3 py-1 text-xs font-medium text-[#a83c22]">
          선택 날짜 {selectedDate}
        </p>
      </div>
    </header>
  );
}

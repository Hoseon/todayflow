"use client";

import { Task } from "@/lib/types";

const priorityLabel: Record<Task["priority"], string> = {
  1: "높음",
  2: "보통",
  3: "낮음",
};

const priorityClass: Record<Task["priority"], string> = {
  1: "bg-[#ffe9e4] text-[#a83c22]",
  2: "bg-[#fff6dd] text-[#9b6a00]",
  3: "bg-[#e8fff6] text-[#0d7b62]",
};

type TaskListProps = {
  title: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  emptyMessage: string;
};

export function TaskList({ title, tasks, onToggle, onDelete, emptyMessage }: TaskListProps) {
  return (
    <section className="rounded-xl2 border border-ink/10 bg-white p-4 shadow-soft sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <span className="rounded-full border border-ink/10 bg-paper px-2 py-1 text-xs font-medium text-ink/60">
          {tasks.length}개
        </span>
      </div>
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink/20 bg-paper/70 px-3 py-7 text-center text-sm text-ink/50">
            {emptyMessage}
          </p>
        ) : (
          tasks.map((task) => (
            <article
              key={task.id}
              className="flex items-center justify-between rounded-xl border border-ink/10 bg-white px-3 py-3 transition hover:border-ink/20 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <input
                  checked={task.completed}
                  type="checkbox"
                  onChange={() => onToggle(task.id)}
                  className="h-4 w-4 accent-accent"
                />
                <div>
                  <p className={task.completed ? "text-sm text-ink/45 line-through" : "text-sm text-ink"}>
                    {task.title}
                  </p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${priorityClass[task.priority]}`}
                  >
                    {priorityLabel[task.priority]}
                  </span>
                </div>
              </div>
              <button
                className="rounded-lg px-2 py-1 text-xs text-ink/45 transition hover:bg-[#fff1ec] hover:text-[#b63e1f]"
                onClick={() => onDelete(task.id)}
              >
                삭제
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

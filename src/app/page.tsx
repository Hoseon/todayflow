"use client";

import { useEffect, useMemo, useState } from "react";

import { BrandHeader } from "@/components/brand-header";
import { Calendar } from "@/components/calendar";
import { QuickAdd } from "@/components/quick-add";
import { TaskList } from "@/components/task-list";
import { isoDate } from "@/lib/date";
import { supabase } from "@/lib/supabase-client";
import { Task } from "@/lib/types";

type TasksV2Row = {
  id: string;
  title: string;
  due_date: string;
  completed: boolean;
  priority: number;
  created_at: string;
  delete_flag?: "Y" | "N";
};

type TaskLegacyRow = {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: number;
  createdAt: string;
  userId: string;
};

type BackendMode = "tasks_v2" | "task_legacy" | null;

function fromTasksV2(row: TasksV2Row): Task {
  return {
    id: row.id,
    title: row.title,
    dueDate: row.due_date,
    completed: row.completed,
    priority: row.priority as 1 | 2 | 3,
  };
}

function fromTaskLegacy(row: TaskLegacyRow): Task {
  return {
    id: row.id,
    title: row.title,
    dueDate: row.dueDate.slice(0, 10),
    completed: row.completed,
    priority: row.priority as 1 | 2 | 3,
  };
}

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(isoDate(new Date()));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notice, setNotice] = useState("");
  const [backend, setBackend] = useState<BackendMode>(null);
  const [softDeleteEnabled, setSoftDeleteEnabled] = useState(true);

  useEffect(() => {
    async function init() {
      if (!supabase) {
        setNotice("Supabase 환경변수(NEXT_PUBLIC_SUPABASE_URL / ANON_KEY)가 비어 있어요.");
        return;
      }

      const v2 = await supabase
        .from("tasks")
        .select("id,title,due_date,completed,priority,created_at,delete_flag")
        .eq("delete_flag", "N")
        .order("due_date", { ascending: true })
        .order("created_at", { ascending: false });

      if (!v2.error) {
        setTasks((v2.data ?? []).map((row) => fromTasksV2(row as TasksV2Row)));
        setBackend("tasks_v2");
        setSoftDeleteEnabled(true);
        setNotice("");
        return;
      }

      // Compatibility fallback for old schema before delete_flag migration
      const v2Legacy = await supabase
        .from("tasks")
        .select("id,title,due_date,completed,priority,created_at")
        .order("due_date", { ascending: true })
        .order("created_at", { ascending: false });

      if (!v2Legacy.error) {
        setTasks((v2Legacy.data ?? []).map((row) => fromTasksV2(row as TasksV2Row)));
        setBackend("tasks_v2");
        setSoftDeleteEnabled(false);
        setNotice(
          "delete_flag 컬럼이 없어 soft delete가 비활성화돼 있어요. supabase/tasks_soft_delete_migration.sql 실행을 권장해요.",
        );
        return;
      }

      const legacy = await supabase
        .from("Task")
        .select("id,title,dueDate,completed,priority,createdAt,userId")
        .order("dueDate", { ascending: true })
        .order("createdAt", { ascending: false });

      if (!legacy.error) {
        setTasks((legacy.data ?? []).map((row) => fromTaskLegacy(row as TaskLegacyRow)));
        setBackend("task_legacy");
        setSoftDeleteEnabled(false);
        setNotice("기존 Prisma 테이블(Task)을 감지해 해당 테이블로 연결했어요.");
        return;
      }

      setBackend(null);
      setNotice(
        "Supabase에 tasks/Task 테이블이 없어요. SQL Editor에서 supabase/tasks.sql 실행 후 새로고침해 주세요.",
      );
    }

    void init();
  }, []);

  const today = isoDate(new Date());

  const todayTasks = useMemo(() => tasks.filter((task) => task.dueDate === today), [tasks, today]);

  const selectedTasks = useMemo(
    () => tasks.filter((task) => task.dueDate === selectedDate),
    [tasks, selectedDate],
  );
  const completedCount = useMemo(() => tasks.filter((task) => task.completed).length, [tasks]);

  async function createTask(payload: { title: string; dueDate: string; priority: 1 | 2 | 3 }): Promise<boolean> {
    if (!supabase || !backend) {
      setNotice("Supabase 테이블 연결이 아직 완료되지 않았어요.");
      return false;
    }

    if (backend === "tasks_v2") {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: payload.title,
          due_date: payload.dueDate,
          completed: false,
          priority: payload.priority,
          delete_flag: "N",
        })
        .select("id,title,due_date,completed,priority,created_at,delete_flag")
        .single();

      if (error) {
        setNotice(`Supabase 저장 실패: ${error.message}`);
        return false;
      }

      setTasks((prev) => [fromTasksV2(data as TasksV2Row), ...prev]);
      setNotice("");
      return true;
    }

    const { data, error } = await supabase
      .from("Task")
      .insert({
        title: payload.title,
        dueDate: `${payload.dueDate}T12:00:00.000Z`,
        completed: false,
        priority: payload.priority,
        userId: "demo-user",
      })
      .select("id,title,dueDate,completed,priority,createdAt,userId")
      .single();

    if (error) {
      setNotice(`Supabase 저장 실패(legacy Task): ${error.message}`);
      return false;
    }

    setTasks((prev) => [fromTaskLegacy(data as TaskLegacyRow), ...prev]);
    setNotice("");
    return true;
  }

  async function toggleTask(id: string) {
    if (!supabase || !backend) return;
    const target = tasks.find((task) => task.id === id);
    if (!target) return;

    const nextCompleted = !target.completed;
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: nextCompleted } : task)));

    const query =
      backend === "tasks_v2"
        ? supabase.from("tasks").update({ completed: nextCompleted }).eq("id", id)
        : supabase.from("Task").update({ completed: nextCompleted }).eq("id", id);

    const { error } = await query;

    if (error) {
      setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: target.completed } : task)));
      setNotice(`완료 상태 업데이트 실패: ${error.message}`);
      return;
    }

    setNotice("");
  }

  async function deleteTask(id: string) {
    if (!supabase || !backend) return;
    const prev = tasks;
    setTasks((curr) => curr.filter((task) => task.id !== id));

    const query =
      backend === "tasks_v2"
        ? softDeleteEnabled
          ? supabase.from("tasks").update({ delete_flag: "Y" }).eq("id", id)
          : supabase.from("tasks").delete().eq("id", id)
        : supabase.from("Task").delete().eq("id", id);

    const { error } = await query;

    if (error) {
      setTasks(prev);
      setNotice(`삭제 실패: ${error.message}`);
      return;
    }

    if (backend === "tasks_v2" && softDeleteEnabled) {
      setNotice("할 일을 삭제 상태(delete_flag=Y)로 처리했어요.");
      return;
    }

    setNotice("");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8 lg:gap-5">
      <BrandHeader totalCount={tasks.length} completedCount={completedCount} selectedDate={selectedDate} />

      <QuickAdd selectedDate={selectedDate} onCreate={createTask} />
      {notice && (
        <p className="rounded-xl border border-[#ffd7cd] bg-[#fff4f0] px-3 py-2 text-xs font-medium text-[#a83c22]">
          {notice}
        </p>
      )}

      <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <TaskList
          title="오늘 할 일"
          tasks={todayTasks}
          onToggle={toggleTask}
          onDelete={deleteTask}
          emptyMessage="오늘 할 일은 비어있어요. 중요한 1개만 먼저 적어볼까요?"
        />
        <TaskList
          title={`선택한 날짜 (${selectedDate})`}
          tasks={selectedTasks}
          onToggle={toggleTask}
          onDelete={deleteTask}
          emptyMessage="선택한 날짜에는 아직 일정이 없어요."
        />
      </section>

      <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} tasks={tasks} />
    </main>
  );
}

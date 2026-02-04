export type Task = {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: 1 | 2 | 3;
};

export type PriorityMeta = {
  label: string;
  hue: string;
};

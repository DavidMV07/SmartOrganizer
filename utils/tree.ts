import { v4 as uuidv4 } from "uuid";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  children: Task[];
}

export const createTask = (title: string, description = ""): Task => ({
  id: uuidv4(),
  title,
  description,
  completed: false,
  children: [],
});

export const findNodeById = (node: Task, id: string): Task | null => {
  if (node.id === id) return node;
  for (let child of node.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
};

export const addTask = (root: Task, parentId: string, title: string, description = "") => {
  const parent = findNodeById(root, parentId);
  if (parent) parent.children.push(createTask(title, description));
};

export const deleteTask = (node: Task, id: string) => {
  node.children = node.children.filter((child) => child.id !== id);
  node.children.forEach((child) => deleteTask(child, id));
};

export const editTask = (node: Task, id: string, newData: Partial<Task>) => {
  if (node.id === id) Object.assign(node, newData);
  node.children.forEach((child) => editTask(child, id, newData));
};

export const toggleComplete = (node: Task, id: string) => {
  if (node.id === id) node.completed = !node.completed;
  node.children.forEach((child) => toggleComplete(child, id));
};

import { Task } from "./tree";

export const calculateStats = (root: Task) => {
  const stats = { total: 0, completed: 0, maxDepth: 0 };

  const traverse = (node: Task, depth: number) => {
    stats.total++;
    if (node.completed) stats.completed++;
    stats.maxDepth = Math.max(stats.maxDepth, depth);
    node.children.forEach((child) => traverse(child, depth + 1));
  };

  traverse(root, 1);

  return {
    totalTasks: stats.total,
    completedTasks: stats.completed,
    completionRate: ((stats.completed / stats.total) * 100).toFixed(1) + "%",
    maxDepth: stats.maxDepth,
  };
};

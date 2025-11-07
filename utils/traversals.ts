import { Task } from "./tree";

export const preOrder = (node: Task, result: string[] = []): string[] => {
  if (!node) return result;
  result.push(node.title);
  node.children.forEach((child) => preOrder(child, result));
  return result;
};

export const levelOrder = (root: Task): string[] => {
  if (!root) return [];
  const queue: Task[] = [root];
  const result: string[] = [];
  while (queue.length) {
    const current = queue.shift()!;
    result.push(current.title);
    queue.push(...current.children);
  }
  return result;
};

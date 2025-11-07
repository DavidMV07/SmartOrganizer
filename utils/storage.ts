import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task } from "../types";

//Clave de los datos almacenados
const TASKS_KEY = "TASK_TREE";

export const saveTasks = async (tasks: Task[]) => {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const loadTasks = async (): Promise<Task[]> => {
  const data = await AsyncStorage.getItem(TASKS_KEY);
  return data ? JSON.parse(data) : [];
};
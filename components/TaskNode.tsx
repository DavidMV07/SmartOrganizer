import React, { useState } from "react";
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet } from "react-native";
import { Task } from "../types";
import uuid from "react-native-uuid";

interface Props {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: () => void;
}

export default function TaskNode({ task, onUpdate, onDelete }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [newTitle, setNewTitle] = useState("");

  const toggleComplete = () => {
    onUpdate({ ...task, completed: !task.completed });
  };

  const addSubtask = () => {
    if (newTitle.trim() === "") return;
    const newTask: Task = {
      id: uuid.v4().toString(),
      title: newTitle,
      completed: false,
      children: [],
    };
    onUpdate({ ...task, children: [...task.children, newTask] });
    setNewTitle("");
  };

  const updateChild = (updatedChild: Task) => {
    onUpdate({
      ...task,
      children: task.children.map((c) => (c.id === updatedChild.id ? updatedChild : c)),
    });
  };

  const deleteChild = (id: string) => {
    onUpdate({ ...task, children: task.children.filter((c) => c.id !== id) });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <Text style={[styles.title, task.completed && styles.completed]}>
          {expanded ? "▼" : "▶"} {task.title}
        </Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <Button title={task.completed ? "Desmarcar" : "Completar"} onPress={toggleComplete} />
        <Button title="Eliminar" onPress={onDelete} color="#dc2626" />
      </View>

      {expanded && (
        <>
          <View style={styles.addRow}>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Agregar subtarea..."
              style={styles.input}
            />
            <Button title="+" onPress={addSubtask} />
          </View>

          <View style={{ marginLeft: 20 }}>
            {task.children.map((child) => (
              <TaskNode
                key={child.id}
                task={child}
                onUpdate={(t) => updateChild(t)}
                onDelete={() => deleteChild(child.id)}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  title: { fontSize: 16, fontWeight: "bold" },
  completed: { textDecorationLine: "line-through", color: "gray" },
  addRow: { flexDirection: "row", alignItems: "center", marginVertical: 5 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 6,
    marginRight: 5,
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
});

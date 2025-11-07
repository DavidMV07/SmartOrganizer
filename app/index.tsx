import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import uuid from "react-native-uuid";
import { TaskList } from "../components/TaskList";
import { Task } from "../types";
import { calculateStats } from "../utils/analytics";
import { exportTasksAsJSON } from "../utils/export";
import { loadTasks, saveTasks } from "../utils/storage";


export default function Index() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    (async () => {
      const data = await loadTasks();
      setTasks(data);
    })();
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    let maxDepth = 0;

    tasks.forEach((t) => {
      const s = calculateStats(t);
      total += s.totalTasks ?? 0;
      completed += s.completedTasks ?? 0;
      maxDepth = Math.max(maxDepth, s.maxDepth ?? 0);
    });

    const completionRate = total === 0 ? "0.0%" : ((completed / total) * 100).toFixed(1) + "%";

    return { totalTasks: total, completedTasks: completed, completionRate, maxDepth };
  }, [tasks]);

  const addTask = () => {
    if (newTaskTitle.trim() === "") return;
    const newTask: Task = {
      id: uuid.v4().toString(),
      title: newTaskTitle,
      completed: false,
      children: [],
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };
  const onReorder = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  const onEdit = (id: string) => {
    // Abrir modal de edición para tarea principal
    const target = tasks.find((t) => t.id === id);
    setMainModalTaskId(id);
    setMainModalTitle(target ? target.title : "");
    setMainModalVisible(true);
  };

  const onToggle = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const [subModalVisible, setSubModalVisible] = useState(false);
  const [modalParentId, setModalParentId] = useState<string | null>(null);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Modal para editar tarea principal
  const [mainModalVisible, setMainModalVisible] = useState(false);
  const [mainModalTaskId, setMainModalTaskId] = useState<string | null>(null);
  const [mainModalTitle, setMainModalTitle] = useState("");

  const onAddSubtask = (parentId: string) => {
    setModalParentId(parentId);
    setSubtaskInput("");
    setEditingId(null);
    setEditingText("");
    setSubModalVisible(true);
  };

  const closeSubModal = () => {
    setSubModalVisible(false);
    setModalParentId(null);
    setEditingId(null);
    setEditingText("");
    setSubtaskInput("");
  };

  const handleAddSubtaskSubmit = () => {
    if (!modalParentId) return;
    if (subtaskInput.trim() === "") return;
    const newChild: Task = {
      id: uuid.v4().toString(),
      title: subtaskInput.trim(),
      completed: false,
      children: [],
    };
    setTasks((prev) => prev.map((t) => (t.id === modalParentId ? { ...t, children: [...(t.children || []), newChild] } : t)));
    setSubtaskInput("");
  };

  const handleDeleteSubtask = (childId: string) => {
    if (!modalParentId) return;
    setTasks((prev) => prev.map((t) => (t.id === modalParentId ? { ...t, children: (t.children || []).filter((c) => c.id !== childId) } : t)));
  };

  const handleToggleSubtask = (childId: string) => {
    if (!modalParentId) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === modalParentId
          ? { ...t, children: (t.children || []).map((c) => (c.id === childId ? { ...c, completed: !c.completed } : c)) }
          : t
      )
    );
  };

  const startEditSubtask = (childId: string, currentTitle: string) => {
    setEditingId(childId);
    setEditingText(currentTitle);
  };

  const saveEditSubtask = () => {
    if (!modalParentId || !editingId) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === modalParentId
          ? { ...t, children: (t.children || []).map((c) => (c.id === editingId ? { ...c, title: editingText } : c)) }
          : t
      )
    );
    setEditingId(null);
    setEditingText("");
  };

  const closeMainModal = () => {
    setMainModalVisible(false);
    setMainModalTaskId(null);
    setMainModalTitle("");
  };

  const saveMainModal = () => {
    if (!mainModalTaskId) return;
    setTasks((prev) => prev.map((t) => (t.id === mainModalTaskId ? { ...t, title: mainModalTitle.trim() } : t)));
    closeMainModal();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🧭 Gestor Jerárquico de Tareas</Text>

      <View style={styles.addRow}>
        <TextInput
          placeholder="Nueva tarea principal..."
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          style={styles.input}
        />
        <Button title="Agregar" onPress={addTask} />
      </View>

      {/* Analytics */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsHeader}>📊 Estadísticas</Text>
        <Text>Total tareas: {stats.totalTasks}</Text>
        <Text>Tareas completadas: {stats.completedTasks}</Text>
        <Text>Tasa de completado: {stats.completionRate}</Text>
        <Text>Profundidad máxima: {stats.maxDepth}</Text>
      </View>
      {/* Modal para editar tarea principal */}
      {mainModalVisible && (
        <Modal visible={mainModalVisible} animationType="slide" transparent={true} onRequestClose={closeMainModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar tarea</Text>
              <TextInput placeholder="Título" value={mainModalTitle} onChangeText={setMainModalTitle} style={[styles.input, { marginBottom: 8 }]} />
              <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <Button title="Cancelar" onPress={closeMainModal} />
                <View style={{ width: 8 }} />
                <Button title="Guardar" onPress={saveMainModal} />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal para CRUD de subtareas */}
      {(() => {
        const modalParent = modalParentId ? tasks.find((t) => t.id === modalParentId) : undefined;
        return (
          <Modal visible={subModalVisible} animationType="slide" transparent={true} onRequestClose={closeSubModal}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Subtareas de: {modalParent ? modalParent.title : "-"}</Text>

                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <TextInput
                    placeholder="Nueva subtarea..."
                    value={subtaskInput}
                    onChangeText={setSubtaskInput}
                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                  />
                  <Button title="Añadir" onPress={handleAddSubtaskSubmit} />
                </View>

                <ScrollView style={{ maxHeight: 240, marginBottom: 8 }}>
                  {modalParent && modalParent.children && modalParent.children.length === 0 && (
                    <Text style={{ color: "#666", marginBottom: 8 }}>No hay subtareas.</Text>
                  )}
                  {modalParent &&
                    modalParent.children &&
                    modalParent.children.map((child) => (
                      <View key={child.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        {editingId === child.id ? (
                          <TextInput value={editingText} onChangeText={setEditingText} style={styles.inputSmall} />
                        ) : (
                          <Text style={[child.completed && { textDecorationLine: "line-through", color: "gray" }]}>{child.title}</Text>
                        )}

                        <View style={{ flexDirection: "row" }}>
                          {editingId === child.id ? (
                            <>
                              <Button title="Guardar" onPress={saveEditSubtask} />
                              <View style={{ width: 8 }} />
                              <Button title="Cancelar" onPress={() => { setEditingId(null); setEditingText(""); }} />
                            </>
                          ) : (
                            <>
                              <Button title={child.completed ? "↺" : "✓"} onPress={() => handleToggleSubtask(child.id)} color="#1cae0cff"/>
                              <View style={{ width: 8 }} />
                              <Button title="✎" onPress={() => startEditSubtask(child.id, child.title)} color="#e1bd1dff" />
                              <View style={{ width: 8 }} />
                              <Button title="🗑" onPress={() => handleDeleteSubtask(child.id)} color="#d9534f" />
                            </>
                          )}
                        </View>
                      </View>
                    ))}
                </ScrollView>

                <Button title="Cerrar" onPress={closeSubModal} />
              </View>
            </View>
          </Modal>
        );
      })()}

      <View style={{ flex: 1, width: "100%" }}>
        <TaskList
          tasks={tasks}
          onReorder={onReorder}
          onAddSubtask={onAddSubtask}
          onEdit={onEdit}
          onDelete={deleteTask}
          onToggle={onToggle}
        />
      </View>
      <View style={{ marginBottom: 15 }}>
        <Button title="📤 Exportar todas las tareas (JSON)" onPress={() => exportTasksAsJSON(tasks)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f9fafb" },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  addRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 6,
    marginRight: 8,
  },
  statsContainer: {
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginBottom: 12,
  },
  statsHeader: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 600,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      },
    }),
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  inputSmall: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 6,
    flex: 1,
    marginRight: 8,
  },
});

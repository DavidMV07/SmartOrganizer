import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { Colors, Spacing } from '../constants/theme';
import { Task } from '../types';
import UIButton from './UIButton';

type Props = {
  tasks: Task[];
  onReorder: (tasks: Task[]) => void;
  onAddSubtask: (parentId: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
};

export const TaskList = ({ tasks, onReorder, onAddSubtask, onEdit, onDelete, onToggle }: Props) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Web: simple HTML5 drag & drop via react-native-web
  if (Platform.OS === 'web') {
    const handleDragStart = (e: any, id: string) => {
      try { e.dataTransfer.setData('text/plain', id); } catch { }
    };

    const handleDrop = (e: any, targetId: string) => {
      e.preventDefault();
      let sourceId: string | null = null;
      try { sourceId = e.dataTransfer.getData('text/plain'); } catch { }
      if (!sourceId) return;
      const fromIndex = tasks.findIndex((t) => t.id === sourceId);
      const toIndex = tasks.findIndex((t) => t.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return;
      const newTasks = [...tasks];
      const [moved] = newTasks.splice(fromIndex, 1);
      newTasks.splice(toIndex, 0, moved);
      onReorder(newTasks);
    };

    const renderWebItem = (item: Task) => (
      <Pressable
        // @ts-ignore react-native-web passes these props to DOM
        draggable
        onDragStart={(e: any) => handleDragStart(e, item.id)}
        onDragOver={(e: any) => e.preventDefault()}
        onDrop={(e: any) => handleDrop(e, item.id)}
        key={item.id}
        style={[styles.card, { backgroundColor: Colors.light.card }]}
      >
        <View style={styles.row}>
          <Pressable onPress={() => setExpanded((p) => ({ ...p, [item.id]: !p[item.id] }))}>
            <Text style={[styles.title, item.completed && styles.completed]}>{expanded[item.id] ? '▼' : '▶'} {item.title}</Text>
          </Pressable>

          <View style={styles.actions}>
            <UIButton title={item.completed ? '↺' : '✓'} onPress={() => onToggle(item.id)} variant='check'/>
            <View style={{ width: Spacing.sm }} />
            <UIButton title='＋' onPress={() => onAddSubtask(item.id)} variant='primary' />
            <View style={{ width: Spacing.sm }} />
            <UIButton title='✎' onPress={() => onEdit(item.id)} />
            <View style={{ width: Spacing.sm }} />
            <UIButton title='🗑' onPress={() => onDelete(item.id)} variant='danger' />
          </View>
        </View>

        {expanded[item.id] && item.children && item.children.map((c) => (
          <View key={c.id} style={{ marginLeft: 18, marginTop: 6 }}>
            <Text style={[styles.child, c.completed && styles.completed]}>• {c.title}</Text>
          </View>
        ))}
      </Pressable>
    );

    return <View>{tasks.map((t) => renderWebItem(t))}</View>;
  }

  // Mobile: draggable flatlist powered by gestures
  const renderItem = ({ item, drag, isActive }: RenderItemParams<Task>) => (
    <Pressable
      onLongPress={drag}
      onPressIn={Platform.OS === 'web' ? drag : undefined}
      disabled={isActive}
      style={[styles.card, { backgroundColor: isActive ? Colors.light.tintLight : Colors.light.card }]}
    >
      <View style={styles.row}>
        <Pressable onPress={() => setExpanded((p) => ({ ...p, [item.id]: !p[item.id] }))}>
          <Text style={[styles.title, item.completed && styles.completed]}>{expanded[item.id] ? '▼' : '▶'} {item.title}</Text>
        </Pressable>

        <View style={styles.actions}>
          <UIButton title={item.completed ? '↺' : '✓'} onPress={() => onToggle(item.id)} variant='ghost' />
          <View style={{ width: Spacing.sm }} />
          <UIButton title='＋' onPress={() => onAddSubtask(item.id)} variant='primary' />
          <View style={{ width: Spacing.sm }} />
          <UIButton title='✎' onPress={() => onEdit(item.id)} variant='ghost' />
          <View style={{ width: Spacing.sm }} />
          <UIButton title='🗑' onPress={() => onDelete(item.id)} variant='danger' />
        </View>
      </View>

      {expanded[item.id] && item.children && item.children.map((c) => (
        <View key={c.id} style={{ marginLeft: 18, marginTop: 6 }}>
          <Text style={[styles.child, c.completed && styles.completed]}>• {c.title}</Text>
        </View>
      ))}
    </Pressable>
  );

  return (
    <DraggableFlatList
      data={tasks}
      onDragEnd={({ data }) => onReorder(data)}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
      },
    }),
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: Colors.light.text },
  child: { fontSize: 14, color: Colors.light.text },
  completed: { textDecorationLine: 'line-through', color: Colors.light.muted },
  actions: { flexDirection: 'row', alignItems: 'center' },
});

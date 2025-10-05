'use client'

import { useState } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';

interface Task {
  id: number;
  content: string;
  createdAt: string;
}

interface Tasks {
  backlog: Task[];
  todo: Task[];
  doing: Task[];
  done: Task[];
}

type ColumnId = 'backlog' | 'todo' | 'doing' | 'done';

const COLUMNS = [
  { id: 'backlog' as ColumnId, title: 'Backlog', color: 'bg-gray-100' },
  { id: 'todo' as ColumnId, title: 'Todo', color: 'bg-blue-100' },
  { id: 'doing' as ColumnId, title: 'Doing', color: 'bg-yellow-100' },
  { id: 'done' as ColumnId, title: 'Done', color: 'bg-green-100' }
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Tasks>({
    backlog: [],
    todo: [],
    doing: [],
    done: []
  });
  const [newTask, setNewTask] = useState('');
  const [draggedTask, setDraggedTask] = useState<{ columnId: ColumnId; task: Task } | null>(null);

  const addTask = (columnId: ColumnId) => {
    if (!newTask.trim()) return;
    
    setTasks(prev => ({
      ...prev,
      [columnId]: [...prev[columnId], {
        id: Date.now(),
        content: newTask,
        createdAt: new Date().toISOString()
      }]
    }));
    setNewTask('');
  };

  const deleteTask = (columnId: ColumnId, taskId: number) => {
    setTasks(prev => ({
      ...prev,
      [columnId]: prev[columnId].filter(task => task.id !== taskId)
    }));
  };

  const handleDragStart = (e: React.DragEvent, columnId: ColumnId, task: Task) => {
    setDraggedTask({ columnId, task });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: ColumnId) => {
    e.preventDefault();
    if (!draggedTask) return;

    const { columnId: sourceColumnId, task } = draggedTask;

    if (sourceColumnId === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    setTasks(prev => ({
      ...prev,
      [sourceColumnId]: prev[sourceColumnId].filter(t => t.id !== task.id),
      [targetColumnId]: [...prev[targetColumnId], task]
    }));

    setDraggedTask(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 mb-8">Kanban Board</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLUMNS.map(column => (
            <div
              key={column.id}
              className="bg-white rounded-lg shadow-sm p-4 flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className={`${column.color} rounded-md p-3 mb-4`}>
                <h2 className="font-semibold text-slate-700 text-lg">{column.title}</h2>
                <span className="text-sm text-slate-500">{tasks[column.id].length} tasks</span>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask(column.id)}
                  placeholder="Add new task..."
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => addTask(column.id)}
                  className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto max-h-96">
                {tasks[column.id].map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, column.id, task)}
                    className="bg-white border border-slate-200 rounded-md p-3 cursor-move hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical size={16} className="text-slate-400 mt-1 flex-shrink-0" />
                      <p className="flex-1 text-sm text-slate-700">{task.content}</p>
                      <button
                        onClick={() => deleteTask(column.id, task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 ml-6">
                      {new Date(task.createdAt).toLocaleDateString('zh-TW')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

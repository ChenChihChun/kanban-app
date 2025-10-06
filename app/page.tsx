'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, X, GripVertical, LogOut } from 'lucide-react'

interface Task {
  id: string
  content: string
  status: string
  createdAt: string
}

type ColumnId = 'backlog' | 'todo' | 'doing' | 'done'

const COLUMNS = [
  { id: 'backlog' as ColumnId, title: 'Backlog', color: 'bg-gray-100' },
  { id: 'todo' as ColumnId, title: 'Todo', color: 'bg-blue-100' },
  { id: 'doing' as ColumnId, title: 'Doing', color: 'bg-yellow-100' },
  { id: 'done' as ColumnId, title: 'Done', color: 'bg-green-100' }
]

export default function KanbanBoard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchTasks()
    }
  }, [session])

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks')
    const data = await res.json()
    setTasks(data)
  }

  const addTask = async (columnId: ColumnId) => {
    if (!newTask.trim()) return
    
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newTask, status: columnId })
    })
    
    if (res.ok) {
      setNewTask('')
      fetchTasks()
    }
  }

  const deleteTask = async (taskId: string) => {
    const res = await fetch(`/api/tasks?id=${taskId}`, {
      method: 'DELETE'
    })
    
    if (res.ok) {
      fetchTasks()
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const res = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId, status: newStatus })
    })
    
    if (res.ok) {
      fetchTasks()
    }
  }

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetColumnId: ColumnId) => {
    if (!draggedTask) return
    if (draggedTask.status === targetColumnId) {
      setDraggedTask(null)
      return
    }
    
    updateTaskStatus(draggedTask.id, targetColumnId)
    setDraggedTask(null)
  }

  const getTasksByColumn = (columnId: string) => {
    return tasks.filter(task => task.status === columnId)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-xl text-slate-600">載入中...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">Kanban Board</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              {session.user?.name || session.user?.email}
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              登出
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLUMNS.map(column => (
            <div
              key={column.id}
              className="bg-white rounded-lg shadow-sm p-4 flex flex-col"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div className={`${column.color} rounded-md p-3 mb-4`}>
                <h2 className="font-semibold text-slate-700 text-lg">{column.title}</h2>
                <span className="text-sm text-slate-500">{getTasksByColumn(column.id).length} tasks</span>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask(column.id)}
                  placeholder="新增任務..."
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
                {getTasksByColumn(column.id).map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    className="bg-white border border-slate-200 rounded-md p-3 cursor-move hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical size={16} className="text-slate-400 mt-1 flex-shrink-0" />
                      <p className="flex-1 text-sm text-slate-700">{task.content}</p>
                      <button
                        onClick={() => deleteTask(task.id)}
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
  )
                        }

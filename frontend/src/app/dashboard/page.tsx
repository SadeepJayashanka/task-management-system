"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import TaskCard from "@/components/tasks/TaskCard";
import TaskModal from "@/components/tasks/TaskModal";
import TaskFilters from "@/components/tasks/TaskFilters";
import { Task } from "@/types";
import api from "@/utils/api";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, searchQuery, statusFilter, sortBy]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get("/tasks");
      setTasks(response.data.tasks);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "due_date") {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    setFilteredTasks(filtered);
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      await api.post("/tasks", taskData);
      toast.success("Task created successfully!");
      setIsModalOpen(false);
      fetchTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create task");
    }
  };

  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!selectedTask) return;

    try {
      await api.put(`/tasks/${selectedTask.id}`, taskData);
      toast.success("Task updated successfully!");
      setIsModalOpen(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Task deleted successfully!");
      fetchTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete task");
    }
  };

  const openCreateModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Task
            </button>
          </div>

          <TaskFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No tasks found
              </h3>
              <p className="mt-1 text-gray-500">
                Get started by creating a new task.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={openEditModal}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </div>

        <TaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
          }}
          onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
          task={selectedTask}
        />
      </div>
    </ProtectedRoute>
  );
}

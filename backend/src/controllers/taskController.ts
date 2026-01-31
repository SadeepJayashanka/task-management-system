import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { TaskModel, Task } from "../models/Task";
import { logAction } from "../utils/auditLogger";

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    // Update overdue tasks first
    await TaskModel.updateOverdueTasks();

    let tasks: Task[];

    // Admin can see all tasks, users see only their own
    if (req.user?.role === "Admin") {
      tasks = await TaskModel.findAll();
    } else {
      tasks = await TaskModel.findByUserId(req.user!.id);
    }

    // Apply filters if provided
    const { status, search, sortBy } = req.query;

    if (status) {
      tasks = tasks.filter((task) => task.status === status);
    }

    if (search) {
      tasks = tasks.filter((task) =>
        task.title.toLowerCase().includes((search as string).toLowerCase()),
      );
    }

    if (sortBy === "due_date") {
      tasks.sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
    } else {
      tasks.sort(
        (a, b) =>
          new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime(),
      );
    }

    res.json({ tasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, due_date } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const taskId = await TaskModel.create({
      title,
      description,
      status: status || "Pending",
      due_date,
      user_id: req.user!.id,
    });

    // Log the action
    await logAction(req.user!.id, "CREATE", taskId, `Created task: ${title}`);

    res.status(201).json({
      message: "Task created successfully",
      taskId,
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = parseInt(String(req.params.id), 10);
    const { title, description, status, due_date } = req.body;

    // Check if task exists
    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check ownership (unless admin)
    if (req.user?.role !== "Admin" && task.user_id !== req.user?.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this task" });
    }

    const updated = await TaskModel.update(taskId, {
      title,
      description,
      status,
      due_date,
    });

    if (!updated) {
      return res.status(400).json({ message: "No changes made" });
    }

    // Log the action
    const actionType =
      status && status !== task.status ? "STATUS_CHANGE" : "UPDATE";
    await logAction(
      req.user!.id,
      actionType,
      taskId,
      `Updated task: ${title || task.title}`,
    );

    res.json({ message: "Task updated successfully" });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = parseInt(String(req.params.id), 10);

    // Check if task exists
    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check ownership (unless admin)
    if (req.user?.role !== "Admin" && task.user_id !== req.user?.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this task" });
    }

    // Log before deleting
    await logAction(
      req.user!.id,
      "DELETE",
      taskId,
      `Deleted task: ${task.title}`,
    );

    await TaskModel.delete(taskId);

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Failed to delete task" });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = parseInt(String(req.params.id), 10);
    const task = await TaskModel.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check ownership (unless admin)
    if (req.user?.role !== "Admin" && task.user_id !== req.user?.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this task" });
    }

    res.json({ task });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ message: "Failed to fetch task" });
  }
};

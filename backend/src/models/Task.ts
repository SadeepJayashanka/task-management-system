import { db } from "../config/database";

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
  due_date?: string;
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export class TaskModel {
  static async create(task: Task): Promise<number> {
    const [result]: any = await db.execute(
      "INSERT INTO tasks (title, description, status, due_date, user_id) VALUES (?, ?, ?, ?, ?)",
      [
        task.title,
        task.description,
        task.status || "Pending",
        task.due_date,
        task.user_id,
      ],
    );
    return result.insertId;
  }

  static async findById(id: number): Promise<Task | null> {
    const [rows]: any = await db.execute("SELECT * FROM tasks WHERE id = ?", [
      id,
    ]);
    return rows[0] || null;
  }

  static async findByUserId(userId: number): Promise<Task[]> {
    const [rows]: any = await db.execute(
      "SELECT * FROM tasks WHERE user_id = ?",
      [userId],
    );
    return rows;
  }

  static async findAll(): Promise<Task[]> {
    const [rows]: any = await db.execute(
      "SELECT * FROM tasks ORDER BY created_at DESC",
    );
    return rows;
  }

  static async update(id: number, task: Partial<Task>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (task.title) {
      fields.push("title = ?");
      values.push(task.title);
    }
    if (task.description !== undefined) {
      fields.push("description = ?");
      values.push(task.description);
    }
    if (task.status) {
      fields.push("status = ?");
      values.push(task.status);
    }
    if (task.due_date !== undefined) {
      fields.push("due_date = ?");
      values.push(task.due_date);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result]: any = await db.execute(
      `UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result]: any = await db.execute("DELETE FROM tasks WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  }

  static async updateOverdueTasks(): Promise<void> {
    await db.execute(
      "UPDATE tasks SET status = 'Overdue' WHERE due_date < CURDATE() AND status != 'Completed'",
    );
  }
}

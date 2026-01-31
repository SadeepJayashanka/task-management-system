import { db } from "../config/database";

export interface AuditLog {
  id?: number;
  user_id: number;
  task_id?: number;
  action: "CREATE" | "UPDATE" | "DELETE" | "STATUS_CHANGE";
  timestamp?: Date;
  description: string;
}

export class AuditLogModel {
  static async create(log: AuditLog): Promise<void> {
    await db.execute(
      "INSERT INTO audit_logs (user_id, task_id, action, description) VALUES (?, ?, ?, ?)",
      [log.user_id, log.task_id, log.action, log.description],
    );
  }

  static async findAll(): Promise<AuditLog[]> {
    const [rows]: any = await db.execute(
      "SELECT * FROM audit_logs ORDER BY timestamp DESC",
    );
    return rows;
  }
}

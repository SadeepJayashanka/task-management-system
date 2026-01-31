import { AuditLogModel, AuditLog } from "../models/AuditLog";

export const logAction = async (
  userId: number,
  action: "CREATE" | "UPDATE" | "DELETE" | "STATUS_CHANGE",
  taskId?: number,
  description?: string,
): Promise<void> => {
  try {
    await AuditLogModel.create({
      user_id: userId,
      task_id: taskId,
      action,
      description:
        description || `User ${userId} performed ${action} on task ${taskId}`,
    });
  } catch (error) {
    console.error("Failed to log audit:", error);
  }
};

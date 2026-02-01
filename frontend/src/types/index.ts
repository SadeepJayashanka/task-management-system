export interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "User";
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
  due_date?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface AuditLog {
  id: number;
  user_id: number;
  task_id?: number;
  action: "CREATE" | "UPDATE" | "DELETE" | "STATUS_CHANGE";
  timestamp: string;
  description: string;
}

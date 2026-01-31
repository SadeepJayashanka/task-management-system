import { db } from "../config/database";
import bcrypt from "bcryptjs";

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: "Admin" | "User";
  created_at?: Date;
}

export class UserModel {
  static async create(user: User): Promise<number> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const [result]: any = await db.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [user.name, user.email, hashedPassword, user.role || "User"],
    );
    return result.insertId;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const [rows]: any = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );
    return rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const [rows]: any = await db.execute(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [id],
    );
    return rows[0] || null;
  }
}

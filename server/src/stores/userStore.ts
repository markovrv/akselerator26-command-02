import db from '../database';

const userStmts = {
  findById: db.prepare('SELECT * FROM users WHERE id = ?'),
  findByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  findAll: db.prepare('SELECT * FROM users ORDER BY created_at DESC'),
  findByRole: db.prepare('SELECT * FROM users WHERE role = ? ORDER BY created_at DESC'),
  insert: db.prepare("INSERT INTO users (email, name, role) VALUES (?, ?, ?)"),
  update: db.prepare('UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role), is_active = COALESCE(?, is_active) WHERE id = ?'),
};

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'seeker' | 'student' | 'admin';
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDto {
  email: string;
  name?: string;
  role?: 'seeker' | 'student' | 'admin';
}

export interface UpdateProfileDto {
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  city?: string;
}

class UserStore {
  create(dto: CreateUserDto): User {
    const name = dto.name || dto.email.split('@')[0];
    const role = dto.role || 'seeker';
    const result = userStmts.insert.run(dto.email, name, role);
    return userStmts.findById.get(result.lastInsertRowid) as User;
  }

  findById(id: number): User | undefined {
    return userStmts.findById.get(id) as User | undefined;
  }

  findByEmail(email: string): User | undefined {
    return userStmts.findByEmail.get(email) as User | undefined;
  }

  exists(email: string): boolean {
    return !!userStmts.findByEmail.get(email);
  }

  updateProfile(userId: number, dto: UpdateProfileDto): User | undefined {
    userStmts.update.run(dto.name || null, dto.email || null, dto.role || null, null, userId);
    return this.findById(userId);
  }

  toggleActive(userId: number): User | undefined {
    const user = this.findById(userId);
    if (!user) return undefined;
    userStmts.update.run(null, null, null, user.is_active ? 0 : 1, userId);
    return this.findById(userId);
  }

  getAllUsers(): User[] {
    return userStmts.findAll.all() as User[];
  }

  getUsersByRole(role: string): User[] {
    return userStmts.findByRole.all(role) as User[];
  }
}

export const userStore = new UserStore();

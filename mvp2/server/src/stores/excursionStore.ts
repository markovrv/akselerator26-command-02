import db from '../database';

const excursionStmts = {
  insert: db.prepare(`
    INSERT INTO excursions (enterprise_id, title, description, date_time, excursion_type, address, stream_url, max_participants, available_slots, registration_deadline)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  findById: db.prepare('SELECT * FROM excursions WHERE id = ?'),
  findAll: db.prepare('SELECT * FROM excursions WHERE is_active = COALESCE(?, is_active) ORDER BY date_time'),
  update: db.prepare(`
    UPDATE excursions SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      date_time = COALESCE(?, date_time),
      excursion_type = COALESCE(?, excursion_type),
      address = COALESCE(?, address),
      stream_url = COALESCE(?, stream_url),
      max_participants = COALESCE(?, max_participants),
      available_slots = COALESCE(?, available_slots),
      registration_deadline = COALESCE(?, registration_deadline)
    WHERE id = ?
  `),
  delete: db.prepare('DELETE FROM excursions WHERE id = ?'),
  incrementSlots: db.prepare('UPDATE excursions SET available_slots = available_slots + 1 WHERE id = ?'),
  decrementSlots: db.prepare('UPDATE excursions SET available_slots = available_slots - 1 WHERE id = ? AND available_slots > 0'),
};

const regStmts = {
  insert: db.prepare(`
    INSERT INTO excursion_registrations (user_id, excursion_id, status)
    VALUES (?, ?, ?)
  `),
  findById: db.prepare('SELECT * FROM excursion_registrations WHERE id = ?'),
  findByUser: db.prepare('SELECT * FROM excursion_registrations WHERE user_id = ?'),
  findByExcursion: db.prepare('SELECT * FROM excursion_registrations WHERE excursion_id = ?'),
  findByUserAndExcursion: db.prepare('SELECT * FROM excursion_registrations WHERE user_id = ? AND excursion_id = ?'),
  findAll: db.prepare('SELECT * FROM excursion_registrations ORDER BY registered_at DESC'),
  updateStatus: db.prepare('UPDATE excursion_registrations SET status = ? WHERE id = ?'),
  delete: db.prepare('DELETE FROM excursion_registrations WHERE id = ?'),
};

export interface Excursion {
  id: number;
  enterprise_id: number;
  title: string;
  description: string;
  date_time: string;
  excursion_type: 'online' | 'offline';
  address: string;
  stream_url: string;
  max_participants: number;
  available_slots: number;
  registration_deadline: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface ExcursionRegistration {
  id: number;
  user_id: number;
  excursion_id: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  registered_at: string;
}

export interface CreateExcursionDto {
  enterpriseId: number;
  title: string;
  description?: string;
  dateTime: string;
  excursionType: 'online' | 'offline';
  address?: string;
  streamUrl?: string;
  maxParticipants?: number;
  registrationDeadline?: string;
}

export interface UpdateExcursionDto extends Partial<CreateExcursionDto> {}

class ExcursionStore {
  // Excursions
  create(dto: CreateExcursionDto): Excursion {
    const maxP = dto.maxParticipants || 20;
    const result = excursionStmts.insert.run(
      dto.enterpriseId, dto.title, dto.description || '',
      dto.dateTime, dto.excursionType, dto.address || '',
      dto.streamUrl || '', maxP, maxP, dto.registrationDeadline || ''
    );
    return excursionStmts.findById.get(result.lastInsertRowid) as Excursion;
  }

  getAllExcursions(filters?: { isActive?: boolean; enterpriseId?: number }): Excursion[] {
    if (filters?.enterpriseId) {
      return db.prepare('SELECT * FROM excursions WHERE enterprise_id = ? AND is_active = COALESCE(?, is_active) ORDER BY date_time')
        .all(filters.enterpriseId, filters.isActive !== undefined ? (filters.isActive ? 1 : 0) : null) as Excursion[];
    }
    if (filters?.isActive !== undefined) {
      return excursionStmts.findAll.all(filters.isActive ? 1 : 0) as Excursion[];
    }
    return excursionStmts.findAll.all(null) as Excursion[];
  }

  getExcursionById(id: number): Excursion | undefined {
    return excursionStmts.findById.get(id) as Excursion | undefined;
  }

  updateExcursion(id: number, dto: UpdateExcursionDto): Excursion | undefined {
    excursionStmts.update.run(
      dto.title ?? null, dto.description ?? null, dto.dateTime ?? null,
      dto.excursionType ?? null, dto.address ?? null, dto.streamUrl ?? null,
      dto.maxParticipants ?? null, null, dto.registrationDeadline ?? null, id
    );
    return this.getExcursionById(id);
  }

  deleteExcursion(id: number): boolean {
    const result = excursionStmts.delete.run(id);
    return result.changes > 0;
  }

  // Registrations
  register(userId: number, excursionId: number): ExcursionRegistration | null {
    const excursion = this.getExcursionById(excursionId);
    if (!excursion || excursion.available_slots <= 0) return null;

    // Check duplicate
    const existing = regStmts.findByUserAndExcursion.get(userId, excursionId);
    if (existing) return null;

    // Decrement slots
    const slotResult = excursionStmts.decrementSlots.run(excursionId);
    if (slotResult.changes === 0) return null;

    const result = regStmts.insert.run(userId, excursionId, 'confirmed');
    return regStmts.findById.get(result.lastInsertRowid) as ExcursionRegistration;
  }

  unregister(userId: number, excursionId: number): boolean {
    const reg = regStmts.findByUserAndExcursion.get(userId, excursionId) as ExcursionRegistration | undefined;
    if (!reg) return false;

    regStmts.delete.run(reg.id);
    excursionStmts.incrementSlots.run(excursionId);
    return true;
  }

  getRegistrations(filters?: { userId?: number; excursionId?: number }): ExcursionRegistration[] {
    if (filters?.userId) return regStmts.findByUser.all(filters.userId) as ExcursionRegistration[];
    if (filters?.excursionId) return regStmts.findByExcursion.all(filters.excursionId) as ExcursionRegistration[];
    return regStmts.findAll.all() as ExcursionRegistration[];
  }

  getRegistrationById(id: number): ExcursionRegistration | undefined {
    return regStmts.findById.get(id) as ExcursionRegistration | undefined;
  }

  updateRegistrationStatus(id: number, status: ExcursionRegistration['status']): ExcursionRegistration | undefined {
    regStmts.updateStatus.run(status, id);
    return this.getRegistrationById(id);
  }
}

export const excursionStore = new ExcursionStore();

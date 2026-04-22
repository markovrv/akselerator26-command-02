import db from '../database';

const stmts = {
  insert: db.prepare(`
    INSERT INTO enterprises (name, description, logo_url, contact_email, contact_phone, city, address, website)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  findById: db.prepare('SELECT * FROM enterprises WHERE id = ?'),
  findAll: db.prepare('SELECT * FROM enterprises WHERE is_active = COALESCE(?, is_active) ORDER BY id'),
  update: db.prepare(`
    UPDATE enterprises SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      logo_url = COALESCE(?, logo_url),
      contact_email = COALESCE(?, contact_email),
      contact_phone = COALESCE(?, contact_phone),
      city = COALESCE(?, city),
      address = COALESCE(?, address),
      website = COALESCE(?, website)
    WHERE id = ?
  `),
  delete: db.prepare('DELETE FROM enterprises WHERE id = ?'),
};

export interface Enterprise {
  id: number;
  name: string;
  description: string;
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  city: string;
  address: string;
  website: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEnterpriseDto {
  name: string;
  description?: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  city?: string;
  address?: string;
  website?: string;
}

export interface UpdateEnterpriseDto extends Partial<CreateEnterpriseDto> {}

class EnterpriseStore {
  create(dto: CreateEnterpriseDto): Enterprise {
    const result = stmts.insert.run(
      dto.name, dto.description || '', dto.logoUrl || '',
      dto.contactEmail || '', dto.contactPhone || '', dto.city || '',
      dto.address || '', dto.website || ''
    );
    return stmts.findById.get(result.lastInsertRowid) as Enterprise;
  }

  findById(id: number): Enterprise | undefined {
    return stmts.findById.get(id) as Enterprise | undefined;
  }

  getAll(filters?: { isActive?: boolean }): Enterprise[] {
    if (filters?.isActive !== undefined) {
      return (db.prepare('SELECT * FROM enterprises WHERE is_active = ? ORDER BY id').all(filters.isActive ? 1 : 0) as Enterprise[]);
    }
    return stmts.findAll.all(null) as Enterprise[];
  }

  update(id: number, dto: UpdateEnterpriseDto): Enterprise | undefined {
    stmts.update.run(
      dto.name || null, dto.description ?? null, dto.logoUrl ?? null,
      dto.contactEmail ?? null, dto.contactPhone ?? null, dto.city ?? null,
      dto.address ?? null, dto.website ?? null, id
    );
    return this.findById(id);
  }

  delete(id: number): boolean {
    const result = stmts.delete.run(id);
    return result.changes > 0;
  }
}

export const enterpriseStore = new EnterpriseStore();

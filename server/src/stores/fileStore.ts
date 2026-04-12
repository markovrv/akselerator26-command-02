import db from '../database';

const stmts = {
  insert: db.prepare(`
    INSERT INTO files (filename, original_name, file_type, file_size, mime_type, storage_path, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  findAll: db.prepare('SELECT * FROM files ORDER BY created_at DESC'),
  findById: db.prepare('SELECT * FROM files WHERE id = ?'),
  delete: db.prepare('DELETE FROM files WHERE id = ?'),
};

export interface FileRecord {
  id: number;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  uploaded_by: number | null;
  created_at: string;
}

class FileStore {
  create(dto: Omit<FileRecord, 'id' | 'created_at'>): FileRecord {
    const result = stmts.insert.run(
      dto.filename, dto.original_name, dto.file_type,
      dto.file_size, dto.mime_type, dto.storage_path, dto.uploaded_by
    );
    return stmts.findById.get(result.lastInsertRowid) as FileRecord;
  }

  getAll(): FileRecord[] {
    return stmts.findAll.all() as FileRecord[];
  }

  findById(id: number): FileRecord | undefined {
    return stmts.findById.get(id) as FileRecord | undefined;
  }

  delete(id: number): boolean {
    const result = stmts.delete.run(id);
    return result.changes > 0;
  }
}

export const fileStore = new FileStore();

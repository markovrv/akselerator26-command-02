import db from '../database';

const stmts = {
  insert: db.prepare(`
    INSERT INTO vacancies (enterprise_id, title, description, job_instructions, salary_calculation, salary_min, salary_max, city, requirements, collective_agreement_url, three_d_model_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  findById: db.prepare('SELECT * FROM vacancies WHERE id = ?'),
  findAll: db.prepare('SELECT * FROM vacancies WHERE is_active = COALESCE(?, is_active) ORDER BY id'),
  findByEnterprise: db.prepare('SELECT * FROM vacancies WHERE enterprise_id = ? AND is_active = 1 ORDER BY id'),
  update: db.prepare(`
    UPDATE vacancies SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      job_instructions = COALESCE(?, job_instructions),
      salary_calculation = COALESCE(?, salary_calculation),
      salary_min = COALESCE(?, salary_min),
      salary_max = COALESCE(?, salary_max),
      city = COALESCE(?, city),
      requirements = COALESCE(?, requirements),
      collective_agreement_url = COALESCE(?, collective_agreement_url),
      three_d_model_url = COALESCE(?, three_d_model_url)
    WHERE id = ?
  `),
  delete: db.prepare('DELETE FROM vacancies WHERE id = ?'),
};

export interface Vacancy {
  id: number;
  enterprise_id: number;
  title: string;
  description: string;
  job_instructions: string;
  salary_calculation: string;
  salary_min: number | null;
  salary_max: number | null;
  city: string;
  requirements: string;
  collective_agreement_url: string;
  three_d_model_url: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface CreateVacancyDto {
  enterpriseId: number;
  title: string;
  description?: string;
  jobInstructions?: string;
  salaryCalculation?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  city?: string;
  requirements?: string;
  collectiveAgreementUrl?: string;
  threeDModelUrl?: string;
}

export interface UpdateVacancyDto extends Partial<CreateVacancyDto> {}

class VacancyStore {
  create(dto: CreateVacancyDto): Vacancy {
    const result = stmts.insert.run(
      dto.enterpriseId, dto.title, dto.description || '',
      dto.jobInstructions || '', dto.salaryCalculation || '',
      dto.salaryMin ?? null, dto.salaryMax ?? null,
      dto.city || '', dto.requirements || '',
      dto.collectiveAgreementUrl || '', dto.threeDModelUrl || ''
    );
    return stmts.findById.get(result.lastInsertRowid) as Vacancy;
  }

  findById(id: number): Vacancy | undefined {
    return stmts.findById.get(id) as Vacancy | undefined;
  }

  getAll(filters?: { enterpriseId?: number; city?: string; isActive?: boolean }): Vacancy[] {
    let query = 'SELECT * FROM vacancies WHERE 1=1';
    const params: any[] = [];

    if (filters?.isActive !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.isActive ? 1 : 0);
    }
    if (filters?.enterpriseId) {
      query += ' AND enterprise_id = ?';
      params.push(filters.enterpriseId);
    }
    if (filters?.city) {
      query += ' AND city LIKE ?';
      params.push(`%${filters.city}%`);
    }

    query += ' ORDER BY id';
    return db.prepare(query).all(...params) as Vacancy[];
  }

  getByEnterpriseId(enterpriseId: number): Vacancy[] {
    return stmts.findByEnterprise.all(enterpriseId) as Vacancy[];
  }

  update(id: number, dto: UpdateVacancyDto): Vacancy | undefined {
    stmts.update.run(
      dto.title ?? null, dto.description ?? null, dto.jobInstructions ?? null,
      dto.salaryCalculation ?? null, dto.salaryMin ?? null, dto.salaryMax ?? null,
      dto.city ?? null, dto.requirements ?? null,
      dto.collectiveAgreementUrl ?? null, dto.threeDModelUrl ?? null, id
    );
    return this.findById(id);
  }

  delete(id: number): boolean {
    const result = stmts.delete.run(id);
    return result.changes > 0;
  }
}

export const vacancyStore = new VacancyStore();

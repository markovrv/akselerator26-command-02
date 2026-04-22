const { Vacancy, Enterprise } = require('../models');
const { Op } = require('sequelize');

class VacancyService {
  async getAll(filters = {}) {
    const where = { status: 'published' };

    if (filters.employmentType) {
      where.employmentType = filters.employmentType;
    }
    if (filters.isStudentAvailable !== undefined) {
      where.isStudentAvailable = filters.isStudentAvailable === 'true';
    }

    const include = [{
      model: Enterprise,
      where: { moderationStatus: 'approved' },
      required: true,
    }];

    if (filters.salaryFrom) {
      where.salaryTo = { [Op.gte]: filters.salaryFrom };
    }
    if (filters.city) {
      include[0].where = { ...include[0].where, city: filters.city };
    }

    const vacancies = await Vacancy.findAll({
      where,
      include,
      order: [['publishedAt', 'DESC']],
    });

    return vacancies;
  }

  async getById(id) {
    const vacancy = await Vacancy.findByPk(id, {
      include: [{ model: Enterprise }],
    });

    if (!vacancy) {
      throw { statusCode: 404, message: 'Vacancy not found' };
    }

    return vacancy;
  }

  async create(enterpriseId, data) {
    const enterprise = await Enterprise.findByPk(enterpriseId);
    if (!enterprise) {
      throw { statusCode: 404, message: 'Enterprise not found' };
    }

    const vacancy = await Vacancy.create({
      ...data,
      enterpriseId,
    });
    return vacancy;
  }

  async update(id, data) {
    const vacancy = await Vacancy.findByPk(id);
    if (!vacancy) {
      throw { statusCode: 404, message: 'Vacancy not found' };
    }

    await vacancy.update(data);
    return vacancy;
  }
}

module.exports = new VacancyService();

const { Enterprise, Vacancy, Tour } = require('../models');

class EnterpriseService {
  async getAll(filters = {}) {
    const where = { moderationStatus: 'approved' };

    if (filters.region) {
      where.region = filters.region;
    }
    if (filters.industry) {
      where.industry = filters.industry;
    }
    if (filters.city) {
      where.city = filters.city;
    }

    const enterprises = await Enterprise.findAll({
      where,
      include: [{
        model: Vacancy,
        where: { status: 'published' },
        required: false,
      }],
      order: [['createdAt', 'DESC']],
    });

    return enterprises;
  }

  async getBySlug(slug) {
    const enterprise = await Enterprise.findOne({
      where: { slug },
      include: [
        { model: Vacancy, where: { status: 'published' }, required: false },
        { model: Tour, where: { status: 'open' }, required: false },
      ],
    });

    if (!enterprise) {
      throw { statusCode: 404, message: 'Enterprise not found' };
    }

    return enterprise;
  }

  async getById(id) {
    const enterprise = await Enterprise.findByPk(id, {
      include: [
        { model: Vacancy, where: { status: 'published' }, required: false },
        { model: Tour, where: { status: 'open' }, required: false }
      ]
    });
    if (!enterprise) {
      throw { statusCode: 404, message: 'Enterprise not found' };
    }
    return enterprise;
  }

  async create(data) {
    const enterprise = await Enterprise.create({
      ...data,
      slug: this.generateSlug(data.name),
      moderationStatus: 'draft',
    });
    return enterprise;
  }

  async update(id, data) {
    const enterprise = await Enterprise.findByPk(id);
    if (!enterprise) {
      throw { statusCode: 404, message: 'Enterprise not found' };
    }

    if (data.name && data.name !== enterprise.name) {
      data.slug = this.generateSlug(data.name);
    }

    await enterprise.update(data);
    return enterprise;
  }

  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-zа-яё0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
}

module.exports = new EnterpriseService();

const { Application, Vacancy, Enterprise, User } = require('../models');
const { Op } = require('sequelize');

class ApplicationService {
  async create(userId, vacancyId, type = 'job_application', coverNote = null) {
    const vacancy = await Vacancy.findByPk(vacancyId, {
      include: [{ model: Enterprise }],
    });

    if (!vacancy) {
      throw { statusCode: 404, message: 'Vacancy not found' };
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      where: { userId, vacancyId, status: { [Op.ne]: 'rejected' } },
    });

    if (existingApplication) {
      throw { statusCode: 400, message: 'You have already applied to this vacancy' };
    }

    const application = await Application.create({
      userId,
      vacancyId,
      type,
      coverNote,
      status: 'new',
    });

    return application;
  }

  async getUserApplications(userId) {
    const applications = await Application.findAll({
      where: { userId },
      include: [{
        model: Vacancy,
        include: [{ model: Enterprise }],
      }],
      order: [['createdAt', 'DESC']],
    });

    return applications;
  }

  async getVacancyApplications(vacancyId) {
    const applications = await Application.findAll({
      where: { vacancyId },
      include: [{
        model: User,
        attributes: ['id', 'email'],
        include: ['UserProfile'],
      }],
      order: [['createdAt', 'DESC']],
    });

    return applications;
  }

  async getEnterpriseApplications(enterpriseId) {
    const applications = await Application.findAll({
      include: [{
        model: Vacancy,
        where: { enterpriseId },
        required: true,
        include: [{ model: Enterprise }],
      },
      {
        model: User,
        attributes: ['id', 'email'],
      },
      ],
      order: [['createdAt', 'DESC']],
    });

    return applications;
  }

  async updateStatus(id, status) {
    const application = await Application.findByPk(id);
    if (!application) {
      throw { statusCode: 404, message: 'Application not found' };
    }

    const validStatuses = ['new', 'viewed', 'invited', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      throw { statusCode: 400, message: 'Invalid status' };
    }

    await application.update({ status });
    return application;
  }
}

module.exports = new ApplicationService();

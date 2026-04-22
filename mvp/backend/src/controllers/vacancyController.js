const vacancyService = require('../services/vacancyService');

class VacancyController {
  async getAll(req, res, next) {
    try {
      const vacancies = await vacancyService.getAll(req.query);
      res.json({
        count: vacancies.length,
        vacancies,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const vacancy = await vacancyService.getById(id);
      res.json(vacancy);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const enterpriseId = req.user.enterpriseId; // from JWT or body
      const vacancy = await vacancyService.create(enterpriseId, req.body);
      res.status(201).json(vacancy);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const vacancy = await vacancyService.update(id, req.body);
      res.json(vacancy);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VacancyController();

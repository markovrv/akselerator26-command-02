const enterpriseService = require('../services/enterpriseService');

class EnterpriseController {
  async getAll(req, res, next) {
    try {
      const enterprises = await enterpriseService.getAll(req.query);
      res.json({
        count: enterprises.length,
        enterprises,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const enterprise = await enterpriseService.getBySlug(slug);
      res.json(enterprise);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const enterprise = await enterpriseService.create(req.body);
      res.status(201).json(enterprise);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const enterprise = await enterpriseService.update(id, req.body);
      res.json(enterprise);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EnterpriseController();

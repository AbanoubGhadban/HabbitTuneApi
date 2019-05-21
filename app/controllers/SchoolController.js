const School = require('../models/School');
const config = require('config');

module.exports = {
  index: async(req, res) => {
      const filter = {};
      let {name} = req.query;
      if (name) {
          filter.name = {$regex: `.*${name}.*`, $options: 'i'};
      }

      const perPage = config.get('itemsPerPage');
      const page = parseInt(req.query.page, 1, false);
      
      const results = await School.paginate(filter, {
          customLabels: {docs: 'data'},
          page,
          limit: perPage
      });
      
      res.send(results);
  }
}
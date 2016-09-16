var mongoose = require('mongoose'),
    CDN = mongoose.model('CDN');
var errors = require('./errors');
var globToRegExp = require('glob-to-regexp');
var _ = require('lodash');


module.exports = {
  searchCDN: function (req, res, next) { var query = req.query.query;
    var q = {};
    if (query) {
      q[name] = new RegExp(query, 'i');
    }

    CDN.find(q).lean().exec(function(err, cdns) {
      if (err) {
        return next(new errors.DatabaseError(err));
      }
      res.send({data: cdns});
    });
  },

  getCDN: function (req, res, next) {
    var cdnId = req.params.cdnId;

    CDN.findOne({_id: cdnId}).lean().exec(function(err, cdn) {
      if (err) {
        return next(new errors.DatabaseError(err));
      }
      res.send({data: cdn});
    });
  },

  addCDN: function (req, res, next) {
    var cdn = new CDN(req.body);

    cdn.save(function(err, newCDN) {
      if (err) {
        return next(errors.fromMongoose(err));
      }
      res.status(201).json(newCDN.toJSON());
    })
  }
}

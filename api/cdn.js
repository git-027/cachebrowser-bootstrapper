var mongoose = require('mongoose'),
    CDN = mongoose.model('CDN');
var errors = require('./errors');
var globToRegExp = require('glob-to-regexp');
var _ = require('lodash');


module.exports = {
  searchCDN: function (req, res, next) {
    var query = req.query.query;
    var page = req.query.page;
    var pageSize = req.query.pageSize;

    var q = {};
    if (query) {
      q['name'] = new RegExp(query, 'i');
    }

    CDN
      .find(q)
      .limit(pageSize)
      .skip(page * pageSize)
      .exec(function(err, cdns) {
        if (err) {
          return next(new errors.DatabaseError(err));
        }

        CDN.count(q).exec(function(err, count) {
          if (err) {
            return next(new errors.DatabaseError(err));
          }

          res.send({data: cdns, count: count});
        })
      });
  },

  getCDN: function (req, res, next) {
    var cdnId = req.params.cdnid;

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
  },

  updateCDN: function (req, res, next) {
    var cdn = req.body;
    var cdnid = req.params.cdnid;

    CDN.update({_id: cdnid}, {$set: cdn}, function(err, newCDN) {
      if (err) {
        return next(errors.fromMongoose(err));
      }
      res.status(202).end();
    });
  },

  deleteCDN: function (req, res, next) {
    var cdnid = req.params.cdnid;

    CDN.remove({_id: cdnid}, function(err, newCDN) {
      if (err) {
        return next(errors.fromMongoose(err));
      }
      res.status(202).end();
    })
  }
}

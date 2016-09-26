var mongoose = require('mongoose'),
    Host = mongoose.model('Host');
var errors = require('./errors');
var globToRegExp = require('glob-to-regexp');
var _ = require('lodash');

function executeSearch(query, page, pageSize) {
  return new Promise(function(resolve, reject) {
    var command = Host.find(query);

    if (pageSize > 0) {
      command = command
        .limit(pageSize)
        .skip(page * pageSize);
    }

    command
      .lean()
      .exec(function(err, hosts) {
        if (err) {
          reject(new errors.DatabaseError(err));
        }

        resolve(hosts);
      });
  });
}



module.exports = {
  searchHosts: function (req, res, next) {
    var query = req.query.query;
    var page = req.query.page;
    var pageSize = req.query.pageSize;

    var promise = null;

    if (!query) {
      promise = executeSearch({}, page, pageSize)
        .then(function(hosts) {
          return new Promise((resolve, reject) => {
            Host.count(function(err, count) {
              if (err) {
                reject(new errors.DatabaseError(err));
              }
              resolve({data: hosts, count: count});
            });
          });
        });
    } else {
      var subQuery = '';
      var queryParts = query.split('.');

      if (queryParts.length < 2) {
        var findQuery = {hostname: new RegExp(query, "i")};
        promise = executeSearch(findQuery, page, pageSize)
          .then(function(hosts) {
            return new Promise((resolve, reject) => {
              Host.count(function(err, count) {
                if (err) {
                  reject(new errors.DatabaseError(err));
                }
                resolve({data: hosts, count: count});
              });
            });
          });

      } else {

        promise = executeSearch({main_domain: queryParts.splice(-2).join('.')}, 0, -1)
          .then(function (hosts) {
            var totalCount = hosts.length;
            return {
              data: _.filter(hosts, h => globToRegExp(h.hostname).test(query)),
              count: totalCount
            };
          });
      }
    }

    promise
      .then(function(data) {
        res.send(data);
      })
      .catch(function(err) {
        return next(err);
      })
  },

  getHost: function (req, res, next) {
    var hostname = req.params.hostname;
    hostname = hostname.replace(/_/g, '.');

    var subQuery = '';
    var queryParts = hostname.split('.');
    Host.find({main_domain: queryParts.splice(-2).join('.')})
    .lean().exec(function(err, hosts) {
      if (err) {
        return next(new erros.DatabaseError(err));
      }

      var results = _.filter(hosts, h => globToRegExp(h.hostname).test(hostname));

      if (results.length == 0) {
        return next(new errors.NotFound());
      }

      // TODO return most specific or some other priority
      res.send({data: results[0]});
    });
  },

  addHost: function (req, res, next) {
    var host = new Host(req.body);

    host.save(function(err, newHost) {
      if (err) {
        return next(errors.fromMongoose(err));
      }
      res.status(201).json(newHost.toJSON());
    })
  },

  updateHost: function (req, res, next) {
    var host = req.body;
    var hostname = req.params.hostname;
    hostname = hostname.replace(/_/g, '.');

    console.log(host);

    Host.update({hostname: hostname}, {$set: host}, function(err, newHost) {
      if (err) {
        return next(errors.fromMongoose(err));
      }
      res.status(202).end();
    })
  },

  deleteHost: function (req, res, next) {
    var hostname = req.params.hostname;
    hostname = hostname.replace(/_/g, '.');

    Host.remove({hostname: hostname}, function(err, newHost) {
      if (err) {
        return next(errors.fromMongoose(err));
      }
      res.status(202).end();
    })
  }
}

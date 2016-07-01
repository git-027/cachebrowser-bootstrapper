var mongoose = require('mongoose'),
    Host = mongoose.model('Host');
var errors = require('./errors');
var globToRegExp = require('glob-to-regexp');
var _ = require('lodash');


module.exports = {
    searchHosts: function (req, res, next) {
        var query = req.query.query;

        if (!query) {
            return Host.find().lean().exec(function(err, hosts) {
                if (err) {
                    return next(new errors.DatabaseError(err));
                }
                res.send({data: hosts});
            });
        }

        var subQuery = '';
        var queryParts = query.split('.');

        if (queryParts.length < 2) {
            return Host.find({hostname: new RegExp(query, "i")}).lean()
            .exec(function(err, hosts) {
                if (err) {
                    return next(new erros.DatabaseError(err));
                }
                res.send({data: hosts});
            });
        }

        Host.find({main_domain: queryParts.splice(-2).join('.')})
        .lean().exec(function(err, hosts) {
            if (err) {
                return next(new erros.DatabaseError(err));
            }

            var results = _.filter(hosts, h => globToRegExp(h.hostname).test(query));
            res.send({data: results});
        });
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
    }
}

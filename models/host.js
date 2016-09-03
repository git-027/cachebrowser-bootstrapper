var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HostSchema = new Schema({
    hostname: {type: String, default: '', required: true, trim: true},
    main_domain: {type: String, default: '', required: true, trim: true},
    has_pattern: {type: Boolean, default: false, required: true},
    cdn: {type: String, ref: 'CDN'},
    fronts: [{type: String, default: ''}],
    sni_policy: {type: String, default: null, required: false},
    ssl: {type: Boolean, default: true}
});

HostSchema.virtual('id').get(function() {
    return this._id;
}).set(function (val) {
    this._id = val;
});

HostSchema.set('toJSON', {
    virtuals: true
});

HostSchema.path('hostname').validate(function(v) {
    var hostnameParts = v.split('.');
    if (hostnameParts.length < 2) {
        return false;
    }
    return true;
}, 'Invalid hostname', 'invalid');

HostSchema.path('hostname').validate(function(v) {
    var hostnameParts = v.split('.');
    var mainDomain = hostnameParts.splice(-2).join('.');
    if (mainDomain.indexOf('*') != -1 || mainDomain.indexOf('?') != -1) {
        return false;
    }

    return true;
}, 'Wildcards are only allowed in subdomains.', 'no_wildcards');

HostSchema.pre('validate', function(next) {
    var hostnameParts = this.hostname.split('.');
    this.main_domain = hostnameParts.splice(-2).join('.');

    if (this.hostname.indexOf('*') != -1 || this.hostname.indexOf('?') != -1) {
        this.has_pattern = true;
    } else {
        this.has_pattern = false;
    }

    next();
});

mongoose.model('Host', HostSchema);

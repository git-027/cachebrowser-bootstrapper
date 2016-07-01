var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CDNSchema = new Schema({
    name: {type: String, default: '', required: true, trim: true},
    _id: {type: String, default: '', required: true, trim: true},
    edges: [{type: String, default: '', trim: true}],
    fronts: [{type: String, default: '', trim: true}]
});

CDNSchema.virtual('id').get(function() {
    return this._id;
}).set(function (val) {
    this._id = val;
});

CDNSchema.set('toJSON', {
    virtuals: true
});

mongoose.model('CDN', CDNSchema)

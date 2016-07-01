var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/partial/:name', function(req, res, next) {
    res.render('partials/' + req.params.name);
})

module.exports = router;

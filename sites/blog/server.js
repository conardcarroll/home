// Based on:
// http://howtonode.org/express-mongodb

var express = require('express');
var Blog = require('./blog').Blog;
var Chart = require('./chart').Chart;

var app = module.exports = express.createServer();

var stylus = require('stylus').middleware( {
    src: __dirname + '/public',
    debug: true });

// Configuration

app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(stylus);
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
  app.use(express.errorHandler());
});

// Routes

var blog = new Blog();
blog.init();

var chart = new Chart();
chart.init();

app.get('/', function (req, res) {
  blog.findAll(function (error, posts) {
    res.render('index.ejs', { locals: {
      title: 'Home',
      posts: posts
    }
    });
  });
});

app.get('/blog/new', function (req, res) {
  res.render('blog_new.ejs', { locals: {
    title: 'New Blog Post'
  }
  });
});

app.post('/blog/new', function (req, res) {
  blog.save({
    title: req.param('title'),
    body: req.param('body')
  },
  function () {
    res.redirect('/');
  });
});

app.get('/blog/delete/:id', function (req, res) {
  blog.destroy(req.params.id, function () {
    res.redirect('/');
  });
});

app.get('/blog/:id', function (req, res) {
  blog.findById(req.params.id, function (error, post) {
    if(post == null) {
      post = {};
      post.body = "Nothing";
      post.created_at = "Never";
      post.body = "Undefined";
      post.title = "Not here";
    }
    res.render('blog_show.ejs', {
      locals: {
        title: post.title,
        post: post
      }
    });
  });
});

app.get('/charts', function (req, res) {
  chart.findAll(function (error, charts) {
    res.render('charts.ejs', { locals: {
      title: 'Charts',
      charts: charts
    }
    });
  });
});

app.listen(process.env.port || 1337);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

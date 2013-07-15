
/**
 * Module dependencies.
 */

var express = require('express')
  ,expressValidator = require('express-validator')
  , routes = require('./routes')
  , user = require('./routes/user')
  , servers = require('./routes/servers')
  ,endpoints = require('./routes/endpoints')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(expressValidator());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', servers.list);
app.get('/addServer', servers.addForm);
app.get('/servers/:serverKey', servers.list);
app.get('/servers', servers.list);
app.post('/addServer', servers.add);
app.get('/endpoints/:endpointKey',endpoints.editForm);
app.get('/endpoints/:endpointKey',endpoints.edit);
app.get('/addEndpoint/:serverKey',endpoints.addForm);
app.post('/addEndpoint/:serverKey',endpoints.add);
app.get('/users', user.list);

/*
app.use(function(req, res, next){
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('404', { url: req.url });
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});
*/

app.locals({
    title: 'Service Replicator',
    navBarItems:[
    //{title:"Add Server",path:"addServer"},
    //{title:"Servers",path:"servers"}
    ]
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


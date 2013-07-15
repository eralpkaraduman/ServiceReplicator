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

app.get("/*", endpoints.handle);

app.get('/', servers.list);
app.get('/addServer', servers.addForm);
app.get('/servers/:serverKey', servers.list);
app.get('/servers', servers.list);
app.post('/addServer', servers.add);
app.get('/endpoints/:endpointKey',endpoints.editForm);
app.get('/addEndpoint/:serverKey',endpoints.addForm);
app.post('/addEndpoint/:serverKey',endpoints.add);
app.get('/users', user.list);
app.post('/deleteServer/:serverKey',servers.delete);

app.locals({
    title: 'Service Replicator',
    navBarItems:[
    ]
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


var nStore = require('nStore');
nStore = nStore.extend(require('nstore/query')());
var endpoints = nStore.new('data/endpoints.db',function(){console.log("endpoints loaded")});
var util = require('util');
var servers = require("./servers");
var check = require('validator').check,
    sanitize = require('validator').sanitize;
var url = require("url");

var Validator = require('validator').Validator;


exports.listEndPoints = function(serverKey,callback){

    var serverEndpoints = [];

    endpoints.find({serverKey:serverKey},function (err, results) {

        for (var key in results) {
            var obj = results[key];
            obj.key = key;
            serverEndpoints.push(obj);
        }

        console.log(serverEndpoints);

        callback(serverEndpoints);
    });

}

exports.addForm = function(req,res){
    var serverKey = req.param("serverKey");
    console.log("serverKey "+serverKey);

    if(serverKey){
        servers.getServer(serverKey,function(serverData){



            console.log(serverData);

            servers.getServerList(function (serverList) {

                res.render('addEndpoint',{
                    servers:serverList,
                    server:{
                        key:serverData.key,
                        name:serverData.name
                    }
                });
            });
        });

    }
}

exports.editForm = function(req,res){

    var v = new Validator();
    v.error = function(msg) {
        res.end(msg);
    }

    req.onValidationError(function (msg) {
        res.end(msg);
    });

    var endpointKey = req.param("endpointKey");
    var serverKeyOfEndpoint = null;

    endpoints.all(function (err, results) {
        var allEndpoints = [];
        var allEndpointKeys = [];
        var currentEndpointData = null;

        for (var key in results) {

            var i_endpoint = results[key]
            i_endpoint.key = key;

            allEndpoints[allEndpoints.length] = i_endpoint;
            allEndpointKeys[allEndpointKeys.length] = key;

            if(i_endpoint.key == endpointKey){
                serverKeyOfEndpoint = i_endpoint.serverKey;
                currentEndpointData = i_endpoint;
            }
        }

        console.log("endps "+allEndpointKeys);

        req.assert('endpointKey', 'invalid endpoint key').notEmpty();
        req.assert('endpointKey','endpoint '+endpointKey+' does not exist').isIn(allEndpointKeys);
        v.check(serverKeyOfEndpoint,"invalid server key "+serverKeyOfEndpoint).isAlphanumeric().notNull();

        servers.getServerList(function (serverList) {

            v.check(serverList,"cannot get list of servers ").len(0);
            v.check(serverKeyOfEndpoint,"cannot find server "+serverKeyOfEndpoint).notNull();

            servers.getServer(serverKeyOfEndpoint,function(serverData){

                //console.log("endpoint "+util.inspect(endpoint));

                var params = currentEndpointData;

                params.servers = serverList;
                params.server = {
                    key:serverData.key,
                        name:serverData.name
                };

                res.render('addEndpoint',params);

            });
        });
    });
}

exports.add = function(req,res){

    var serverKey = req.param("serverKey");
    var thisIsNotNullWhenUpdating = null;

    var v = new Validator();
    v.error = function(msg) {
        res.end(msg);
    }

    if(req.param("update")!=null){

        console.log("updating endpoint "+req.param("update"));

        v.check(req.param("update"),"invalid key "+req.param("update")+" to update endpoint").notNull().isAlphanumeric();

        thisIsNotNullWhenUpdating = req.param("update");

    }else if(req.param("delete")!=null){

        console.log("deleting endpoint "+req.param("delete"));

        v.check(req.param("delete"),"invalid key "+req.param("delete")+" to delete endpoint").notNull().isAlphanumeric();

        endpoints.remove(req.param("delete"), function (err) {
            if (err) {
                res.end("could not delete "+err );
            }else{
                res.redirect('/servers/'+serverKey);
            }

        });

    }

    req.onValidationError(function (msg) {
        res.end(msg);
    });


    if(req.param("delete")==null){

        servers.getServerList(function(listOfServers){

            var existingServerKeys = [];
            for(var i=0; i<listOfServers.length; i++){
                existingServerKeys.push(listOfServers[i].key);
            }

            req.assert('serverKey', 'invalid server key').notEmpty();
            req.assert('serverKey','server '+serverKey+' does not exist').isIn(existingServerKeys);
            req.checkBody('path', 'invalid path').notEmpty().notContains("?").notContains("&");
            req.checkBody('defaultResponse', 'invalid defaultResponse').notEmpty();
            req.checkBody('enabled', 'invalid enabled status').notEmpty().isIn(['Enabled','Disabled']);
            req.checkBody('httpStatusCode','invalid HTTP status code').notEmpty().isNumeric();
            req.checkBody('contentType','invalid HTTP status code').notEmpty();


            var newEndpoint = {
                enabled:(req.body.enabled=="Enabled"?true:false),
                path:req.body.path,
                defaultResponse:req.body.defaultResponse,
                serverKey:serverKey,
                httpStatusCode:req.body.httpStatusCode,
                contentType:req.body.contentType
            };

            console.log("thisIsNotNullWhenUpdating "+thisIsNotNullWhenUpdating);

            endpoints.save(thisIsNotNullWhenUpdating,newEndpoint,function(err, key){
                if (err) { throw err; }else{
                    console.log("created endpoint "+key);

                    res.redirect('/servers/'+serverKey);
                }
            });

        });

    }
}

exports.handle = function(req,res, next){

    var pathName = url.parse(req.url).pathname;

    if(pathName){

        pathName =  pathName.substr(1,pathName.length);

    }else{
        next();
        return;
    }

    endpoints.find({path:pathName},function (err, results) {

        if(err){
            next();
        }else{

            for (var key in results) {
                var obj = results[key];

                if(obj.path == pathName){
                    res.writeHead(Number(obj.httpStatusCode), {'content-type':String(obj.contentType)});
                    res.end(obj.defaultResponse);
                    return;
                }

            }
            next();
        }

    });
}
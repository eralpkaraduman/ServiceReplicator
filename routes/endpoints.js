var nStore = require('nStore');
nStore = nStore.extend(require('nstore/query')());
var endpoints = nStore.new('data/endpoints.db',function(){console.log("endpoints loaded")});
var util = require('util');
var servers = require("./servers");
var check = require('validator').check,
    sanitize = require('validator').sanitize;


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
    console.log(serverKey);

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


exports.edit = function(req,res){






}

exports.editForm = function(req,res){

    var Validator = require('validator').Validator;
    var v = new Validator();
    v.error = function(msg) {
        res.end(msg);
    }

    req.onValidationError(function (msg) {
        res.end(msg);
    });


    var endpointKey = req.param("endpointKey");

    endpoints.all(function (err, results) {
        var allEndpoints = [];
        var allEndpointKeys = [];
        var serverKeyOfEndpoint;

        for (var key in results) {

            var endpoint = results[key]
            endpoint.key = key;

            allEndpoints[allEndpoints.length] = endpoint;
            allEndpointKeys[allEndpointKeys.length] = key;

            if(key == endpointKey){
                serverKeyOfEndpoint = endpoint.serverKey;
            }
        }

        console.log("endps "+allEndpointKeys);

        req.assert('endpointKey', 'invalid endpoint key').notEmpty();
        req.assert('endpointKey','endpoint '+endpointKey+' does not exist').isIn(allEndpointKeys);
        v.check(serverKeyOfEndpoint,"invalid server key "+serverKeyOfEndpoint).isAlphanumeric().notNull();

        //servers.getServer()


        servers.getServerList(function (serverList) {



            v.check(serverList,"cannot get list of servers ").len(0);

            servers.getServer(serverKeyOfEndpoint,function(serverData){

                v.check(serverKeyOfEndpoint,"cannot find server "+serverKeyOfEndpoint).notNull();

                console.log("endpoint "+util.inspect(endpoint));

                var params = endpoint;

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

    req.onValidationError(function (msg) {
        res.end(msg);
    });

    servers.getServerList(function(listOfServers){

        var existingServerKeys = [];
        for(var i=0; i<listOfServers.length; i++){
            existingServerKeys.push(listOfServers[i].key);
        }



        console.log(req.body);

        req.assert('serverKey', 'invalid server key').notEmpty();
        req.assert('serverKey','server '+serverKey+' does not exist').isIn(existingServerKeys);
        req.checkBody('path', 'invalid path').notEmpty().notContains("?").notContains("&");
        req.checkBody('defaultResponse', 'invalid defaultResponse').notEmpty();
        req.checkBody('enabled', 'invalid enabled status').notEmpty().isIn(['Enabled','Disabled']);

        var newEndpoint = {
            enabled:(req.body.enabled=="Enabled"?true:false),
            path:req.body.path,
            defaultResponse:req.body.defaultResponse,
            serverKey:serverKey
        }


        endpoints.save(null,newEndpoint,function(err, key){
            if (err) { throw err; }else{
                console.log("created endpoint");
                res.redirect('servers/'+serverKey);
            }
        });


    });



}
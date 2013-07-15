var nStore = require('nstore');
nStore = nStore.extend(require('nstore/query')());
var servers = nStore.new('data/servers.db',function(){console.log("servers loaded")});
var util = require('util');

var endpoints = require('./endpoints');

//var servers = nStore.new('data/servers.db',function(){});

exports.getServer = function(serverKey,callback){

    servers.get(serverKey,function(err,doc,key){
        if(err){
            console.log("getServer error "+err);
            callback(null)
        }else{
            doc.key = key;
            callback(doc);
        }
    });
}

exports.addForm = function(req, res){

    servers.all(function (err, results) {
        var serverList = [];

        for (var key in results) {

            serverList[serverList.length] = {
                key:key,
                name:results[key].name
            }
        }

        res.render('addServer',{servers:serverList});
    });

};

exports.getServerList = function(callback){
    servers.all(function (err, results) {
        var serverList = [];

        for (var key in results) {

            serverList[serverList.length] = {
                key:key,
                name:results[key].name
            }
        }

        callback(serverList);
    });
}

exports.add = function(req, res){

    var serverName = req.body.serverName;
    var newServer = {
        name:serverName
    };

    servers.save(null, newServer, function (err, key) {
        if (err) { throw err; }else{
            console.log("created server");
            res.redirect('servers/'+key);
        }
    });

};

exports.list = function(req, res){

    renderWithListOfservers = function(displayedServerData){
        servers.all(function (err, results) {

            var serverList = [];

            for (var key in results) {

                serverList[serverList.length] = {
                    key:key,
                    name:results[key].name
                }
            }

            if(displayedServerData.key == null && serverList.length>0){
                displayedServerData = serverList[0];
            }

            //console.log("sl "+util.inspect(serverList) );
            //console.log("dsd "+util.inspect(displayedServerData) );

        endpoints.listEndPoints(displayedServerData.key,function(endpointsResult){

                console.log('endpoints '+endpointsResult);

                res.render('servers',{
                    servers:serverList,
                    displayedServer:displayedServerData,
                    endpoints:endpointsResult
                });

            });




        });
    }

    var displayedServerData = {};

    if(req.param("serverKey")){
        console.log("serverKey",req.param("serverKey"));

        servers.get(req.param("serverKey"),function(err,doc,key){

            if(err){
                console.log("can't find server "+key);

            }else{
                console.log("found server "+key);


                displayedServerData.key = key;
                displayedServerData.name = doc.name;

            }

            renderWithListOfservers(displayedServerData);
        });

    }else{
        console.log("no key provided");

        renderWithListOfservers(displayedServerData);
    }




};
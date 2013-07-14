var nStore = require('nStore');
nStore = nStore.extend(require('nstore/query')());
var endpoints = nStore.new('data/endpoints.db',function(){console.log("endpoints loaded")});
var util = require('util');
var servers = require("./servers");

exports.listEndPoints = function(serverKey,callback){

    var serverEndpoints = [];

    endpoints.find({server:serverKey},function (err, results) {

        console.log(util.inspect(results));

        callback(serverEndpoints);

    });

}

exports.add = function(req,res){
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
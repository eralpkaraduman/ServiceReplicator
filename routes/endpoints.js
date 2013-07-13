var nStore = require('nStore');
nStore = nStore.extend(require('nstore/query')());
var endpoints = nStore.new('data/endpoints.db',function(){console.log("endpoints loaded")});
var util = require('util');

exports.listEndPoints = function(serverKey,callback){

    var serverEndpoints = [];

    endpoints.find({server:serverKey},function (err, results) {

        console.log(util.inspect(results));

        callback(serverEndpoints);

    });

}
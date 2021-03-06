var nStore = require('nstore');
nStore = nStore.extend(require('nstore/query')());
var endpoints = nStore.new('data/endpoints.db',function(){});
var util = require('util');
var servers = require("./servers");
var check = require('validator').check,
    sanitize = require('validator').sanitize;
var url = require("url");

var Validator = require('validator').Validator;
var querystring = require('querystring');


exports.listEndPoints = function(serverKey,callback){

    var serverEndpoints = [];

    endpoints.find({serverKey:serverKey},function (err, results) {

        for (var key in results) {
            var obj = results[key];
            obj.key = key;
            serverEndpoints.push(obj);
        }

        //console.log(serverEndpoints);

        callback(serverEndpoints);
    });

}

exports.addForm = function(req,res){
    var serverKey = req.param("serverKey");
    console.log("serverKey "+serverKey);

    if(serverKey){
        servers.getServer(serverKey,function(serverData){

            //console.log(serverData);

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

        //console.log("endps "+allEndpointKeys);

        req.assert('endpointKey', 'invalid endpoint key').notEmpty();
        req.assert('endpointKey','endpoint '+endpointKey+' does not exist').isIn(allEndpointKeys);
        v.check(serverKeyOfEndpoint,"invalid server key "+serverKeyOfEndpoint).isAlphanumeric().notEmpty();

        servers.getServerList(function (serverList) {

            v.check(serverList,"cannot get list of servers ").len(0);
            v.check(serverKeyOfEndpoint,"cannot find server "+serverKeyOfEndpoint).notNull();

            servers.getServer(serverKeyOfEndpoint,function(serverData){

                //console.log("endpoint "+util.inspect(endpoint));



                var params = currentEndpointData;

                var parsedJSON = null;

                try{
                    parsedJSON = JSON.parse(params.defaultResponse);
                }catch(e){
                    console.log("defaultresponse is not json");
                }

                if(parsedJSON){
                    params.defaultResponse = JSON.stringify(parsedJSON,null,4);
                }





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
        res.writeHead(500,{'content-type':'text/html'});
        res.end(msg);
        return;
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

            console.log("existingServerKeys-ho",existingServerKeys);

            req.assert('serverKey', 'invalid server key').notEmpty();
            req.assert('serverKey','server '+serverKey+' does not exist').isIn(existingServerKeys);
            //req.checkBody('path', 'invalid path').notEmpty().notContains("?").notContains("&");
            req.checkBody('defaultResponse', 'invalid defaultResponse').notEmpty();
            req.checkBody('enabled', 'invalid enabled status').notEmpty().isIn(['Enabled','Disabled']);
            req.checkBody('httpStatusCode','invalid HTTP status code').notEmpty().isNumeric();
            req.checkBody('contentType','invalid HTTP status code').notEmpty();
            req.checkBody('delay','invalid delay').notEmpty().isNumeric().min(0);


            if(req.validationErrors()==null){
                var newEndpoint = {
                    enabled:(req.body.enabled=="Enabled"?true:false),
                    path:req.body.path,
                    defaultResponse:req.body.defaultResponse,
                    serverKey:serverKey,
                    httpStatusCode:req.body.httpStatusCode,
                    contentType:req.body.contentType,
                    delay:req.body.delay
                };

                console.log("thisIsNotNullWhenUpdating "+thisIsNotNullWhenUpdating);

                endpoints.save(thisIsNotNullWhenUpdating,newEndpoint,function(err, key){
                    if (err) { throw err; }else{
                        console.log("created endpoint "+key);
                        res.redirect('/servers/'+serverKey);
                    }
                });
            }



        });

    }
}

exports.handlePost = function(req,res,next){

    exports.handle(req,res,next);

}

exports.handle = function(req,res, next){

    var pathName = url.parse(req.url).pathname;

    if(pathName){

        //pathName =  pathName.substr(1,pathName.length);

    }else{
        next();
        return;
    }

    endpoints.find({enabled:true},function (err, results){

        if(err){
            next();
        }else{

            var responseAndParamScores = [];

            for (var key in results) {
                var obj = results[key];

                var obj_pathName = url.parse("http://localhost/"+obj.path).pathname;
                var obj_query = url.parse("http://localhost/"+obj.path).query;



                if(obj_pathName == pathName){

                    var scoreObject = {obj:obj,score:0};

                    var reqURLQuery = url.parse(req.url).query;
                    var reqParams =  querystring.parse(reqURLQuery);
                    var objParams = querystring.parse(obj_query);

                    if(Object.keys(reqParams).length < Object.keys(objParams).length){
                        scoreObject.score--;
                    }

                    if(Object.keys(reqParams).length == 0){ // if has no params it has higher priority for fallback purposes
                        scoreObject.score++;
                    }

                    for (var obj_key in objParams) {
                        var obj_val = objParams[obj_key];
                        var req_val = reqParams[obj_key];


                        if(obj_key in reqParams){
                            scoreObject.score +=3;

                            if(obj_val != req_val){ // if req has wrong answer PUNISH HIM
                                scoreObject.score-=2;
                                if(req_val == null){ // bu if he decided to say nothing, give him a little cheer up
                                    scoreObject.score ++;
                                }
                            }
                        }


                    }

                    responseAndParamScores.push(scoreObject);

                }
            }

            if(responseAndParamScores.length > 0){

                var winner = responseAndParamScores[0];
                if(responseAndParamScores.length>0){
                    for(var i=1; i<responseAndParamScores.length; i++){
                        if(responseAndParamScores[i].score > winner.score ){
                            winner = responseAndParamScores[i];
                        }
                    }
                }

                if(winner.delay==null)winner.delay = 0;
                setTimeout(function(){

                    res.writeHead(Number(winner.obj.httpStatusCode), {
                        'content-Type':String(winner.obj.contentType)+"; charset=utf8"
                    });
                    res.end(winner.obj.defaultResponse);

                },1000*winner.obj.delay);

                return;

            }else{
                next();
            }
        }

    });
}

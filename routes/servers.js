var nStore = require('nstore');
nStore = nStore.extend(require('nstore/query')());
//var servers = nStore.new('data/servers.db',function(){});

exports.addForm = function(req, res){



    res.render('addServer');

};

exports.add = function(req, res){

    var serverName = req.body.serverName;
    var newServer = {
        name:serverName
    };

    var servers = nStore.new('data/servers.db',function(){

        servers.save(null, newServer, function (err, key) {
            if (err) { throw err; }else{
                console.log("saved");
            }

        });

    });

    res.redirect('servers');

};

exports.list = function(req, res){

    var servers = nStore.new('data/servers.db',function(){

        servers.all(function (err, results) {
            //console.log(results);

            res.render('servers',{});
        });

    });



};
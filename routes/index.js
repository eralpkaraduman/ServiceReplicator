var nStore = require('nstore');
var servers = nStore.new('data/servers.db',function(){});

exports.index = function(req, res){

    if(servers){

        //servers.inspect();
        /*
        servers.all(function (err, results) {
            console.log();
        });
        */
    }

    res.render('index',{});

};

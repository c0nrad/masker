'use strict';

var staticServ = require('node-static');

var file = new staticServ.Server('./public');

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(process.env.PORT || 3000);

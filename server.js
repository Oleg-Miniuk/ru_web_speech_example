const static = require('node-static');

const file = new static.Server('./public');

const PORT = 4001;

require('http')
  .createServer(function(request, response) {
    request
      .addListener('end', function() {
        file.serve(request, response);
      })
      .resume();
  })
  .listen(PORT, function() {
    console.log(`server is on ${PORT}`);
  });

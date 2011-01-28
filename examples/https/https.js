var gh = require('grasshopper'),
    fs = require('fs');

gh.secureGet('/', function() {
    this.renderText('Secure response!\n');
});

gh.serveSecure(8080, {
    key: fs.readFileSync('privatekey.pem'),
    cert: fs.readFileSync('certificate.pem')
});

var gh = require('grasshopper');

gh.get('/', function() {
    var auth = this.getAuth();
    if(auth && auth.username == 'chandru' && auth.password == 'pass') {
        this.renderText("You've been successfully authenticated!");
    } else {
        this.challengeAuth('Basic', {realm: 'Some Realm'});
    }
});

gh.serve(8080);

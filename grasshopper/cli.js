#!/usr/bin/env node

var fs = require('fs');

var args = process.argv.slice(2);

while((arg = args.shift()) !== undefined) {
    switch(arg) {
        default:
            var appName = arg;
    }
}

fs.mkdirSync(appName, 0700);
fs.mkdirSync(appName + '/statics', 0700);
fs.mkdirSync(appName + '/views', 0700);
simpleTemplate();

pkg = {
    name: appName,
    version: '1.0.0',
    dependencies: {
        'grasshopper': '0.4.1',
    },
    engines: {
        'node': '>=' + process.versions.node
    }
}
fs.writeFileSync(appName + '/package.json', JSON.stringify(pkg) + '\n');

console.log('Application has been created in ' + process.cwd() + '/' + appName + '.');
console.log("Use 'cd " + appName + " && npm install -d && node boot.js'  to start it.");

function simpleTemplate() {
    fs.writeFileSync(appName + '/views/layout.html', [
        '<html>',
        '    <head>',
        '        <title><%= title %> - ' + appName + '</title>',
        '    </head>',
        '    <body>',
        '        <%= include(view) %>',
        '    </body>',
        '</html>\n'
    ].join('\n'));

    fs.writeFileSync(appName + '/views/index.html', [
        '        <h1>Welcome to ' + appName + '!</h1>\n'
    ].join('\n'));

    fs.writeFileSync(appName + '/routes.js', [
        "var gh = require('grasshopper');\n",
        "gh.get('/', function() {",
        "    this.model.title = 'Home';",
        "    this.render('index');",
        '});\n'
    ].join('\n'));

    fs.writeFileSync(appName + '/boot.js', [
        "var gh = require('grasshopper');\n",
        'gh.configure({',
        "    viewsDir: __dirname + '/views',",
        "    staticsDir: __dirname + '/statics',",
        "    layout: __dirname + '/views/layout',",
        '});\n',
        "require('./routes');\n",
        'gh.serve(8080);\n'
    ].join('\n'));
}

#!/usr/bin/env node

var fs = require('fs');

var args = process.argv.slice(2);
var mvc = false;

while((arg = args.shift()) !== undefined) {
    switch(arg) {
        case '-m':
        case '--mvc':
            mvc = true;
            break;
        default:
            var appName = arg;
    }
}

fs.mkdirSync(appName, 0700);
fs.mkdirSync(appName + '/statics', 0700);
fs.mkdirSync(appName + '/views', 0700);
simpleTemplate();
errorPages();
if(mvc) {
    mvcTemplate();
}

fs.writeFileSync(appName + '/package.json', [
        '{',
        '    "name" : ' + '"' + appName + '",',
        '    "version" : "1.0.0",',
        '    "dependencies" : {',
        '        "grasshopper" : "0.5.0"',
        '    },',
        '    "engines" : {',
        '        "node" : ">=' + process.versions.node + '"',
        '    }',
        '}\n'
    ].join('\n'));

console.log('Application has been created in ' + process.cwd() + '/' + appName + '.');
console.log("Use 'cd " + appName + " && npm install -d && node boot.js'  to start it.");

function simpleTemplate() {
    fs.writeFileSync(appName + '/views/layout.html', [
        '<!doctype html>',
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
        "    layout: __dirname + '/views/layout'",
        '});\n',
        "require('./routes');\n",
        'gh.serve(8080);\n'
    ].join('\n'));
}

function errorPages() {
    fs.writeFileSync(appName + '/views/404.html', [
        '<!doctype html>',
        '<html>',
        '    <head>',
        '        <title>Not Found - ' + appName + '</title>',
        '    </head>',
        '    <body>',
        '        <h1>Not Found!</h1>',
        '    </body>',
        '</html>\n'
    ].join('\n'));

    fs.writeFileSync(appName + '/views/403.html', [
        '<!doctype html>',
        '<html>',
        '    <head>',
        '        <title>Forbidden - ' + appName + '</title>',
        '    </head>',
        '    <body>',
        '        <h1>Forbidden!</h1>',
        '    </body>',
        '</html>\n'
    ].join('\n'));

    fs.writeFileSync(appName + '/views/413.html', [
        '<!doctype html>',
        '<html>',
        '    <head>',
        '        <title>Request Entity Too Large - ' + appName + '</title>',
        '    </head>',
        '    <body>',
        '        <h1>Request Entity Too Large!</h1>',
        '    </body>',
        '</html>\n'
    ].join('\n'));

    fs.writeFileSync(appName + '/views/500.html', [
        '<!doctype html>',
        '<html>',
        '    <head>',
        '        <title>Internal Server Error - ' + appName + '</title>',
        '    </head>',
        '    <body>',
        '        <h1>Internal Server Error!</h1>',
        '<pre style="background-color: #BDBDBD; padding: 10px">',
        '<%= error.stack %>',
        '</pre>',
        '    </body>',
        '</html>\n'
    ].join('\n'));
}

function mvcTemplate() {
    fs.mkdirSync(appName + '/controllers', 0700);
    fs.mkdirSync(appName + '/models', 0700);

    fs.writeFileSync(appName + '/controllers/home.js', [
        "var gh = require('grasshopper');\n",
        "gh.get('/', function() {",
        "    this.model.title = 'Home';",
        "    this.render('index');",
        '});\n'
    ].join('\n'));

    fs.writeFileSync(appName + '/routes.js', [
        "var gh = require('grasshopper');\n",
        "gh.requireAll(__dirname + '/controllers');\n",
    ].join('\n'));
}

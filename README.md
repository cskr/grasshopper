Grasshopper
==========

A feature-rich and flexible MVC framework for web applications and services built on [node.JS](http://nodejs.org/).  Follow the [instructions to install node.JS](http://nodejs.org/#download).  Join the [mailing list](http://groups.google.com/group/grasshopperjs) for further help and feedback.

This framework is licensed under the terms of [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).

Features
--------

* Integrated support for dependency injection.
* Filters for intercepting requests.
* Supports i18n out of the box.
* Handles updation and validation of models from forms.
* Supports on the fly Gzip compression of responses.
* Static files can also be pre-compressed to save compression on each request.
* Supports flash messages.
* Allows adding view helpers to enable smarter views.
* Layout and "include" support for views.
* Automatic selection of view file based on request's extension.
* Support for HTTPS with automatic redirection.
* Supports Basic and Digest authentication.
* Session management with support for custom session storage.
* Simple API to create and consume cookies.
* Fast file uploads using [node-formidable](http://github.com/felixge/node-formidable).
* Configurable form post and upload sizes.
* Makes sending files as response attachments using 'Content-Disposition' simple.
* Supports partial download of static files.
* Supports `if-modified-since`, `if-none-match` and `if-range` headers.
* Plenty of documentation through [examples](http://github.com/tuxychandru/grasshopper/tree/master/examples/) (Wiki will be updated with more tutorials).

Hello World
-----------

1. [Install npm](http://github.com/isaacs/npm#readme).
2. Create a directory for your application.
3. Install grasshopper in the new directory - `npm install grasshopper`.
4. Create a file named `hello.js` in your application's directory with the following content.

        var gh = require('grasshopper');

        gh.get('/', function() {
                this.renderText('Hello World!');
        });

        gh.serve(8080);

5. From your applications directory invoke the command `node hello.js`.
6. Point your browser at http://localhost:8080.

Creating a Project
------------------

1. Install grashopper globally,

    sudo npm install -g grasshopper

2. Create your new project,

    grasshopper <project_name>

3. Install dependencies for the project,

    cd <project_name> && npm install -d

4. Start the server and visit http://localhost:8080,

    node boot.js

Arguments in URL and Template Files
-----------------------------------

Arguments passed as part of the URL can be obtained with an additional parameter in the controller function, to which a hash of arguments defined between `{}` in your route and their values would be passed.

**********
### Template File Format (GHP - GrassHopper Pages)

1. Text inside `<% and %>` are evaluated as Javacript code.
2. Text inside `<%= and %>` are evaluated as Javascript code and its result is included into the output after escaping HTML.
3. Text inside `<%h and %>` are evaluated as Javascript code and its result is included into the output without any modification.
***********

1. Create a file named `greeting.html` in your application's directory with the following content.  This would act as your template file.

        <html>
            <head>
                <title>Template Sample</title>
            </head>
            <body>
                <h1>Welcome, <%= name %>!</h1>
            </body>
        </html>

2. Create a file named `template.js` in your application's directory with the following content.  The 'model' property of 'this' must be setup with the data items used in the template.  The `render` function must be invoked with the name of a template file (without extension).  The extension of the template file to use is determined by the extension of the request URL (`.html`, if none specified).

        var gh = require('grasshopper');

        gh.get('/greetings/{name}', function(args) {
                this.model['name'] = args.name;
                this.render('greeting');
        });

        gh.serve(8080);

4. From your applications directory invoke the command `node template.js`.
5. Point your browser at http://localhost:8080/greetings/ABC.

Dependency Injection
--------------------

Hashes containing the necessary dependencies can be added to the `this` context of your controller functions, using the `gh.addToContext()` function.  You can either specify all the hashes to be included in a single invocation or in multiple invocations.  For example,

    var gh = require('grasshopper');

    var dependencies = {
        dataService: {
            getStock: function() {
                return 100;
            }
        }
    };
    gh.addToContext(dependencies);

    gh.get('/', function() {
        this.renderText('There are ' + this.dataService.getStock() + ' units in stock!');
    });

    gh.serve(8080);

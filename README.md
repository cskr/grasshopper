MVC.js
======

A simple MVC framework for web applications built on [node.JS](http://nodejs.org/).  Follow the [instructions to install node.JS](http://nodejs.org/#download).  Join the [mailing list](http://groups.google.com/group/mvcjs) for further help and feedback.

Hello World
-----------

1. Clone the repository using `git clone git://github.com/tuxychandru/mvc.js.git`.
2. Create a directory for your application and copy the `lib` directory from the cloned repository to it.
3. Create a file named `hello.js` in your application's directory with the following content.

        require.paths.unshift('./lib');

        routes = {}
        routes['get:/'] = function() {
            this.renderText('Hello World!');
        }

        require('mvc').serve(8080, routes);

4. From your applications directory invoke the command `node hello.js`.
5. Point your browser at http://localhost:8080.

Arguments in URL and Template Files
-----------------------------------

Arguments passed as part of the URL can be obtained with an additional parameter in the controller function, to which a hash of arguments defined between `{}` in your route and their values would be passed.

**********
### Template File Format

1. Text inside `<% and %>` are evaluated as Javacript code.
2. Text inside `<%= and %>` are evaluated as Javascript code and its result is included into the output.
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

2. Create a file named `template.js` in your application's directory with the following content.  The `render` function must be invoked with the name of a template file (without extension) and an object whose properties are used to expand the template.  The extension of the template file to use is determined by the extention of the request URL (`.html`, if none specified).

        require.paths.unshift('./lib');

        routes = {}
        routes['get:/greetings/{name}'] = function(args) {
            this.render('greeting', {name: args.name});
        }

        require('mvc').serve(8080, routes);

4. From your applications directory invoke the command `node template.js`.
5. Point your browser at http://localhost:8080/greetings/ABC.

Dependency Injection
--------------------

Hashes containing the necessary dependencies can be added to the `this` context of your controller functions, using the `mvc.addToContext()` function.  You can either specify all the hashes to be included in a single invocation or in multiple invocations.  For example,

    var mvc = require('mvc');

    var dependencies = {
        dataService: {
            getStock: function() {
                return 100;
            }
        }
    }
    mvc.addToContext(dependencies);

    var routes = {}
    routes['get:/'] = function() {
        this.renderText('There are ' + this.dataService.getStock() + ' units in stock!');
    }

    mvc.serve(8080, routes);

To Do
-----

1. Support validation and updation of objects(models) from request parameters.

MVC.js
======

A simple MVC framework for web applications built on [node.JS](http://nodejs.org/).  Follow the [instructions to install node.JS](http://nodejs.org/#download).

Hello World
-----------

1. Clone the repository using `git clone git://github.com/tuxychandru/mvc.js.git`.
2. Create a directory for your application and copy the `lib` directory from the cloned repository to it.
3. Create a file named `hello.js` in your application's directory with the following content.

        routes = {}

        routes['get:/'] = function(ctx) {
            ctx.renderText('Hello World!');
        }

        require('./lib/mvc').serve(8080, routes);

4. From your applications directory invoke the command `node hello.js`.
5. Point your browser at http://localhost:8080.

Arguments in URL and Template Files
-----------------------------------

Arguments passed as part of the URL can be obtained with an additional parameter in the controller function, to which a hash of arguments defined between `{}` in your route and their values would be passed.

1. Create a file named `greeting.html` in your application's directory with the following content.  This would act as your template file.

        <html>
            <head>
                <title>Template Sample</title>
            </head>
            <body>
                <h1>Welcome, {name}!</h1>
            </body>
        </html>

2. Create a file named `template.js` in your application's directory with the following content.  The `render` function must be invoked with the name of a template file (without extension) and an object whose properties are used to expand the template by [JSON Template](http://code.google.com/p/json-template/).  The extension of the template file to use is determined by the extention of the request URL (`.html`, if none specified).

        routes = {}

        routes['get:/greetings/{name}'] = function(ctx, args) {
            ctx.render('greeting', {name: args.name});
        }

        require('./lib/mvc').serve(8080, routes);

4. From your applications directory invoke the command `node template.js`.
5. Point your browser at http://localhost:8080/greetings/ABC.

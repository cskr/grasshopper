var assert = require('assert'),
    ParamParser = require('../../grasshopper/lib/params').ParamParser;

var suite = {name: 'Params Tests'};
exports.suite = suite;

suite.tests = {
    'Simple parameters.': function(next) {
        var parser = new ParamParser();
        parser.addParam('name', 'Product_A');
        parser.addParam('price', '200');
        assert.deepEqual(parser.getParams(), {
            name: 'Product_A',
            price: '200'
        });
        next();
    },

    'Parameters with repeating keys.': function(next) {
        var parser = new ParamParser();
        parser.addParam('names', 'Product_A');
        parser.addParam('names', 'Product_B');
        assert.deepEqual(parser.getParams(), {
            names: ['Product_A', 'Product_B']
        });
        next();
    },

    'Object Parameters.': function(next) {
        var parser = new ParamParser();
        parser.addParam('product.names', 'Product_A');
        parser.addParam('product.names', 'Product_B');
        parser.addParam('product.price', '200');
        assert.deepEqual(parser.getParams(), {
            product: {
                names: ['Product_A', 'Product_B'],
                price: '200'
            }
        });
        next();
    },

    'Object Parameters with nested objects.': function(next) {
        var parser = new ParamParser();
        parser.addParam('product.names', 'Product_A');
        parser.addParam('product.names', 'Product_B');
        parser.addParam('product.price', '200');
        parser.addParam('product.category.names', 'Category_A');
        parser.addParam('product.category.names', 'Category_B');
        parser.addParam('product.category.stock', '1000');
        assert.deepEqual(parser.getParams(), {
            product: {
                names: ['Product_A', 'Product_B'],
                price: '200',
                category: {
                    names: ['Category_A', 'Category_B'],
                    stock: '1000'
                }
            }
        });
        next();
    }
};

if(process.argv[1] == __filename)
    require('../common/ghunit').test(suite);

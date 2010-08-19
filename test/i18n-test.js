var i18n = require('../grasshopper/lib/i18n'),
    assert = require('assert');

exports.name = 'i18n Tests';

exports.tests = {
    'Choose right locale.': function(next) {
        locales = {
            'en-gb': {
                title: 'Colour'
            },
            'en-us': {
                title: 'Color'
            }
        };

        i18n.configure({locales: locales});
        ctx = {
            request: {
                headers: {
                    'accept-language': 'en-gb,en-us'
                }
            }
        };

        i18n.init(ctx);
        assert.equal(ctx.locale, locales['en-gb']);
        next();
    },

    'Fallback to default locale.': function(next) {
        locales = {
            'en-us': {
                title: 'Color'
            }
        };

        i18n.configure({locales: locales});
        ctx = {
            request: {
                headers: {
                    'accept-language': 'en-gb,en-us'
                }
            }
        };

        i18n.init(ctx);
        assert.equal(ctx.locale, locales['en-us']);
        next();
    }
};

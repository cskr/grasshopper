/*
 * Copyright (C) 2010 Chandra Sekar S
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var locales,
    defaultLocale = 'en-us';

exports.configure = function(config) {
    if(config.locales)
        locales = config.locales;
    if(config.defaultLocale)
        defaultLocale = config.defaultLocale;
};

exports.init = function(ctx) {
    if(locales) {
        var acceptLanguage = ctx.request.headers['accept-language'];
        if(acceptLanguage) {
            var ranges = acceptLanguage.split(',');
            for(var i = 0; i < ranges.length; i++) {
                var range = ranges[i].split(';', 1)[0].toLowerCase();
                if(locales[range]) {
                    ctx.locale = locales[range];
                    return;
                }
            }
        }
        ctx.locale = locales[defaultLocale];
    }
};

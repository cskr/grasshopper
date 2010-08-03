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
 *
 * Based On - http://github.com/graphnode/node-template
 */
exports.error = function(model, prop, locale) {
    if(model.errors && model.errors[prop]) {
        error = model.errors[prop][0];
        if(locale) {
            return locale[error];
        } else {
            return error;
        }
    }
}

exports.errors = function(model, prop, locale) {
    var result = [];

    if(model.errors && typeof prop == 'string' && model.errors[prop]) {
        model.errors[prop].forEach(function(err) {
            if(locale) {
                result.push(locale[err]);
            } else {
                result.push(err);
            }
        });
    } else if(model.errors) {
        locale = prop;
        Object.keys(model.errors).forEach(function(prop) {
            model.errors[prop].forEach(function(err) {
                if(locale) {
                    result.push(locale[err]);
                } else {
                    result.push(err);
                }
            });
        });
    }

    return result;
}

exports.postLink = function(attribs) {
    var href = attribs.href,
        text = attribs.text;
    attribs.href = '#';
    attribs.onclick = attribs.onclick || '';
    attribs.onclick += "; f = document.createElement('form'); f.action = '" +
                       href + "'; ";
    if(attribs.target) {
        attribs.onclick += "f.target = '" + attribs.target + "'; ";
        delete attribs.target
    }
    attribs.onclick += "f.method='POST'; this.parentNode.appendChild(f); f.submit(); return false;";
    delete attribs.text;

    return startTag('a', attribs)  + text + endTag('a');
};

exports.booleanCheckbox = function(attribs) {
    var tag = ''
    attribs.type = 'checkbox';
    attribs.value = 'true';
    if(attribs.state) {
        attribs.checked = 'checked';
    }
    delete attribs.state;
    tag += startTag('input', attribs);

    var hattribs = {};
    hattribs.type = 'hidden';
    hattribs.value = '';
    if(attribs.name)
        hattribs.name = attribs.name;

    return tag + startTag('input', hattribs) + endTag('input');
};

exports.collectionSelect = function(attribs) {
    var tag = '';
    var items = attribs.items,
        valueProp = attribs.valueProp,
        labelProp = attribs.labelProp,
        prompt = attribs.prompt,
        value = attribs.value;
    delete attribs.items, delete attribs.valueProp,
    delete attribs.labelProp, delete attribs.prompt,
    delete attribs.value;

    tag += startTag('select', attribs);
    if(prompt) {
        tag += '\n' + startTag('option', {value: ''}) +
               prompt + endTag('option');
    }
    
    var selectedVals = {};
    if(Array.isArray(value)) {
        value.forEach(function(item) {
            addItem(selectedVals, item);
        });
    } else {
        addItem(selectedVals, value);
    }

    items.forEach(function(item) {
        attribs = {};
        var value = item;
        if(valueProp !== undefined && typeof item == 'object') {
            value = item[valueProp]();
        }
        attribs.value = value;
        if(selectedVals[value]) {
            attribs.selected = 'selected';
        }
        tag += '\n' + startTag('option', attribs);
        if(labelProp !== undefined && typeof item == 'object') {
            tag += item[labelProp]();
        } else {
            tag += item.toString();
        }
        tag += endTag('option');
    });

    function addItem(target, item) {
        if(valueProp !== undefined && typeof item == 'object') {
            target[item[valueProp]()] = true;
        } else {
            target[item] = true;
        }
    }
    return tag + '\n' + endTag('select');
};

exports.h = function(html) {
    if(html) {
        return html.
            replace(/&/gmi, '&amp;').
            replace(/"/gmi, '&quot;').
            replace(/>/gmi, '&gt;').
            replace(/</gmi, '&lt;');
    }
}

function startTag(tag, attribs) {
    var attribStr = '';
    Object.keys(attribs).forEach(function(attrib) {
        attribStr += ' ' + attrib + '="' + attribs[attrib].toString() + '"';
    });
    return '<' + tag + attribStr + '>';
}

function endTag(tag) {
    return '</' + tag + '>';
}

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
exports.api = {};

exports.api.initModel = function(modelCtor, props) {
    modelCtor.props = {};
    for(var i = 1; i < arguments.length; i++) {
        modelCtor.props[arguments[i]] = true;
        modelCtor.prototype[arguments[i]] = new Function('val',
            "if(val !== undefined) {" +
                "this._" + arguments[i] + " = val;" +
                "return this;" +
            "} else {" +
                "return this._" + arguments[i] + ";" +
            "}"
        );
    }

    modelCtor.prototype.update = update;
    modelCtor.prototype.isValid = isValid;
    modelCtor.prototype.addError = addError;
    modelCtor.prototype.validateRequired = validateRequired;
    modelCtor.prototype.validateLength = validateLength;
    modelCtor.prototype.validateNumeric = validateNumeric;
    modelCtor.prototype.validateDate = validateDate;
    modelCtor.prototype.validatePattern = validatePattern;

    return modelCtor;
};

function update(props, converter, complete) {
    var self = this, propsDone = 0;
    var keys = Object.keys(props);
    if(keys.length == 0) {
        incProceed();
    }
    keys.forEach(function(prop) {
        var propVal = props[prop];
        if(Array.isArray(propVal) || prop.substring(0, 1) == '*') {
            if(prop.substring(0, 1) == '*') {
                var makeArray = true;
                prop = prop.substring(1);
            } else {
                var breakArray = true;
            }
        }
        if(!self.constructor.props[prop]) {
            return;
        }

        function setProp() {
            if(breakArray && propVal.length > 0) {
                self[prop](propVal[0]);
            } else {
                self[prop](makeArray && !Array.isArray(propVal) ? [propVal] : propVal);
            }
            incProceed();
        }

        if(!converter) {
            setProp();
        } else {
            converter(prop, propVal, function(value) {
                if(value !== undefined) {
                    self[prop](value);
                    incProceed();
                } else {
                    setProp();
                }
            });
        }
    });

    function incProceed() {
        if(++propsDone >= keys.length) {
            self.errors = undefined;
            if(typeof self.validate == 'function') {
                self.validate();
            }
            if(complete) {
                complete();
            }
        }
    }
    return this;
}

function isValid() {
    return !this.errors;
}

function addError(propName, error, prefix) {
    if(prefix === undefined)
        prefix = true;
    if(prefix)
        error = this.constructor.name + '.' + propName + '.' + error;
    getErrors(this, propName).push(error);
}

function validateRequired(propName, error, prefix) {
    if(typeof error == 'boolean') {
        prefix = error;
        error = 'required';
    } else {
        error = error || 'required';
    }
    if(!this[propName]()) {
        this.addError(propName, error, prefix);
    }
    if(Array.isArray(this[propName]()) && this[propName]().length == 0) {
        this.addError(propName, error, prefix);
    }
}

function validateLength(propName, min, max, error, prefix) {
    if(typeof error == 'boolean') {
        prefix = error;
        error = 'length';
    } else {
        error = error || 'length';
    }

    if(this[propName]() !== undefined && this[propName]() !== null
        && (this[propName]().length < min || this[propName]().length > max)) {
        this.addError(propName, error, prefix);
    }
}

function validateNumeric(propName, error, prefix) {
    if(typeof error == 'boolean') {
        prefix = error;
        error = 'numeric';
    } else {
        error = error || 'numeric';
    }
    if(Number(this[propName]()).toString() == 'NaN') {
        this.addError(propName, error, prefix);
    }
}

function validateDate(propName, error, prefix) {
    if(typeof error == 'boolean') {
        prefix = error;
        error = 'date';
    } else {
        error = error || 'date';
    }
    if(new Date(this[propName]()) == 'Invalid Date') {
        this.addError(propName, error, prefix);
    }
}

function validatePattern(propName, pattern, error, prefix) {
    if(typeof error == 'boolean') {
        prefix = error;
        error = 'pattern';
    } else {
        error = error || 'pattern';
    }
    if(!pattern.test(this[propName]())) {
        this.addError(propName, error, prefix);
    }
}

function getErrors(model, propName) {
    if(!model.errors) {
        model.errors = {};
    }
    if(!model.errors[propName]) {
        model.errors[propName] = [];
    }
    return model.errors[propName];
}

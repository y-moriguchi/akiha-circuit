/*
 * akiha-circuit
 *
 * Copyright (c) 2019 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
var undef = void 0;

function isArray(anObject) {
    return Object.prototype.toString.call(anObject) === '[object Array]';
}

function deepcopy(anObject) {
    var result;

    function copyAll() {
        var i;

        for(i in anObject) {
            if(anObject.hasOwnProperty(i)) {
                result[i] = deepcopy(anObject[i]);
            }
        }
    }

    if(isArray(anObject)) {
        result = [];
        copyAll();
        return result;
    } else if(typeof anObject === 'object' && anObject !== null) {
        result = {};
        copyAll();
        return result;
    } else {
        return anObject;
    }
}

var UNIT = {
    "k": 1000,
    "M": 1000000,
    "G": 1000000000,
    "T": 1000000000000,
    "m": 0.001,
    "u": 0.000001,
    "µ": 0.000001,
    "n": 0.000000001,
    "p": 0.000000000001
};

function convertEngineerUnit(text) {
    var unit = text.charAt(text.length - 1);

    if(UNIT[unit]) {
        return parseFloat(text.substring(0, text.length - 1)) * UNIT[unit];
    } else {
        return parseFloat(text);
    }
}

function toStringEngineerUnit(val) {
    function toStringVal(val, unit) {
        return (val / UNIT["T"]).toString() + "T";
    }

    if(val > UNIT["T"]) {
        return toStringVal(val, "T");
    } else if(val > UNIT["G"]) {
        return toStringVal(val, "G");
    } else if(val > UNIT["M"]) {
        return toStringVal(val, "M");
    } else if(val > UNIT["k"]) {
        return toStringVal(val, "k");
    } else if(val > 1) {
        return val.toString();
    } else if(val > UNIT["m"]) {
        return toStringVal(val, "m");
    } else if(val > UNIT["u"]) {
        return toStringVal(val, "u");
    } else if(val > UNIT["n"]) {
        return toStringVal(val, "n");
    } else {
        return toStringVal(val, "p");
    }
}

function extend(base, child) {
    var result = {},
        i;

    for(i in base) {
        if(base.hasOwnProperty(i)) {
            result[i] = base[i];
        }
    }

    for(i in child) {
        if(child.hasOwnProperty(i)) {
            result[i] = child[i];
        }
    }
    return result;
}

function I(x) {
    return x;
}

function replaceTemplateFunction(template, setting, interprocess, postprocess) {
    function replaceStr(str, prop) {
        if(typeof setting[prop] === 'object') {
            return JSON.stringify(setting[prop], null, 2);
        } else {
            return interprocess(setting[prop]);
        }
    }

    return postprocess(template.replace(/@([^@\n]+)@/g, replaceStr));
}

function replaceTemplate(template, setting) {
    return replaceTemplateFunction(template, setting, I, I);
}

function replaceTemplateRegExp(template, setting, opt) {
    function escapeRE(x) {
        var result = x;
        result = result.replace(/\\/, "\\\\");
        result = result.replace(/\//, "\\/");
        return result;
    }

    function post(x) {
        return new RegExp(x, opt);
    }

    return replaceTemplateFunction(template, setting, escapeRE, post);
}

module.exports = {
    isArray: isArray,
    deepcopy: deepcopy,
    convertEngineerUnit: convertEngineerUnit,
    extend: extend,
    replaceTemplate: replaceTemplate,
    replaceTemplateRegExp: replaceTemplateRegExp
};


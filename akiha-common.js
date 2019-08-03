/*
 * akiha-circuit
 *
 * Copyright (c) 2019 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
var undef = void 0;

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
    extend: extend,
    replaceTemplate: replaceTemplate,
    replaceTemplateRegExp: replaceTemplateRegExp
};


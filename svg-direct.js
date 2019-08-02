/*
 * akiha-circuit
 *
 * Copyright (c) 2019 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
function createSvgNode(ns, type) {
    var me,
        attrs = {},
        children = [];

    me = {
        setAttribute: function(attr, value) {
            attrs[attr] = value;
        },

        appendChild: function(child) {
            children.push(child);
        },

        toString: function() {
            var result = "",
                i;

            function putAttr(key, value) {
                result += " ";
                result += key;
                result += "=\"";
                result += value.toString();
                result += "\"";
            }

            result += "<";
            result += type;
            for(i in attrs) {
                if(attrs.hasOwnProperty(i)) {
                    putAttr(i, attrs[i]);
                }
            }
            if(ns && type === "svg") {
                putAttr("xmlns", ns);
            }
            result += ">\n";

            for(i = 0; i < children.length; i++) {
                result += children[i].toString();
                result += "\n";
            }
            if(me.textContent) {
                result += me.textContent;
            }

            result += "</";
            result += type;
            result += ">";
            return result;
        }
    };
    return me;
}

function createSvg() {
    var me;

    me = {
        createNode: function(type) {
            return createSvgNode("http://www.w3.org/2000/svg", type);
        },

        createCanvas: function(x, y) {
            var node = me.createNode("svg");

            node.setAttribute("width", x);
            node.setAttribute("height", y);
            return node;
        }
    };
    return me;
}

module.exports = createSvg;


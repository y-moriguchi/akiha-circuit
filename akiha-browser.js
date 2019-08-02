/*
 * akiha-circuit
 *
 * Copyright (c) 2019 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
var akiha = require("./akiha-parser.js");
var drawCircuit = require("./akiha-draw.js");
var drawSvgLib = require("./akiha-svg.js");
var drawSvgBaseLib = require("./svg-base.js");
var drawSvgConcreteLib = require("./svg-browser.js");
var opt = {
    scriptType: "text/x-akiha-circuit"
};

function createNode(prog) {
    var loops = akiha.parse(prog);
    var drawSvgConcrete = drawSvgBaseLib(drawSvgConcreteLib);
    var drawSvg = drawSvgLib(loops.xMaxNodes, loops.yMaxNodes, drawSvgConcrete);

    console.log(drawSvgConcrete);
    console.log(loops);
    drawCircuit(loops.loops, drawSvg);
    return drawSvg.getCanvas();
}

function replaceChildNode(node, text) {
    var result,
        divNode;

    result = createNode(text);
    divNode = document.createElement("div");
    divNode.appendChild(result);
    node.parentNode.replaceChild(divNode, node);
}

document.addEventListener("DOMContentLoaded", function(e) {
    var i,
        scriptNodes;

    scriptNodes = document.getElementsByTagName("script");
    for(i = 0; i < scriptNodes.length;) {
        if(scriptNodes[i].type === opt.scriptType) {
            replaceChildNode(scriptNodes[i], scriptNodes[i].text);
        } else {
            i++;
        }
    }
});


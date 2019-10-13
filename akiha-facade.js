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

function createNode(prog, drawSvgConcreteLib, option) {
    var loops = akiha.parse(prog);
    var drawSvgConcrete = drawSvgBaseLib(drawSvgConcreteLib);
    var drawSvg = drawSvgLib(loops.xMaxNodes, loops.yMaxNodes, drawSvgConcrete, option);

    drawCircuit(loops.loops, drawSvg);
    return drawSvg.getCanvas();
}

module.exports = {
    createSvg: createNode
};

(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*
 * akiha-circuit
 *
 * Copyright (c) 2019 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
var akiha = require("./akiha-facade.js");
var drawSvgConcreteLib = require("./svg-browser.js");
var opt = {
    scriptType: "text/x-akiha-circuit",
    configType: "text/x-akiha-circuit-config"
};
var svgOption = null;

function replaceChildNode(node, text) {
    var result,
        divNode;

    result = akiha.createSvg(text, drawSvgConcreteLib, svgOption);
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
        } else if(scriptNodes[i].type === opt.configType) {
            svgOption = JSON.parse(scriptNodes[i].text);
            i++;
        } else {
            i++;
        }
    }
});


},{"./akiha-facade.js":4,"./svg-browser.js":8}],2:[function(require,module,exports){
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


},{}],3:[function(require,module,exports){
/*
 * akiha-circuit
 *
 * Copyright (c) 2019 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
var undef = void 0;

function draw(loops, drawer) {
    var i,
        j,
        k,
        drawn = [],
        drawnPoints = [],
        drawSerial = [];

    function isSamePosition(point1, point2) {
        return point1.x === point2.x && point1.y === point2.y;
    }

    function createSideLength(attrName) {
        var me,
            sideLength = [];
        me = {
            setLength: function(point1, point2, length) {
                var p1 = point1[attrName] < point2[attrName] ? point1[attrName] : point2[attrName],
                    p2 = point1[attrName] >= point2[attrName] ? point1[attrName] : point2[attrName],
                    len = length / (p2 - p1) < 1 ? 1 : length / (p2 - p1),
                    i;

                for(i = p1; i < p2; i++) {
                    if(sideLength[i] === undef) {
                        sideLength[i] = len;
                    } else {
                        sideLength[i] = sideLength[i] < len ? len : sideLength[i];
                    }
                }
            },

            getLength: function(point1, point2) {
                var p1 = point1[attrName] < point2[attrName] ? point1[attrName] : point2[attrName],
                    p2 = point1[attrName] >= point2[attrName] ? point1[attrName] : point2[attrName],
                    i,
                    result = 0;

                for(i = p1; i < p2; i++) {
                    result += sideLength[i];
                }
                return result;
            }
        };
        return me;
    }

    function createSideLengthXY(loops) {
        var me,
            i,
            j,
            nowLength,
            nowPoint,
            drawTerminal,
            sideLengthX = createSideLength("x"),
            sideLengthY = createSideLength("y");

        for(i = 0; i < loops.length; i++) {
            nowPoint = loops[i][0];
            nowLength = 1;
            for(j = 1; j < loops[i].length; j++) {
                if(isSamePosition(loops[i][j], nowPoint)) {
                    nowLength += 1;
                } else if(loops[i][j].x === nowPoint.x) {
                    sideLengthY.setLength(nowPoint, loops[i][j], nowLength);
                    nowPoint = loops[i][j];
                    nowLength = 1;
                } else {
                    sideLengthX.setLength(nowPoint, loops[i][j], nowLength);
                    nowPoint = loops[i][j];
                    nowLength = 1;
                }
            }
        }

        me = {
            getLength: function(point1, point2) {
                return {
                    x: sideLengthX.getLength(point1, point2),
                    y: sideLengthY.getLength(point1, point2)
                };
            }
        };
        return me;
    }

    function isSideDrawn(side1, side2) {
        var i;

        for(i = 0; i < drawn.length; i++) {
            if((isSamePosition(drawn[i][0], side1) && isSamePosition(drawn[i][1], side2)) ||
                    (isSamePosition(drawn[i][1], side1) && isSamePosition(drawn[i][0], side2))) {
                return true;
            }
        }
        return false;
    }

    function isPointDrawn(point) {
        var i;

        for(i = 0; i < point.length; i++) {
            if(isSamePosition(drawnPoints[i], point)) {
                return true;
            }
        }
        return false;
    }

    drawer.setSideLength(createSideLengthXY(loops));
    for(i = 0; i < loops.length; i++) {
        drawSerial = [];
        for(j = 0; j < loops[i].length - 1; j++) {
            drawSerial.push(loops[i][j]);
            if(!isSamePosition(loops[i][j], loops[i][j + 1])) {
                if(!isSideDrawn(loops[i][j], loops[i][j + 1])) {
                    drawTerminal = false;
                    if(!isPointDrawn(loops[i][j])) {
                        drawnPoints.push(loops[i][j]);
                        if(loops[i][j].terminal) {
                            drawTerminal = true;
                        } else if(!loops[i][j].noNode && loops[i][j].neighbor > 2) {
                            drawer.drawJoint(loops[i][j]);
                        }
                    }

                    drawn.push([loops[i][j], loops[i][j + 1]]);
                    for(k = 0; k < drawSerial.length; k++) {
                        if(drawSerial[k].voltage !== undef) {
                            drawer.drawBattery(drawSerial[k], loops[i][j + 1], k, drawSerial.length);
                        } else if(drawSerial[k].resist !== undef) {
                            drawer.drawResistor(drawSerial[k], loops[i][j + 1], k, drawSerial.length);
                        } else if(drawSerial[k].capacitance !== undef) {
                            drawer.drawCapacitor(drawSerial[k], loops[i][j + 1], k, drawSerial.length);
                        } else if(drawSerial[k].inductance !== undef) {
                            drawer.drawInductor(drawSerial[k], loops[i][j + 1], k, drawSerial.length);
                        } else if(drawSerial[k].voltageAC !== undef) {
                            drawer.drawVoltageAC(drawSerial[k], loops[i][j + 1], k, drawSerial.length);
                        } else if(drawSerial[k].current !== undef) {
                            drawer.drawCurrent(drawSerial[k], loops[i][j + 1], k, drawSerial.length);
                        } else if(drawSerial[k].sw !== undef) {
                            drawer.drawSwitch(drawSerial[k], loops[i][j + 1], k, drawSerial.length);
                        } else if(!drawSerial[k].noWire) {
                            drawer.drawLine(drawSerial[k], loops[i][j + 1], k, drawSerial.length);
                        }
                    }

                    if(drawTerminal) {
                        drawer.drawTerminal(loops[i][j]);
                    }
                }
                drawSerial = [];
            }
        }
    }
}

module.exports = draw;


},{}],4:[function(require,module,exports){
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

},{"./akiha-draw.js":3,"./akiha-parser.js":5,"./akiha-svg.js":6,"./svg-base.js":7}],5:[function(require,module,exports){
/*
 * akiha-circuit
 *
 * Copyright (c) 2019 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
var common = require("./akiha-common.js");
var returnMachine,
    undef = void 0,
    BOUND = -1,
    UP = { x:0, y:-1 },
    RIGHT = { x:1, y:0 },
    DOWN = { x:0, y:1 },
    LEFT = { x:-1, y:0 };

function log(message) {
    //console.log(message);
}

function isNode(ch) {
    return ch !== BOUND && /[\*\+ox]/.test(ch);
}

function quadro(inputString) {
    var TURN = [UP, RIGHT, DOWN, LEFT],
        input = inputString.split(/\r\n|\r|\n/),
        i,
        j,
        xNow = 1,
        yNow = 1,
        direction = 0,
        maxLength = 0,
        cellMatrix = [],
        me;

    function drawBound(y) {
        var j;

        cellMatrix[y] = [];
        for(j = 0; j < maxLength; j++) {
            cellMatrix[y][j] = { ch: BOUND };
        }
        cellMatrix[y][j + 1] = { ch: BOUND };
    }

    for(i = 0; i < input.length; i++) {
        maxLength = maxLength < input[i].length ? input[i].length : maxLength;
    }
    maxLength += 2;

    for(i = 0; i < input.length; i++) {
        cellMatrix[i + 1] = [];
        cellMatrix[i + 1][0] = { ch: BOUND };
        for(j = 0; j < maxLength - 2; j++) {
            cellMatrix[i + 1][j + 1] = {
                ch: j < input[i].length ? input[i].charAt(j) : ' '
            };
        }
        cellMatrix[i + 1][j + 1] = { ch: BOUND };
    }
    drawBound(0);
    drawBound(i + 1);

    me = {
        getChar: function(xoffset, yoffset) {
            return me.get(xoffset, yoffset).ch;
        },

        isWhitespace: function(xoffset, yoffset) {
            var ch = me.getChar(xoffset, yoffset);

            return ch === BOUND || /[ ]/.test(ch);
        },

        get: function(xoffset, yoffset) {
            if(xoffset === undef || yoffset === undef) {
                return cellMatrix[yNow][xNow];
            } else if(xNow + xoffset < 0 || xNow + xoffset >= maxLength || yNow + yoffset < 0 || yNow + yoffset >= cellMatrix.length) {
                return { ch: BOUND };
            } else {
                return cellMatrix[yNow + yoffset][xNow + xoffset];
            }
        },

        getForward: function(offset) {
            return me.get(TURN[direction].x * offset, TURN[direction].y * offset);
        },

        move: function(direction) {
            xNow += direction.x;
            yNow += direction.y;
            if(xNow < 0) {
                xNow = 0;
            } else if(xNow >= maxLength) {
                xNow = maxLength - 1;
            }
            if(yNow < 0) {
                yNow = 0;
            } else if(yNow >= cellMatrix.length) {
                yNow = cellMatrix.length - 1;
            }
            return me;
        },

        moveForward: function() {
            return me.move(TURN[direction]);
        },

        moveBackward: function() {
            return me.move(TURN[(direction + 2) % 4]);
        },

        moveCrLf: function() {
            xNow = 1;
            return me.move(DOWN);
        },

        moveInit: function() {
            xNow = yNow = 1;
            return me;
        },

        direction: function(dir) {
            var i = 0;

            for(i = 0; i < TURN.length; i++) {
                if(TURN[i] === dir) {
                    direction = i;
                    return me;
                }
            }
            throw new Error("invaild direction");
        },

        getDirection: function() {
            return TURN[direction];
        },

        isDirectionHorizontal: function() {
            return me.getDirection() === LEFT || me.getDirection() === RIGHT;
        },

        isDirectionVertical: function() {
            return me.getDirection() === UP || me.getDirection() === DOWN;
        },

        turnRight: function() {
            direction++;
            if(direction >= 4) {
                direction = 0;
            }
            return me;
        },

        turnLeft: function() {
            direction--;
            if(direction < 0) {
                direction = 3;
            }
            return me;
        },

        getPosition: function() {
            return {
                x: xNow,
                y: yNow,
                direction: direction
            };
        },

        setPosition: function(position) {
            xNow = position.x;
            yNow = position.y;
            direction = position.direction;
            return me;
        },

        loops: [],
        loopNew: function() {
            me.loops.push([]);
            return me;
        },

        loopAdd: function(nodeType) {
            var neighbor = 0,
                terminal,
                noNode,
                terminalLabelLeft = "",
                terminalLabelRight = "";

            neighbor += me.isWhitespace(1, 0) ? 0 : 1;
            neighbor += me.isWhitespace(-1, 0) ? 0 : 1;
            neighbor += me.isWhitespace(0, 1) ? 0 : 1;
            neighbor += me.isWhitespace(0, -1) ? 0 : 1;
            if(nodeType === "o") {
                terminal = true;
            } else if(nodeType === "x") {
                noNode = true;
            }
            terminalLabelLeft = me.isWhitespace(-1, -1) ? terminalLabelLeft : me.getChar(-1, -1);
            terminalLabelLeft = me.isWhitespace(-1, 1)? terminalLabelLeft : me.getChar(-1, 1);
            terminalLabelRight = me.isWhitespace(1, -1) ? terminalLabelRight : me.getChar(1, -1);
            terminalLabelRight = me.isWhitespace(1, 1) ? terminalLabelRight : me.getChar(1, 1);
            me.loops[me.loops.length - 1].push({
                x: xNow,
                y: yNow,
                neighbor: neighbor,
                terminal: terminal,
                noNode: noNode,
                terminalLabelLeft: terminalLabelLeft,
                terminalLabelRight: terminalLabelRight
            });
            return me;
        },

        loopAddSerial: function() {
            var l = me.loops[me.loops.length - 1];

            l.push({ x: l[l.length - 1].x, y: l[l.length - 1].y, neighbor: l[l.length - 1].neighbor });
            return me;
        },

        loopRemove: function() {
            me.loops.pop();
            return me;
        },

        setVoltage: function(voltage) {
            var l = me.loops[me.loops.length - 1];
            l[l.length - 1].voltage = voltage;
        },

        getLoop: function() {
            var l = me.loops[me.loops.length - 1];
            return l[l.length - 1];
        },

        isElementExist: function() {
            var l = me.loops[me.loops.length - 1],
                el = l[l.length - 1];

            return el.resist !== undef ||
                   el.voltage !== undef ||
                   el.capacitance !== undef ||
                   el.inductance !== undef ||
                   el.voltageAC !== undef ||
                   el.current !== undef;
        }
    };
    return me;
}

function CallMachine(machine, next) {
    if(next === null) {
        throw new Error("Null pointer Exception");
    }
    this.machine = machine;
    this.next = next;
}

function ReturnMachine() {}
var returnMachine = new ReturnMachine();

function engine(quadro, initMachine) {
    var state = [],
        machineResult,
        popState,
        i;

    if(initMachine.init === null) {
        throw new Error("Null pointer Exception");
    }
    state.push({
        state: initMachine.init,
        stateName: initMachine.name
    });
    for(i = 0; state.length > 0; i++) {
        if(i > 100000) {
            throw new Error("Maybe Infinite Loop");
        } else if(typeof state[state.length - 1].state !== "function") {
            throw new Error("Invaild state : " + JSON.stringify(state[state.length - 1]));
        }

        machineResult = state[state.length - 1].state(quadro);
        if(machineResult === null) {
            throw new Error("Null pointer Exception");
        } else if(machineResult instanceof CallMachine) {
            state.push({
                state: machineResult.machine.init,
                stateName: machineResult.machine.name,
                next: machineResult.next,
                position: quadro.getPosition()
            });
            log("entering " + state[state.length - 1].stateName);
        } else if(machineResult instanceof ReturnMachine) {
            log("leaving " + state[state.length - 1].stateName);
            popState = state.pop();
            if(state.length > 0) {
                state[state.length - 1].state = popState.next;
            }
            if(popState.position !== undef) {
                quadro.setPosition(popState.position);
            }
        } else {
            state[state.length - 1].state = machineResult;
        }
    }
}

function akiha(input) {
    var machineFindBorder = (function() {
        var me = {
            name: "findBorder",

            init: function(quadro) {
                if(isNode(quadro.getChar())) {
                    return new CallMachine(machineScanBorder, me.halt);
                } else if(quadro.getChar() === BOUND) {
                    quadro.moveCrLf();
                    return me.left;
                } else {
                    quadro.move(RIGHT);
                    return me.init;
                }
            },

            left: function(quadro) {
                if(quadro.getChar() === BOUND) {
                    throw new Error("No curcuit");
                } else {
                    return me.init;
                }
            },

            halt: function(quadro) {
                return returnMachine;
            }
        };
        return me;
    })();

    var machineScanBorder = (function() {
        var machineDrawBorderAux = (function() {
            var me = {
                name: "drawBorderAux",

                init: function(quadro) {
                    return new CallMachine(machineDrawBorderAux1(UP), me.down);
                },

                down: function(quadro) {
                    return new CallMachine(machineDrawBorderAux1(DOWN), me.left);
                },

                left: function(quadro) {
                    return new CallMachine(machineDrawBorderAux1(LEFT), me.right);
                },

                right: function(quadro) {
                    return new CallMachine(machineDrawBorderAux1(RIGHT), me.done);
                },

                done: function(quadro) {
                    return returnMachine;
                }
            };
            return me;
        })();

        function machineDrawBorderAux1(direction) {
            var me = {
                name: "drawBorderAux1",

                init: function(quadro) {
                    if(quadro.getChar() === BOUND) {
                        return returnMachine;
                    } else {
                        if(direction === UP || direction === DOWN) {
                            quadro.get().borderAuxY = true;
                        } else {
                            quadro.get().borderAuxX = true;
                        }
                        quadro.move(direction);
                        return me.init;
                    }
                }
            };
            return me;
        }

        var me = {
            name: "scanBorder",

            init: function(quadro) {
                quadro.direction(RIGHT);
                quadro.get().borderAuxStart = true;
                return new CallMachine(machineDrawBorderAux, me.initMove);
            },

            initMove: function(quadro) {
                quadro.moveForward();
                if(quadro.isWhitespace()) {
                    throw new Error("Unclosed circuit");
                }
                return me.move;
            },

            move: function(quadro) {
                if(quadro.get().borderAuxStart) {
                    return machineBorder.init;
                } else if(isNode(quadro.getChar())) {
                    return new CallMachine(machineDrawBorderAux, me.turn);
                } else if(quadro.getChar() !== BOUND) {
                    quadro.moveForward();
                    return me.move;
                } else {
                    throw new Error("Unclosed circuit");
                }
            },

            turn: function(quadro) {
                quadro.turnLeft().moveForward();
                if(!quadro.isWhitespace()) {
                    return me.move;
                }
                quadro.moveBackward().turnRight().moveForward();
                if(!quadro.isWhitespace()) {
                    return me.move;
                }
                quadro.moveBackward().turnRight().moveForward();
                if(!quadro.isWhitespace()) {
                    return me.move;
                }
                throw new Error("Unclosed circuit");
            }
        };
        return me;
    })();

    var machineBorder = (function() {
        var me = {
            name: "border",

            init: function(quadro) {
                quadro.moveInit();
                return me.findStart;
            },

            findStart: function(quadro) {
                if(quadro.get().borderAuxX && quadro.get().borderAuxY) {
                    return me.drawBorder;
                } else if(quadro.getChar() === BOUND) {
                    quadro.moveCrLf();
                    if(quadro.getChar() === BOUND) {
                        throw new Error("internal error");
                    }
                    return me.findStart;
                } else {
                    quadro.move(RIGHT);
                    return me.findStart;
                }
            },

            drawBorder: function(quadro) {
                quadro.get().borderStart = true;
                quadro.get().border = true;
                quadro.get().borderX = true;
                quadro.get().borderY = true;
                quadro.get().borderUp = true;
                quadro.get().borderLeft = true;
                quadro.direction(RIGHT).moveForward();
                return me.forward;
            },

            forward: function(quadro) {
                var cell = quadro.get();

                if(cell.borderStart) {
                    return machineGrid.init;
                } else if(quadro.getChar() === BOUND) {
                    quadro.moveBackward();
                    return me.turn;
                } else {
                    cell.border = true;
                    cell.borderX = cell.borderX || quadro.isDirectionHorizontal();
                    cell.borderY = cell.borderY || quadro.isDirectionVertical();
                    cell.borderUp = cell.borderUp || quadro.getDirection() === RIGHT;
                    cell.borderLeft = cell.borderLeft || quadro.getDirection() === DOWN;
                    quadro.moveForward();
                    return me.forward;
                }
            },

            turn: function(quadro) {
                var cell = quadro.get();

                if(cell.borderAuxX && cell.borderAuxY) {
                    quadro.turnRight();
                    return me.forward;
                } else {
                    cell.border = undef;
                    cell.borderX = undef;
                    cell.borderY = undef;
                    cell.borderUp = undef;
                    cell.borderLeft = undef;
                    quadro.moveBackward();
                    return me.turn;
                }
            }
        };
        return me;
    })();

    var machineGrid = (function() {
        var me = {
            name: "grid",

            init: function(quadro) {
                return new CallMachine(machineGridDown1, me.scanCell);
            },

            scanCell: function(quadro) {
                return new CallMachine(machineScanCell, me.halt);
            },

            halt: function(quadro) {
                return returnMachine;
            }
        };
        return me;
    })();

    var machineGridDown1 = (function() {
        var me = {
            name: "gridDown1",

            init: function (quadro) {
                if(isNode(quadro.getChar())) {
                    return new CallMachine(machineGridRight, me.next);
                } else if(!quadro.get().borderY) {
                    return returnMachine;
                } else {
                    quadro.move(DOWN);
                    return me.init;
                }
            },

            next: function(quadro) {
                quadro.move(DOWN);
                return me.init;
            }
        };
        return me;
    })();

    var machineGridRight = (function() {
        var me = {
            name: "gridRight",

            init: function(quadro) {
                quadro.get().gridX = true;
                if(isNode(quadro.getChar())) {
                    return new CallMachine(machineGridVertical, me.initNext);
                } else {
                    quadro.move(RIGHT);
                    return me.init;
                }
            },

            initNext: function(quadro) {
                quadro.move(RIGHT);
                return me.move;
            },

            move: function(quadro) {
                quadro.get().gridX = true;
                if(isNode(quadro.getChar())) {
                    return new CallMachine(machineGridVertical, me.next);
                } else if(quadro.get().borderY) {
                    return returnMachine;
                } else {
                    quadro.move(RIGHT);
                    return me.move;
                }
            },

            next: function(quadro) {
                if(quadro.get().borderY) {
                    return returnMachine;
                } else {
                    quadro.move(RIGHT);
                    return me.move;
                }
            }
        };
        return me;
    })();

    var machineGridVertical = (function() {
        var me = {
            name: "gridVertical",

            init: function(quadro) {
                return new CallMachine(machineGridVerticalUp, me.next);
            },

            next: function(quadro) {
                return new CallMachine(machineGridVerticalDown, me.end);
            },

            end: function(quadro) {
                return returnMachine;
            }
        };
        return me;
    })();

    function makeMachineGridVertical(dir) {
        var me = {
            name: "gridVertical2",

            init: function(quadro) {
                quadro.get().gridY = true;
                if(isNode(quadro.getChar())) {
                    return new CallMachine(machineGridHorizontal, me.next);
                } else if(quadro.get().borderX) {
                    return returnMachine;
                } else {
                    quadro.move(dir);
                    return me.init;
                }
            },

            next: function(quadro) {
                var cell = quadro.get();

                if(cell.borderX && (cell.borderUp && dir === UP || !cell.borderUp && dir === DOWN)) {
                    return returnMachine;
                } else {
                    quadro.move(dir);
                    return me.init;
                }
            }
        };
        return me;
    }
    var machineGridVerticalUp = makeMachineGridVertical(UP);
    var machineGridVerticalDown = makeMachineGridVertical(DOWN);

    var machineGridHorizontal = (function() {
        var me = {
            name: "gridHorizontal",

            init: function(quadro) {
                return new CallMachine(machineGridHorizontalLeft, me.next);
            },

            next: function(quadro) {
                return new CallMachine(machineGridHorizontalRight, me.end);
            },

            end: function(quadro) {
                return returnMachine;
            }
        };
        return me;
    })();

    function makeMachineGridHorizontal(dir) {
        var me = {
            name: "gridHorizontal2",

            init: function(quadro) {
                quadro.get().gridX = true;
                if(quadro.get().borderY) {
                    return returnMachine;
                } else {
                    quadro.move(dir);
                    return me.init;
                }
            }
        };
        return me;
    }
    var machineGridHorizontalLeft = makeMachineGridHorizontal(LEFT);
    var machineGridHorizontalRight = makeMachineGridHorizontal(RIGHT);

    function makeMachineScanCell(machineAttrHorizontal, machineAttrVertical) {
        var machineScanDown = (function() {
            var me = {
                name: "scanDown",

                init: function(quadro) {
                    return new CallMachine(machineScanRight, me.move);
                },

                nextInit: function(quadro) {
                    if(quadro.get().borderX) {
                        return returnMachine;
                    } else if(quadro.get().gridX && quadro.get().gridY) {
                        return new CallMachine(machineScanRight, me.move);
                    } else {
                        quadro.move(DOWN);
                        return me.nextInit;
                    }
                },

                move: function(quadro) {
                    quadro.move(DOWN);
                    return me.nextInit;
                }
            };
            return me;
        })();

        var machineScanRight = (function() {
            var me = {
                name: "scanRight",

                init: function(quadro) {
                    var cell = quadro.get();

                    if(cell.cellScanned === RIGHT) {
                        quadro.move(RIGHT);
                        return me.move;
                    } else if(isNode(quadro.getChar()) || !quadro.isWhitespace(1, 0)) {
                        quadro.direction(RIGHT);
                        return new CallMachine(machineScanCellClockwise, me.next);
                    } else {
                        quadro.move(RIGHT);
                        return me.move;
                    }
                },

                move: function(quadro) {
                    var cell = quadro.get();

                    if(cell.cellScanned === RIGHT) {
                        return me.next;
                    } else if(isNode(quadro.getChar()) && !quadro.isWhitespace(1, 0)) {
                        quadro.direction(RIGHT);
                        return new CallMachine(machineScanCellClockwise, me.next);
                    } else {
                        quadro.move(RIGHT);
                        return me.next;
                    }
                },

                next: function(quadro) {
                    if(quadro.get().cellScanned === RIGHT) {
                        quadro.move(RIGHT);
                        return me.next;
                    } else {
                        return me.next2;
                    }
                },

                next2: function(quadro) {
                    if(quadro.get().borderY) {
                        return returnMachine;
                    } else {
                        return me.move;
                    }
                }
            };
            return me;
        })();

        var machineScanCellClockwise = (function() {
            var me = {
                name: "scanCellClockwise",

                init: function(quadro) {
                    quadro.loopNew();
                    quadro.get().clockwiseBegin = true;
                    return me.move;
                },

                move: function(quadro) {
                    if(isNode(quadro.getChar())) {
                        quadro.loopAdd(quadro.getChar());
                        quadro.get().cellScanned = quadro.getDirection();
                        quadro.moveForward();
                        return me.node;
                    } else {
                        quadro.get().cellScanned = quadro.getDirection();
                        quadro.moveForward();
                        return me.move;
                    }
                },

                node: function(quadro) {
                    var nodeDirection,
                        nodeType;

                    function isSurroundParenthesis() {
                        var result;

                        quadro.move(LEFT);
                        if(quadro.getChar() === "(") {
                            quadro.move(RIGHT);
                            quadro.move(RIGHT);
                            result = quadro.getChar() === ")";
                            quadro.move(LEFT);
                        } else {
                            quadro.move(RIGHT);
                            result = false;
                        }
                        return result;
                    }

                    if(isNode(quadro.getChar())) {
                        nodeType = quadro.getChar();
                        if(quadro.get().clockwiseBegin) {
                            quadro.get().clockwiseBegin = false;
                            quadro.loopAdd(nodeType);
                            return returnMachine;
                        }
                        quadro.turnRight().moveForward();
                        if(quadro.isWhitespace()) {
                            quadro.moveBackward().turnLeft().moveForward();
                            if(quadro.isWhitespace()) {
                                quadro.moveBackward().turnLeft().moveForward();
                                if(quadro.isWhitespace()) {
                                    quadro.loopRemove();
                                    quadro.moveInit();
                                    return me.noloop;
                                }
                            }
                            quadro.moveBackward();
                            quadro.loopAdd(nodeType);
                            quadro.get().cellScanned = quadro.getDirection();
                            quadro.moveForward();
                            return me.node;
                        } else {
                            quadro.moveBackward();
                            return me.move;
                        }

                    } else {
                        if(quadro.getChar() === ":") {
                            quadro.getLoop().noWire = true;

                        } else if((/[<>]/.test(quadro.getChar()) && quadro.isDirectionHorizontal()) || (/[v^]/.test(quadro.getChar()) && quadro.isDirectionVertical())) {
                            nodeDirection = quadro.getChar();
                            if(isSurroundParenthesis()) {
                                quadro.elementDefined = true;
                                if(quadro.isElementExist()) {
                                    quadro.loopAddSerial();
                                }
                                return (function(direction) {
                                            return new CallMachine(makeMachineScanLabel(quadro.getDirection(), function(loop, name, text, val) {
                                                loop.name = name;
                                                loop.text = text;
                                                loop.current = val;
                                                loop.direction = direction;
                                            }), me.afterLabel);
                                       })(nodeDirection);
                            } else {
                                return (function(elementDefined, direction) {
                                            return new CallMachine(makeMachineScanLabel(quadro.getDirection(), function(loop, name, text, val) {
                                                if(!elementDefined && (quadro.getDirection() === LEFT || quadro.getDirection() === UP) ||
                                                        elementDefined && (quadro.getDirection() === RIGHT || quadro.getDirection() === DOWN)) {
                                                    loop.postCurrent = { text: text, direction: direction };
                                                } else {
                                                    loop.preCurrent = { text: text, direction: direction };
                                                }
                                            }), me.afterLabel);
                                        })(quadro.isElementExist(), nodeDirection);
                            }

                        } else if(/[<>^v]/.test(quadro.getChar()) && !quadro.elementDefined) {
                            quadro.elementDefined = true;
                            if(quadro.isElementExist()) {
                                quadro.loopAddSerial();
                            }
                            return new CallMachine(makeMachineScanLabel(quadro.getDirection(), function(loop, name, text, val) {
                                loop.name = name;
                                loop.text = text;
                                loop.resist = val;
                            }), me.afterLabel);

                        } else if(/[cm]/.test(quadro.getChar()) && !quadro.elementDefined) {
                            quadro.elementDefined = true;
                            if(quadro.isElementExist()) {
                                quadro.loopAddSerial();
                            }
                            return new CallMachine(makeMachineScanLabel(quadro.getDirection(), function(loop, name, text, val) {
                                loop.name = name;
                                loop.text = text;
                                loop.inductance = val;
                            }), me.afterLabel);

                        } else if(/[~]/.test(quadro.getChar()) && !quadro.elementDefined) {
                            quadro.elementDefined = true;
                            if(quadro.isElementExist()) {
                                quadro.loopAddSerial();
                            }
                            return new CallMachine(makeMachineScanLabel(quadro.getDirection(), function(loop, name, text, val) {
                                loop.name = name;
                                loop.text = text;
                                loop.voltageAC = val;
                            }), me.afterLabel);

                        } else if(quadro.isDirectionVertical() && quadro.getChar() === "-" && !quadro.elementDefined) {
                            quadro.elementDefined = true;
                            if(quadro.isElementExist()) {
                                quadro.loopAddSerial();
                            }
                            if(quadro.getForward(1).ch === " ") {
                                return new CallMachine(makeMachineScanLabel(quadro.getDirection(), function(loop, name, text, val) {
                                    loop.name = name;
                                    loop.text = text;
                                    loop.capacitance = val;
                                }), me.afterLabel);
                            } else if(quadro.getChar(1, 0) === "-" || quadro.getChar(-1, 0) === "-") {
                                return new CallMachine(makeMachineScanLabel(quadro.getDirection(), function(loop, name, text, val) {
                                    loop.name = name;
                                    loop.text = text;
                                    loop.voltage = val;
                                }), me.afterLabel);
                            } else {
                                return new CallMachine(makeMachineScanLabel(quadro.getDirection(), function(loop, name, text, val) {
                                    loop.name = name;
                                    loop.text = text;
                                    loop.voltage = -val;
                                }), me.afterLabel);
                            }

                        } else if(quadro.isDirectionHorizontal() && quadro.getChar() === "|" && !quadro.elementDefined) {
                            quadro.elementDefined = true;
                            if(quadro.isElementExist()) {
                                quadro.loopAddSerial();
                            }
                            if(quadro.getForward(1).ch === " ") {
                                return new CallMachine(makeMachineScanLabel(quadro.getDirection(), function(loop, name, text, val) {
                                    loop.name = name;
                                    loop.text = text;
                                    loop.capacitance = val;
                                }), me.afterLabel);
                            } else if(quadro.getChar(0, 1) === "|" || quadro.getChar(0, -1) === "|") {
                                return new CallMachine(makeMachineScanLabel(quadro.getDirection(), function(loop, name, text, val) {
                                    loop.name = name;
                                    loop.text = text;
                                    loop.voltage = val;
                                }), me.afterLabel);
                            } else {
                                return new CallMachine(makeMachineScanLabel(quadro.getDirection(), function(loop, name, text, val) {
                                    loop.name = name;
                                    loop.text = text;
                                    loop.voltage = -val;
                                }), me.afterLabel);
                            }

                        } else if(/[\/\\]/.test(quadro.getChar())) {
                            nodeDirection = quadro.getChar();
                            quadro.elementDefined = true;
                            if(quadro.isElementExist()) {
                                quadro.loopAddSerial();
                            }
                            return (function(direction) {
                                        return new CallMachine(makeMachineScanLabel(quadro.getDirection(), function(loop, name, text, val) {
                                            loop.name = name;
                                            loop.text = text;
                                            loop.sw = val;
                                            loop.direction = direction;
                                        }), me.afterLabel);
                                   })(nodeDirection);

                        } else if((quadro.isDirectionVertical() && quadro.getChar() === "|") ||
                                (quadro.isDirectionHorizontal() && quadro.getChar() === "-")) {
                            quadro.elementDefined = false;
                        }
                        quadro.get().cellScanned = quadro.getDirection();
                        quadro.moveForward();
                        return me.node;
                    }
                },

                noloop: function(quadro) {
                    quadro.move(RIGHT);
                    if(quadro.get().clockwiseBegin) {
                        quadro.get().clockwiseBegin = undef;
                        return returnMachine;
                    } else if(quadro.getChar() === BOUND) {
                        quadro.moveCrLf();
                        if(quadro.getChar() === BOUND) {
                            throw new Error("internal error");
                        }
                        quadro.move(LEFT);
                    }
                    return me.noloop;
                },

                afterLabel: function(quadro) {
                    quadro.get().cellScanned = quadro.getDirection();
                    quadro.moveForward();
                    return me.node;
                }
            };
            return me;
        })();

        function makeMachineScanLabel(direction, setFunction) {
            var labelChars = /[0-9A-Za-zΩµ\._]/,
                me;

            var machineScanLabelLeft = (function() {
                var me;

                me = {
                    name: "scanLabelLeft",

                    init: function(quadro) {
                        quadro.move(UP);
                        return me.scan;
                    },

                    scan: function(quadro) {
                        if((!quadro.isWhitespace() && quadro.get().gridX) || quadro.getChar() === BOUND) {
                            throw new Error("No label");
                        } else if(labelChars.test(quadro.getChar())) {
                            return me.findLabel;
                        } else {
                            quadro.move(LEFT);
                            return me.scan;
                        }
                    },

                    findLabel: function(quadro) {
                        if(quadro.getChar() === BOUND || !labelChars.test(quadro.getChar())) {
                            quadro.move(RIGHT).move(UP);
                            quadro.text = "";
                            quadro.name = "";
                            return me.findLabelUp;
                        } else {
                            quadro.move(LEFT);
                            return me.findLabel;
                        }
                    },

                    findLabelUp: function(quadro) {
                        if(quadro.getChar() === BOUND || !labelChars.test(quadro.getChar())) {
                            quadro.move(DOWN);
                            return me.readLabel;
                        } else {
                            return me.readName;
                        }
                    },

                    readName: function(quadro) {
                        if(quadro.getChar() !== BOUND && labelChars.test(quadro.getChar())) {
                            quadro.name += quadro.getChar();
                            quadro.move(RIGHT);
                            return me.readName;
                        } else {
                            quadro.move(LEFT);
                            return me.readNameReturn;
                        }
                    },

                    readNameReturn: function(quadro) {
                        if(quadro.getChar() !== BOUND && labelChars.test(quadro.getChar())) {
                            quadro.move(LEFT);
                            return me.readNameReturn;
                        } else {
                            quadro.move(RIGHT).move(DOWN);
                            return me.readLabel;
                        }
                    },

                    readLabel: function(quadro) {
                        var text,
                            val;

                        if(labelChars.test(quadro.getChar())) {
                            quadro.text += quadro.getChar();
                            quadro.move(RIGHT);
                            return me.readLabel;
                        } else {
                            text = quadro.text;
                            val = common.convertEngineerUnit(text.replace(/([0-9]+(?:\.[0-9]+)?[kMGTmuµnp]?).*/, "$1"));
                            val = isNaN(val) ? 1.0 : val;
                            setFunction(quadro.getLoop(), quadro.name, text, val);
                            return returnMachine;
                        }
                    }
                };
                return me;
            })();

            function makeMachineScanLabelUpDown(direction) {
                var me;

                me = {
                    name: "scanLabelUpDown",

                    init: function(quadro) {
                        if((!quadro.isWhitespace() && quadro.get().gridY) || quadro.getChar() === BOUND) {
                            return returnMachine;
                        } else if(labelChars.test(quadro.getChar())) {
                            quadro.text = "";
                            quadro.name = "";
                            if(quadro.getChar(0, -1) !== BOUND && labelChars.test(quadro.getChar(0, -1))) {
                                quadro.move(UP);
                                return new CallMachine(machineReadLabelUpDownProp("name"), me.moveDown);
                            } else if(quadro.getChar(0, 1) !== BOUND && labelChars.test(quadro.getChar(0, 1))) {
                                return new CallMachine(machineReadLabelUpDownProp("name"), me.moveDown);
                            }
                            return machineReadLabelUpDown.init;
                        } else {
                            quadro.move(direction);
                            return me.init;
                        }
                    },

                    moveDown: function(quadro) {
                        quadro.move(DOWN);
                        return machineReadLabelUpDown.init;
                    }
                };
                return me;
            }

            function machineReadLabelUpDownProp(prop) {
                var me;

                me = {
                    name: "readLabelUpDown",

                    init: function(quadro) {
                        var text,
                            val;

                        if(labelChars.test(quadro.getChar()) && quadro.getChar() !== BOUND) {
                            quadro[prop] += quadro.getChar();
                            quadro.move(RIGHT);
                            return me.init;
                        } else {
                            text = quadro[prop];
                            if(prop === "text") {
                                val = common.convertEngineerUnit(text.replace(/([0-9]+(?:\.[0-9]+)?[kMGTmuµnp]?).*/, "$1"));
                                val = isNaN(val) ? 1.0 : val;
                                setFunction(quadro.getLoop(), quadro.name, text, val);
                            }
                            return returnMachine;
                        }
                    }
                };
                return me;
            }

            var machineReadLabelUpDown = machineReadLabelUpDownProp("text");
            var machineScanPolarity = (function() {
                var me;

                me = {
                    name: "scanPolarity",

                    init: function(quadro) {
                        if(direction === RIGHT || direction === DOWN) {
                            quadro.turnRight().moveForward().turnRight();
                        } else {
                            quadro.turnLeft().moveForward().turnLeft();
                        }
                        return me.scanNegative;
                    },

                    scanNegative: function(quadro) {
                        if(quadro.getChar() === "+") {
                            quadro.getLoop().polarity = -1;
                            return returnMachine;
                        } else if((!quadro.isWhitespace() && (quadro.get().gridX || quadro.get().gridY)) ||
                                ((direction === LEFT || direction === RIGHT) && /[\-]/.test(quadro.getChar(0, -1))) ||
                                ((direction === UP || direction === DOWN) && /[\|]/.test(quadro.getChar(1, 0))) ||
                                quadro.getChar() === BOUND) {
                            quadro.turnLeft().turnLeft().moveForward();
                            return me.scanPositive;
                        } else {
                            quadro.moveForward();
                            return me.scanNegative;
                        }
                    },

                    scanPositive: function(quadro) {
                        if(quadro.getChar() === "+") {
                            quadro.getLoop().polarity = 1;
                            return returnMachine;
                        } else if((!quadro.isWhitespace() && (quadro.get().gridX || quadro.get().gridY)) ||
                                ((direction === LEFT || direction === RIGHT) && /[\-]/.test(quadro.getChar(0, -1))) ||
                                ((direction === UP || direction === DOWN) && /[\|]/.test(quadro.getChar(1, 0))) ||
                                quadro.getChar() === BOUND) {
                            quadro.getLoop().polarity = 0;
                            return returnMachine;
                        } else {
                            quadro.moveForward();
                            return me.scanPositive;
                        }
                    }
                };
                return me;
            })();

            if(direction === LEFT || direction === RIGHT) {
                me = {
                    name: "scanLabel",

                    init: function(quadro) {
                        return new CallMachine(machineScanPolarity, me.label);
                    },

                    label: function(quadro) {
                        return machineScanLabelLeft.init;
                    }
                };
            } else {
                me = {
                    name: "scanLabel",

                    init: function(quadro) {
                        return new CallMachine(machineScanPolarity, me.label);
                    },

                    label: function(quadro) {
                        quadro.move(RIGHT);
                        return new CallMachine(makeMachineScanLabelUpDown(UP), me.down);
                    },

                    down: function(quadro) {
                        if(quadro.text !== undef) {
                            return returnMachine;
                        } else {
                            return new CallMachine(makeMachineScanLabelUpDown(DOWN), me.after);
                        }
                    },

                    after: function(quadro) {
                        if(quadro.text !== undef) {
                            return returnMachine;
                        } else {
                            throw new Error("No label");
                        }
                    }
                };
            }
            return me;
        }

        return machineScanDown;
    }
    var machineScanCell = makeMachineScanCell();

    function relocateLoopNo(loops) {
        var i,
            j,
            noX = [],
            noY = [],
            loopsNew;

        function insert(array, val) {
            var i;

            for(i = 0; i < array.length; i++) {
                if(array[i] === val) {
                    return;
                } else if(array[i] > val) {
                    array.splice(i, 0, val);
                    return;
                }
            }
            array.push(val);
        }

        function getIndex(array, val) {
            var i;

            for(i = 0; i < array.length; i++) {
                if(array[i] === val) {
                    return i;
                }
            }
            throw new Error("internal error");
        }

        loopsNew = common.deepcopy(loops);
        for(i = 0; i < loops.length; i++) {
            for(j = 0; j < loops[i].length; j++) {
                insert(noX, loops[i][j].x);
                insert(noY, loops[i][j].y);
            }
        }

        for(i = 0; i < loops.length; i++) {
            for(j = 0; j < loops[i].length; j++) {
                loopsNew[i][j].x = getIndex(noX, loops[i][j].x);
                loopsNew[i][j].y = getIndex(noY, loops[i][j].y);
            }
        }

        return {
            loops: loopsNew,
            xMaxNodes: noX.length,
            yMaxNodes: noY.length
        };
    }

    var quadroObject = quadro(input);
    engine(quadroObject, machineFindBorder);
    return relocateLoopNo(quadroObject.loops);
}

module.exports = {
    parse: akiha
};

},{"./akiha-common.js":2}],6:[function(require,module,exports){
/*
 * akiha-circuit
 *
 * Copyright (c) 2019 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
var common = require("./akiha-common.js");
var defaultOption = {
    sideLengthX: 110,
    sideLengthY: 110,
    marginX: 70,
    marginY: 60,
    stroke: "#000000",
    fill: "white",
    resistorOld: false,
    resistorLong: 50,
    resistorShort: 14,
    resistorLongOld: 35,
    batteryGap: 6,
    batteryLong: 20,
    batteryShort: 10,
    capacitorGap: 10,
    capacitorLength: 16,
    inductorLength: 40,
    inductorOld: false,
    inductorOldRadius: 8,
    voltageACRadius: 10,
    voltageACx: 6,
    voltageACy: 8,
    voltageACFill: "none",
    currentRadius: 10,
    currentArrowLong: 12,
    currentArrowShort: 4,
    currentFill: "none",
    switchLong: 20,
    switchShort: 11,
    switchRadius: 1.5,
    switchTextMarginX: 4,
    switchFill: "none",
    jointRadius: 2,
    fontFamily: "sans-serif",
    fontSize: 14,
    fontSubscriptSizeRatio: 8 / 14,
    fontSubscriptMargin: 1,
    textMargin: 14,
    polarityLength: 12,
    polarityLengthMinor: 4,
    arrowSize: 6,
    arrowFill: "black",
    terminalRadius: 3,
    terminalFill: "white",
    terminalLabelMargin: 14
};

var widths = [];

// ASCII, Latin-2
widths[0x21] = 0.278125;
widths[0x22] = 0.35546875;
widths[0x23] = 0.55625;
widths[0x24] = 0.55625;
widths[0x25] = 0.88984375;
widths[0x26] = 0.6671875;
widths[0x27] = 0.19140625;
widths[0x28] = 0.33359375;
widths[0x29] = 0.33359375;
widths[0x2a] = 0.38984375;
widths[0x2b] = 0.584375;
widths[0x2c] = 0.278125;
widths[0x2d] = 0.33359375;
widths[0x2e] = 0.278125;
widths[0x2f] = 0.278125;
widths[0x30] = 0.55625;
widths[0x31] = 0.55625;
widths[0x32] = 0.55625;
widths[0x33] = 0.55625;
widths[0x34] = 0.55625;
widths[0x35] = 0.55625;
widths[0x36] = 0.55625;
widths[0x37] = 0.55625;
widths[0x38] = 0.55625;
widths[0x39] = 0.55625;
widths[0x3a] = 0.278125;
widths[0x3b] = 0.278125;
widths[0x3c] = 0.584375;
widths[0x3d] = 0.584375;
widths[0x3e] = 0.584375;
widths[0x3f] = 0.55625;
widths[0x40] = 1.015625;
widths[0x41] = 0.6671875;
widths[0x42] = 0.6671875;
widths[0x43] = 0.72265625;
widths[0x44] = 0.72265625;
widths[0x45] = 0.6671875;
widths[0x46] = 0.6109375;
widths[0x47] = 0.778125;
widths[0x48] = 0.72265625;
widths[0x49] = 0.278125;
widths[0x4a] = 0.5;
widths[0x4b] = 0.6671875;
widths[0x4c] = 0.55625;
widths[0x4d] = 0.83359375;
widths[0x4e] = 0.72265625;
widths[0x4f] = 0.778125;
widths[0x50] = 0.6671875;
widths[0x51] = 0.778125;
widths[0x52] = 0.72265625;
widths[0x53] = 0.6671875;
widths[0x54] = 0.6109375;
widths[0x55] = 0.72265625;
widths[0x56] = 0.6671875;
widths[0x57] = 0.94453125;
widths[0x58] = 0.6671875;
widths[0x59] = 0.6671875;
widths[0x5a] = 0.6109375;
widths[0x5b] = 0.278125;
widths[0x5c] = 0.55625;
widths[0x5d] = 0.278125;
widths[0x5e] = 0.46953125;
widths[0x5f] = 0.55625;
widths[0x60] = 0.33359375;
widths[0x61] = 0.55625;
widths[0x62] = 0.55625;
widths[0x63] = 0.5;
widths[0x64] = 0.55625;
widths[0x65] = 0.55625;
widths[0x66] = 0.278125;
widths[0x67] = 0.55625;
widths[0x68] = 0.55625;
widths[0x69] = 0.22265625;
widths[0x6a] = 0.22265625;
widths[0x6b] = 0.5;
widths[0x6c] = 0.22265625;
widths[0x6d] = 0.83359375;
widths[0x6e] = 0.55625;
widths[0x6f] = 0.55625;
widths[0x70] = 0.55625;
widths[0x71] = 0.55625;
widths[0x72] = 0.33359375;
widths[0x73] = 0.5;
widths[0x74] = 0.278125;
widths[0x75] = 0.55625;
widths[0x76] = 0.5;
widths[0x77] = 0.72265625;
widths[0x78] = 0.5;
widths[0x79] = 0.5;
widths[0x7a] = 0.5;
widths[0x7b] = 0.334375;
widths[0x7c] = 0.26015625;
widths[0x7d] = 0.334375;
widths[0x7e] = 0.584375;

function createDrawer(xMaxNodes, yMaxNodes, svg, option) {
    var me,
        canvas,
        sideLen,
        opt = option ? common.extend(defaultOption, option) : defaultOption;

    function fontSubscriptSize() {
        return opt.fontSize * opt.fontSubscriptSizeRatio;
    }

    function getTextWidth(text, baseWidth) {
        var i,
            result = opt.fontSubscriptMargin;

        for(i = 0; i < text.length; i++) {
            result += baseWidth * widths[text.charCodeAt(i)];
        }
        return result;
    }

    function getPoint(point) {
        var rpoint = sideLen.getLength({ x: 0, y: 0 }, point),
            result;

        result = {
            x: opt.marginX + rpoint.x * opt.sideLengthX,
            y: opt.marginY + rpoint.y * opt.sideLengthY
        };
        return result;
    }

    function makeArrowHorizontal(baseX, baseY, direction) {
        var points = "";

        points += "M " + (baseX + (direction > 0 ? 0 : opt.arrowSize)) + " " + baseY + " ";
        points += "l " + 0 + " " + (opt.arrowSize / 2) + " ";
        points += "l " + (opt.arrowSize * direction) + " -" + (opt.arrowSize / 2) + " ";
        points += "l " + (-opt.arrowSize * direction) + " -" + (opt.arrowSize / 2) + " ";
        points += "l " + 0 + " " + (opt.arrowSize / 2);
        svg.addPath(canvas, points, opt.arrowFill, opt.stroke);
    }

    function makeArrowVertical(baseX, baseY, direction) {
        var points = "";

        points += "M " + baseX + " " + (baseY + (direction > 0 ? 0 : opt.arrowSize)) + " ";
        points += "l " + (opt.arrowSize / 2) + " " + 0 + " ";
        points += "l -" + (opt.arrowSize / 2) + " " + (opt.arrowSize * direction) + " ";
        points += "l -" + (opt.arrowSize / 2) + " " + (-opt.arrowSize * direction) + " ";
        points += "l " + (opt.arrowSize / 2) + " " + 0;
        svg.addPath(canvas, points, opt.arrowFill, opt.stroke);
    }

    function makeDrawing(length, drawX, drawY) {
        return function(point1, point2, divide, serial) {
            var pax = getPoint(point1).x,
                pay = getPoint(point1).y,
                pbx = getPoint(point2).x,
                pby = getPoint(point2).y,
                p1x = pax < pbx ? pax : pbx,
                p1y = pay < pby ? pay : pby,
                p2x = pax >= pbx ? pax : pbx,
                p2y = pay >= pby ? pay : pby,
                p3,
                p4,
                pl1,
                pl2,
                preCurrentPoint,
                postCurrentPoint,
                points = "";

            if(pay === pby) {
                if(pax < pbx) {
                    p3 = p1x + (p2x - p1x) * (divide) / serial;
                    p4 = p1x + (p2x - p1x) * (divide + 1) / serial;
                } else {
                    p3 = p1x + (p2x - p1x) * (serial - divide - 1) / serial;
                    p4 = p1x + (p2x - p1x) * (serial - divide) / serial;
                }
                pl1 = p3 + (p4 - p3) / 2 - length / 2;
                pl2 = p3 + (p4 - p3) / 2 + length / 2;
                drawX(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4);
                if(point1.polarity * (pax - pbx) > 0) {
                    svg.addText(canvas, "+", pl1 - opt.polarityLength, pay + opt.polarityLength, opt);
                } else if(point1.polarity * (pax - pbx) < 0) {
                    svg.addText(canvas, "+", pl2 + opt.polarityLengthMinor, pay + opt.polarityLength, opt);
                }
                if(point1.preCurrent) {
                    preCurrentPoint = p3 + (pl1 - p3) / 2;
                    svg.addText(canvas, point1.preCurrent.text, preCurrentPoint, pay - opt.arrowSize - 2, opt);
                    makeArrowHorizontal(preCurrentPoint, pay, point1.preCurrent.direction === ">" ? 1 : -1);
                }
                if(point1.postCurrent) {
                    postCurrentPoint = p4 - (p4 - pl2) / 2;
                    svg.addText(canvas, point1.postCurrent.text, postCurrentPoint, pay - opt.arrowSize - 2, opt);
                    makeArrowHorizontal(postCurrentPoint, pay, point1.postCurrent.direction === ">" ? 1 : -1);
                }
            } else {
                if(pay < pby) {
                    p3 = p1y + (p2y - p1y) * (divide) / serial;
                    p4 = p1y + (p2y - p1y) * (divide + 1) / serial;
                } else {
                    p3 = p1y + (p2y - p1y) * (serial - divide - 1) / serial;
                    p4 = p1y + (p2y - p1y) * (serial - divide) / serial;
                }
                pl1 = p3 + (p4 - p3) / 2 - length / 2;
                pl2 = p3 + (p4 - p3) / 2 + length / 2;
                drawY(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4);
                if(point1.polarity * (pay - pby) > 0) {
                    svg.addText(canvas, "+", pax - opt.polarityLength, pl1 - opt.polarityLengthMinor, opt);
                } else if(point1.polarity * (pay - pby) < 0) {
                    svg.addText(canvas, "+", pax - opt.polarityLength, pl2 + opt.polarityLength, opt);
                }
                if(point1.preCurrent) {
                    preCurrentPoint = p3 + (pl1 - p3) / 2;
                    svg.addText(canvas, point1.preCurrent.text, pax - opt.textMargin, preCurrentPoint, opt);
                    makeArrowVertical(pax, preCurrentPoint, point1.preCurrent.direction === "v" ? 1 : -1);
                }
                if(point1.postCurrent) {
                    postCurrentPoint = p4 - (p4 - pl2) / 2;
                    svg.addText(canvas, point1.postCurrent.text, pax - opt.textMargin, postCurrentPoint, opt);
                    makeArrowVertical(pax, postCurrentPoint, point1.postCurrent.direction === "v" ? 1 : -1);
                }
            }
        }
    }

    me = {
        setSideLength: function(sideLength) {
            var xLen,
                yLen;

            sideLen = sideLength;
            xLen = sideLen.getLength({ x: 0, y: 0 }, { x: xMaxNodes - 1, y: 0 }).x;
            yLen = sideLen.getLength({ x: 0, y: 0 }, { x: 0, y: yMaxNodes - 1 }).y;
            canvas = svg.createCanvas(opt.marginX * 2 + xLen * opt.sideLengthX, opt.marginY * 2 + yLen * opt.sideLengthY);
        },

        drawLine: function(point1, point2) {
            svg.addLine(canvas, getPoint(point1).x, getPoint(point1).y, getPoint(point2).x, getPoint(point2).y, opt.stroke);
        },

        drawJoint: function(point) {
            svg.addCircle(canvas, getPoint(point).x, getPoint(point).y, opt.jointRadius, opt.stroke);
        },

        drawTerminal: function(point) {
            var p = getPoint(point);

            svg.addCircle(canvas, p.x, p.y, opt.terminalRadius, opt.stroke, opt.terminalFill);
            if(point.terminalLabelLeft) {
                svg.addText(canvas, point.terminalLabelLeft, p.x - opt.terminalLabelMargin, p.y, opt);
            }
            if(point.terminalLabelRight) {
                svg.addText(canvas, point.terminalLabelRight, p.x + opt.terminalRadius * 2, p.y, opt);
            }
        },

        drawResistor: makeDrawing(
            opt.resistorOld ? opt.resistorLongOld : opt.resistorLong,
            function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                var points = "",
                    textSplit = point1.text.split("_");

                if(opt.resistorOld) {
                    points += "M " + pl1 + " " + pay + " ";
                    points += "l " + (opt.resistorLongOld / 12) + " " + (opt.resistorShort / 2) + " ";
                    points += "l " + (opt.resistorLongOld * 2 / 12) + " " + (-opt.resistorShort) + " ";
                    points += "l " + (opt.resistorLongOld * 2 / 12) + " " + (opt.resistorShort) + " ";
                    points += "l " + (opt.resistorLongOld * 2 / 12) + " " + (-opt.resistorShort) + " ";
                    points += "l " + (opt.resistorLongOld * 2 / 12) + " " + (opt.resistorShort) + " ";
                    points += "l " + (opt.resistorLongOld * 2 / 12) + " " + (-opt.resistorShort) + " ";
                    points += "l " + (opt.resistorLongOld / 12) + " " + (opt.resistorShort / 2) + " ";
                } else {
                    points += "M " + pl1 + " " + (pay - opt.resistorShort / 2) + " ";
                    points += "L " + pl2 + " " + (pay - opt.resistorShort / 2) + " ";
                    points += "L " + pl2 + " " + (pay + opt.resistorShort / 2) + " ";
                    points += "L " + pl1 + " " + (pay + opt.resistorShort / 2) + " ";
                    points += "L " + pl1 + " " + (pay - opt.resistorShort / 2);
                }
                svg.addPath(canvas, points, opt.fill, opt.stroke);
                svg.addLine(canvas, p3, pay, pl1, pay, opt.stroke);
                svg.addLine(canvas, pl2, pay, p4, pay, opt.stroke);
                svg.addText(canvas, textSplit[0], pl1, pay - opt.textMargin, opt);
                if(textSplit[1]) {
                    svg.addText(canvas, textSplit[1], pl1 + getTextWidth(textSplit[0], opt.fontSize), pay - opt.textMargin, opt, fontSubscriptSize());
                }
                if(point1.name) {
                    svg.addText(canvas, point1.name, pl1, pay - opt.textMargin * 2, opt);
                }
            }, function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                var points = "",
                    textSplit = point1.text.split("_");

                if(opt.resistorOld) {
                    points += "M " + pax + " " + pl1 + " ";
                    points += "l " + (-opt.resistorShort / 2) + " " + (opt.resistorLongOld / 12) + " ";
                    points += "l " + (opt.resistorShort) + " " + (opt.resistorLongOld * 2 / 12) + " ";
                    points += "l " + (-opt.resistorShort) + " " + (opt.resistorLongOld * 2 / 12) + " ";
                    points += "l " + (opt.resistorShort) + " " + (opt.resistorLongOld * 2 / 12) + " ";
                    points += "l " + (-opt.resistorShort) + " " + (opt.resistorLongOld * 2 / 12) + " ";
                    points += "l " + (opt.resistorShort) + " " + (opt.resistorLongOld * 2 / 12) + " ";
                    points += "l " + (-opt.resistorShort / 2) + " " + (opt.resistorLongOld / 12) + " ";
                } else {
                    points += "M " + (pax - opt.resistorShort / 2) + " " + pl1 + " ";
                    points += "L " + (pax - opt.resistorShort / 2) + " " + pl2 + " ";
                    points += "L " + (pax + opt.resistorShort / 2) + " " + pl2 + " ";
                    points += "L " + (pax + opt.resistorShort / 2) + " " + pl1 + " ";
                    points += "L " + (pax - opt.resistorShort / 2) + " " + pl1;
                }
                svg.addPath(canvas, points, opt.fill, opt.stroke);
                svg.addLine(canvas, pax, p3, pax, pl1, opt.stroke);
                svg.addLine(canvas, pax, pl2, pax, p4, opt.stroke);
                if(point1.name) {
                    svg.addText(canvas, textSplit[0], pax + opt.textMargin, p3 + (p4 - p3) / 2 + opt.textMargin / 2, opt);
                    if(textSplit[1]) {
                        svg.addText(canvas,
                            textSplit[1], pax + opt.textMargin + getTextWidth(textSplit[0], opt.fontSize),
                            p3 + (p4 - p3) / 2 + opt.textMargin / 2,
                            opt, fontSubscriptSize());
                    }
                    svg.addText(canvas, point1.name, pax + opt.textMargin, p3 + (p4 - p3) / 2 - opt.textMargin / 2, opt);
                } else {
                    svg.addText(canvas, textSplit[0], pax + opt.textMargin, p3 + (p4 - p3) / 2, opt);
                    if(textSplit[1]) {
                        svg.addText(canvas,
                            textSplit[1], pax + opt.textMargin + getTextWidth(textSplit[0], opt.fontSize),
                            p3 + (p4 - p3) / 2,
                            opt, fontSubscriptSize());
                    }
                }
            }
        ),

        drawBattery: makeDrawing(
            opt.batteryGap,
            function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                var textSplit = point1.text.split("_");

                svg.addLine(canvas, p3, pay, pl1, pay, opt.stroke);
                svg.addLine(canvas, pl2, pay, p4, pay, opt.stroke);
                if((point1.voltage > 0 && p1x === pax) || (point1.voltage <= 0 && p1x !== pax)) {
                    svg.addLine(canvas, pl1, pay - opt.batteryLong / 2, pl1, pay + opt.batteryLong / 2, opt.stroke);
                    svg.addLine(canvas, pl2, pay - opt.batteryShort / 2, pl2, pay + opt.batteryShort / 2, opt.stroke);
                } else {
                    svg.addLine(canvas, pl2, pay - opt.batteryLong / 2, pl2, pay + opt.batteryLong / 2, opt.stroke);
                    svg.addLine(canvas, pl1, pay - opt.batteryShort / 2, pl1, pay + opt.batteryShort / 2, opt.stroke);
                }
                svg.addText(canvas, textSplit[0], pl1, pay - opt.textMargin, opt);
                if(textSplit[1]) {
                    svg.addText(canvas, textSplit[1], pl1 + getTextWidth(textSplit[0], opt.fontSize), pay - opt.textMargin, opt, fontSubscriptSize());
                }
                if(point1.name) {
                    svg.addText(canvas, point1.name, pl1, pay - opt.textMargin * 2, opt);
                }
            }, function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                var textSplit = point1.text.split("_");

                svg.addLine(canvas, pax, p3, pax, pl1, opt.stroke);
                svg.addLine(canvas, pax, pl2, pax, p4, opt.stroke);
                if((point1.voltage > 0 && p1y === pay) || (point1.voltage <= 0 && p1y !== pay)) {
                    svg.addLine(canvas, pax - opt.batteryLong / 2, pl1, pax + opt.batteryLong / 2, pl1, opt.stroke);
                    svg.addLine(canvas, pax - opt.batteryShort / 2, pl2, pax + opt.batteryShort / 2, pl2, opt.stroke);
                } else {
                    svg.addLine(canvas, pax - opt.batteryLong / 2, pl2, pax + opt.batteryLong / 2, pl2, opt.stroke);
                    svg.addLine(canvas, pax - opt.batteryShort / 2, pl1, pax + opt.batteryShort / 2, pl1, opt.stroke);
                }
                if(point1.name) {
                    svg.addText(canvas, textSplit[0], pax + opt.textMargin, p3 + (p4 - p3) / 2 + opt.textMargin / 2, opt);
                    if(textSplit[1]) {
                        svg.addText(canvas,
                            textSplit[1], pax + opt.textMargin + getTextWidth(textSplit[0], opt.fontSize),
                            p3 + (p4 - p3) / 2 + opt.textMargin / 2,
                            opt, fontSubscriptSize());
                    }
                    svg.addText(canvas, point1.name, pax + opt.textMargin, p3 + (p4 - p3) / 2 - opt.textMargin / 2, opt);
                } else {
                    svg.addText(canvas, textSplit[0], pax + opt.textMargin, p3 + (p4 - p3) / 2, opt);
                    if(textSplit[1]) {
                        svg.addText(canvas,
                            textSplit[1], pax + opt.textMargin + getTextWidth(textSplit[0], opt.fontSize),
                            p3 + (p4 - p3) / 2,
                            opt, fontSubscriptSize());
                    }
                }
            }
        ),

        drawCapacitor: makeDrawing(
            opt.capacitorGap,
            function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                var textSplit = point1.text.split("_");

                svg.addLine(canvas, p3, pay, pl1, pay, opt.stroke);
                svg.addLine(canvas, pl2, pay, p4, pay, opt.stroke);
                svg.addLine(canvas, pl1, pay - opt.capacitorLength / 2, pl1, pay + opt.capacitorLength / 2, opt.stroke);
                svg.addLine(canvas, pl2, pay - opt.capacitorLength / 2, pl2, pay + opt.capacitorLength / 2, opt.stroke);
                svg.addText(canvas, textSplit[0], pl1, pay - opt.textMargin, opt);
                if(textSplit[1]) {
                    svg.addText(canvas, textSplit[1], pl1 + getTextWidth(textSplit[0], opt.fontSize), pay - opt.textMargin, opt, fontSubscriptSize());
                }
                if(point1.name) {
                    svg.addText(canvas, point1.name, pl1, pay - opt.textMargin * 2, opt);
                }
            }, function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                var textSplit = point1.text.split("_");

                svg.addLine(canvas, pax, p3, pax, pl1, opt.stroke);
                svg.addLine(canvas, pax, pl2, pax, p4, opt.stroke);
                svg.addLine(canvas, pax - opt.capacitorLength / 2, pl1, pax + opt.capacitorLength / 2, pl1, opt.stroke);
                svg.addLine(canvas, pax - opt.capacitorLength / 2, pl2, pax + opt.capacitorLength / 2, pl2, opt.stroke);
                if(point1.name) {
                    svg.addText(canvas, textSplit[0], pax + opt.textMargin, p3 + (p4 - p3) / 2 + opt.textMargin / 2, opt);
                    if(textSplit[1]) {
                        svg.addText(canvas,
                            textSplit[1], pax + opt.textMargin + getTextWidth(textSplit[0], opt.fontSize),
                            p3 + (p4 - p3) / 2 + opt.textMargin / 2,
                            opt, fontSubscriptSize());
                    }
                    svg.addText(canvas, point1.name, pax + opt.textMargin, p3 + (p4 - p3) / 2 - opt.textMargin / 2, opt);
                } else {
                    svg.addText(canvas, textSplit[0], pax + opt.textMargin, p3 + (p4 - p3) / 2, opt);
                    if(textSplit[1]) {
                        svg.addText(canvas,
                            textSplit[1], pax + opt.textMargin + getTextWidth(textSplit[0], opt.fontSize),
                            p3 + (p4 - p3) / 2,
                            opt, fontSubscriptSize());
                    }
                }
            }
        ),

        drawInductor: makeDrawing(
            opt.inductorOld ? opt.inductorOldRadius * 55 / 12.5 : opt.inductorLength,
            function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                var textSplit = point1.text.split("_");

                function drawCoil1(num) {
                    var points = "";

                    points += "M " + (pl1 + opt.inductorLength * num / 4) + " " + pay + " ";
                    points += "a " + opt.inductorLength / 8 + " " + opt.inductorLength / 8 + " ";
                    points += "0 0 1 " + opt.inductorLength / 4 + " 0";
                    svg.addPath(canvas, points, opt.fill, opt.stroke);
                }

                function drawCoilOld() {
                    var points = "";

                    points += "M " + pl1 + " " + pay + " ";
                    points += "a " + opt.inductorOldRadius + " " + opt.inductorOldRadius + " ";
                    points += "0 1 1 " + (opt.inductorOldRadius * 20 / 12.5) + " " + (opt.inductorOldRadius * 10 / 12.5) + " ";
                    points += "a " + opt.inductorOldRadius + " " + opt.inductorOldRadius + " ";
                    points += "0 1 1 " + (opt.inductorOldRadius * 15 / 12.5) + " 0 ";
                    points += "a " + opt.inductorOldRadius + " " + opt.inductorOldRadius + " ";
                    points += "0 1 1 " + (opt.inductorOldRadius * 20 / 12.5) + " -" + (opt.inductorOldRadius * 10 / 12.5) + " ";
                    svg.addPath(canvas, points, opt.fill, opt.stroke);
                }

                svg.addLine(canvas, p3, pay, pl1, pay, opt.stroke);
                svg.addLine(canvas, pl2, pay, p4, pay, opt.stroke);
                if(opt.inductorOld) {
                    drawCoilOld();
                } else {
                    drawCoil1(0);
                    drawCoil1(1);
                    drawCoil1(2);
                    drawCoil1(3);
                }
                svg.addText(canvas, textSplit[0], pl1, pay - opt.textMargin, opt);
                if(textSplit[1]) {
                    svg.addText(canvas, textSplit[1], pl1 + getTextWidth(textSplit[0], opt.fontSize), pay - opt.textMargin, opt, fontSubscriptSize());
                }
                if(point1.name) {
                    svg.addText(canvas, point1.name, pl1, pay - opt.textMargin * 2, opt);
                }
            }, function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                var textSplit = point1.text.split("_");

                function drawCoil1(num) {
                    var points = "";

                    points += "M " + pax + " " + (pl1 + opt.inductorLength * num / 4) + " ";
                    points += "a " + opt.inductorLength / 8 + " " + opt.inductorLength / 8 + " ";
                    points += "90 0 1 0 " + opt.inductorLength / 4;
                    svg.addPath(canvas, points, opt.fill, opt.stroke);
                }

                function drawCoilOld() {
                    var points = "";

                    points += "M " + pax + " " + pl1 + " ";
                    points += "a " + opt.inductorOldRadius + " " + opt.inductorOldRadius + " ";
                    points += "0 1 0 " + (opt.inductorOldRadius * 10 / 12.5) + " " + (opt.inductorOldRadius * 20 / 12.5) + " ";
                    points += "a " + opt.inductorOldRadius + " " + opt.inductorOldRadius + " ";
                    points += "0 1 0 0 " + (opt.inductorOldRadius * 15 / 12.5) + " ";
                    points += "a " + opt.inductorOldRadius + " " + opt.inductorOldRadius + " ";
                    points += "0 1 0 -" + (opt.inductorOldRadius * 10 / 12.5) + " " + (opt.inductorOldRadius * 20 / 12.5) + " ";
                    svg.addPath(canvas, points, opt.fill, opt.stroke);
                }

                svg.addLine(canvas, pax, p3, pax, pl1, opt.stroke);
                svg.addLine(canvas, pax, pl2, pax, p4, opt.stroke);
                if(opt.inductorOld) {
                    drawCoilOld();
                } else {
                    drawCoil1(0);
                    drawCoil1(1);
                    drawCoil1(2);
                    drawCoil1(3);
                }
                if(point1.name) {
                    svg.addText(canvas, textSplit[0], pax + opt.textMargin, p3 + (p4 - p3) / 2 + opt.textMargin / 2, opt);
                    if(textSplit[1]) {
                        svg.addText(canvas,
                            textSplit[1], pax + opt.textMargin + getTextWidth(textSplit[0], opt.fontSize),
                            p3 + (p4 - p3) / 2 + opt.textMargin / 2,
                            opt, fontSubscriptSize());
                    }
                    svg.addText(canvas, point1.name, pax + opt.textMargin, p3 + (p4 - p3) / 2 - opt.textMargin / 2, opt);
                } else {
                    svg.addText(canvas, textSplit[0], pax + opt.textMargin, p3 + (p4 - p3) / 2, opt);
                    if(textSplit[1]) {
                        svg.addText(canvas,
                            textSplit[1], pax + opt.textMargin + getTextWidth(textSplit[0], opt.fontSize),
                            p3 + (p4 - p3) / 2,
                            opt, fontSubscriptSize());
                    }
                }
            }
        ),

        drawVoltageAC: makeDrawing(
            opt.voltageACRadius * 2,
            function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                var points = "",
                    textSplit = point1.text.split("_");

                svg.addLine(canvas, p3, pay, pl1, pay, opt.stroke);
                svg.addLine(canvas, pl2, pay, p4, pay, opt.stroke);
                points += "M " + ((p4 + p3) / 2) + " " + pay + " ";
                points += "q " + (-opt.voltageACx / 2) + " " + (-opt.voltageACy / 2) + " " + (-opt.voltageACx) + " 0";
                svg.addPath(canvas, points, opt.fill, opt.stroke);
                points += "M " + ((p4 + p3) / 2) + " " + pay + " ";
                points += "q " + (opt.voltageACx / 2) + " " + (opt.voltageACy / 2) + " " + (opt.voltageACx) + " 0";
                svg.addPath(canvas, points, opt.fill, opt.stroke);
                svg.addCircle(canvas, (p4 + p3) / 2, pay, opt.voltageACRadius, opt.stroke, opt.voltageACFill);
                svg.addText(canvas, textSplit[0], pl1, pay - opt.textMargin, opt);
                if(textSplit[1]) {
                    svg.addText(canvas, textSplit[1], pl1 + getTextWidth(textSplit[0], opt.fontSize), pay - opt.textMargin, opt, fontSubscriptSize());
                }
                if(point1.name) {
                    svg.addText(canvas, point1.name, pl1, pay - opt.textMargin * 2, opt);
                }
            }, function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                var points = "",
                    textSplit = point1.text.split("_");

                svg.addLine(canvas, pax, p3, pax, pl1, opt.stroke);
                svg.addLine(canvas, pax, pl2, pax, p4, opt.stroke);
                points += "M " + pax + " " + ((p4 + p3) / 2) + " ";
                points += "q " + (-opt.voltageACx / 2) + " " + (-opt.voltageACy / 2) + " " + (-opt.voltageACx) + " 0";
                svg.addPath(canvas, points, opt.fill, opt.stroke);
                points += "M " + pax + " " + ((p4 + p3) / 2) + " ";
                points += "q " + (opt.voltageACx / 2) + " " + (opt.voltageACy / 2) + " " + (opt.voltageACx) + " 0";
                svg.addPath(canvas, points, opt.fill, opt.stroke);
                svg.addCircle(canvas, pax, (p4 + p3) / 2, opt.voltageACRadius, opt.stroke, opt.voltageACFill);
                if(point1.name) {
                    svg.addText(canvas, textSplit[0], pax + opt.textMargin, p3 + (p4 - p3) / 2 + opt.textMargin / 2, opt);
                    if(textSplit[1]) {
                        svg.addText(canvas,
                            textSplit[1], pax + opt.textMargin + getTextWidth(textSplit[0], opt.fontSize),
                            p3 + (p4 - p3) / 2 + opt.textMargin / 2,
                            opt, fontSubscriptSize());
                    }
                    svg.addText(canvas, point1.name, pax + opt.textMargin, p3 + (p4 - p3) / 2 - opt.textMargin / 2, opt);
                } else {
                    svg.addText(canvas, textSplit[0], pax + opt.textMargin, p3 + (p4 - p3) / 2, opt);
                    if(textSplit[1]) {
                        svg.addText(canvas,
                            textSplit[1], pax + opt.textMargin + getTextWidth(textSplit[0], opt.fontSize),
                            p3 + (p4 - p3) / 2,
                            opt, fontSubscriptSize());
                    }
                }
            }
        ),

        drawCurrent: makeDrawing(
            opt.currentRadius * 2,
            function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                var points = "",
                    textSplit = point1.text.split("_");

                svg.addLine(canvas, p3, pay, pl1, pay, opt.stroke);
                svg.addLine(canvas, pl2, pay, p4, pay, opt.stroke);
                if(point1.direction === ">") {
                    points += "M " + ((p4 + p3) / 2 - opt.currentArrowLong / 2) + " " + pay + " ";
                    points += "l " + opt.currentArrowLong + " 0 ";
                    points += "l " + (-opt.currentArrowShort) + " " + (-opt.currentArrowShort) + " ";
                    points += "m 0 " + (opt.currentArrowShort * 2) + " ";
                    points += "l " + opt.currentArrowShort + " " + (-opt.currentArrowShort) + " ";
                } else {
                    points += "M " + ((p4 + p3) / 2 + opt.currentArrowLong / 2) + " " + pay + " ";
                    points += "l " + (-opt.currentArrowLong) + " 0 ";
                    points += "l " + opt.currentArrowShort + " " + (-opt.currentArrowShort) + " ";
                    points += "m 0 " + (opt.currentArrowShort * 2) + " ";
                    points += "l " + (-opt.currentArrowShort) + " " + (-opt.currentArrowShort) + " ";
                }
                svg.addPath(canvas, points, opt.fill, opt.stroke);
                svg.addCircle(canvas, (p4 + p3) / 2, pay, opt.currentRadius, opt.stroke, opt.currentFill);
                svg.addText(canvas, textSplit[0], pl1, pay - opt.textMargin, opt);
                if(textSplit[1]) {
                    svg.addText(canvas, textSplit[1], pl1 + getTextWidth(textSplit[0], opt.fontSize), pay - opt.textMargin, opt, fontSubscriptSize());
                }
                if(point1.name) {
                    svg.addText(canvas, point1.name, pl1, pay - opt.textMargin * 2, opt);
                }
            }, function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                var points = "",
                    textSplit = point1.text.split("_");

                svg.addLine(canvas, pax, p3, pax, pl1, opt.stroke);
                svg.addLine(canvas, pax, pl2, pax, p4, opt.stroke);
                if(point1.direction === "v") {
                    points += "M " + pax + " " + ((p4 + p3) / 2 - opt.currentArrowLong / 2);
                    points += "l 0 " + opt.currentArrowLong + " ";
                    points += "l " + (-opt.currentArrowShort) + " " + (-opt.currentArrowShort) + " ";
                    points += "m " + (opt.currentArrowShort * 2) + " 0 ";
                    points += "l " + (-opt.currentArrowShort) + " " + opt.currentArrowShort + " ";
                } else {
                    points += "M " + pax + " " + ((p4 + p3) / 2 + opt.currentArrowLong / 2);
                    points += "l 0 " + (-opt.currentArrowLong) + " ";
                    points += "l " + (-opt.currentArrowShort) + " " + opt.currentArrowShort + " ";
                    points += "m " + (opt.currentArrowShort * 2) + " 0 ";
                    points += "l " + (-opt.currentArrowShort) + " " + (-opt.currentArrowShort) + " ";
                }
                svg.addPath(canvas, points, opt.fill, opt.stroke);
                svg.addCircle(canvas, pax, (p4 + p3) / 2, opt.currentRadius, opt.stroke, opt.currentFill);
                if(point1.name) {
                    svg.addText(canvas, textSplit[0], pax + opt.textMargin, p3 + (p4 - p3) / 2 + opt.textMargin / 2, opt);
                    if(textSplit[1]) {
                        svg.addText(canvas,
                            textSplit[1], pax + opt.textMargin + getTextWidth(textSplit[0], opt.fontSize),
                            p3 + (p4 - p3) / 2 + opt.textMargin / 2,
                            opt, fontSubscriptSize());
                    }
                    svg.addText(canvas, point1.name, pax + opt.textMargin, p3 + (p4 - p3) / 2 - opt.textMargin / 2, opt);
                } else {
                    svg.addText(canvas, textSplit[0], pax + opt.textMargin, p3 + (p4 - p3) / 2, opt);
                    if(textSplit[1]) {
                        svg.addText(canvas,
                            textSplit[1], pax + opt.textMargin + getTextWidth(textSplit[0], opt.fontSize),
                            p3 + (p4 - p3) / 2,
                            opt, fontSubscriptSize());
                    }
                }
            }
        ),

        drawSwitch: makeDrawing(
            opt.switchLong,
            function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                var points = "",
                    textSplit = point1.text.split("_");

                svg.addLine(canvas, p3, pay, pl1, pay, opt.stroke);
                svg.addLine(canvas, pl2, pay, p4, pay, opt.stroke);
                if(point1.direction === "/") {
                    svg.addLine(canvas, pl1, pay, pl2, pay - opt.switchShort, opt.stroke);
                } else {
                    svg.addLine(canvas, pl2, pay, pl1, pay - opt.switchShort, opt.stroke);
                }
                svg.addCircle(canvas, pl1, pay, opt.switchRadius, opt.stroke, opt.switchFill);
                svg.addCircle(canvas, pl2, pay, opt.switchRadius, opt.stroke, opt.switchFill);
                svg.addText(canvas, textSplit[0], pl1, pay - opt.textMargin - opt.switchTextMarginX, opt);
                if(textSplit[1]) {
                    svg.addText(canvas,
                        textSplit[1],
                        pl1 + getTextWidth(textSplit[0], opt.fontSize),
                        pay - opt.textMargin - opt.switchTextMarginX,
                        opt, fontSubscriptSize());
                }
            }, function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                var points = "",
                    textSplit = point1.text.split("_");

                svg.addLine(canvas, pax, p3, pax, pl1, opt.stroke);
                svg.addLine(canvas, pax, pl2, pax, p4, opt.stroke);
                if(point1.direction === "/") {
                    svg.addLine(canvas, pax, pl2, pax + opt.switchShort, pl1, opt.stroke);
                } else {
                    svg.addLine(canvas, pax, pl1, pax + opt.switchShort, pl2, opt.stroke);
                }
                svg.addCircle(canvas, pax, pl1, opt.switchRadius, opt.stroke, opt.switchFill);
                svg.addCircle(canvas, pax, pl2, opt.switchRadius, opt.stroke, opt.switchFill);
                svg.addText(canvas, textSplit[0], pax + opt.textMargin, p3 + (p4 - p3) / 2, opt);
                if(textSplit[1]) {
                    svg.addText(canvas,
                        textSplit[1], pax + opt.textMargin + getTextWidth(textSplit[0], opt.fontSize),
                        p3 + (p4 - p3) / 2,
                        opt, fontSubscriptSize());
                }
            }
        ),

        getCanvas: function() {
            return canvas;
        }
    };
    return me;
}

module.exports = createDrawer;


},{"./akiha-common.js":2}],7:[function(require,module,exports){
/*
 * akiha-circuit
 *
 * Copyright (c) 2019 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
var common = require("./akiha-common.js");

function createSvg(base) {
    var me;

    me = common.extend(base(), {
        addLine: function(toAdd, x1, y1, x2, y2, stroke) {
            var node = me.createNode("line");

            node.setAttribute("x1", x1);
            node.setAttribute("y1", y1);
            node.setAttribute("x2", x2);
            node.setAttribute("y2", y2);
            node.setAttribute("stroke", stroke);
            toAdd.appendChild(node);
        },

        addPath: function(toAdd, d, fill, stroke) {
            var node = me.createNode("path");

            node.setAttribute("d", d);
            node.setAttribute("fill", fill);
            node.setAttribute("stroke", stroke);
            toAdd.appendChild(node);
        },

        addText: function(toAdd, text, x, y, opt, size) {
            var node = me.createNode("text");

            node.setAttribute("x", x);
            node.setAttribute("y", y);
            node.setAttribute("font-family", opt.fontFamily);
            node.setAttribute("font-size", size ? size : opt.fontSize);
            node.textContent = text;
            toAdd.appendChild(node);
        },

        addCircle: function(toAdd, x, y, radius, stroke, fill) {
            var node = me.createNode("circle");

            node.setAttribute("cx", x);
            node.setAttribute("cy", y);
            node.setAttribute("r", radius);
            node.setAttribute("stroke", stroke);
            if(fill) {
                node.setAttribute("fill", fill);
            }
            toAdd.appendChild(node);
        },

        addPolygon: function(toAdd, points, stroke) {
            var node = me.createNode("polygon");

            node.setAttribute("points", points);
            toAdd.appendChild(node);
        },

        addRect: function(toAdd, x, y, width, height, stroke) {
            var node = me.createNode("rect");

            node.setAttribute("x", x);
            node.setAttribute("y", y);
            node.setAttribute("width", width);
            node.setAttribute("height", height);
            node.setAttribute("stroke", stroke);
            toAdd.appendChild(node);
        }
    });
    return me;
}

module.exports = createSvg;


},{"./akiha-common.js":2}],8:[function(require,module,exports){
/*
 * akiha-circuit
 *
 * Copyright (c) 2019 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
function createSvg() {
    var me;

    me = {
        createNode: function(type) {
            return document.createElementNS("http://www.w3.org/2000/svg", type);
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


},{}]},{},[1]);

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
                   el.current !== undef ||
                   el.sw !== undef ||
                   el.ellipsis !== undef;
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

                        } else if(quadro.getChar() === ".") {
                            quadro.elementDefined = true;
                            if(quadro.isElementExist()) {
                                quadro.loopAddSerial();
                            }
                            quadro.getLoop().ellipsis = true;
                            do {
                                quadro.moveForward();
                            } while(quadro.getChar() === ".");

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
                        } else if(labelChars.test(quadro.getChar()) && !quadro.get().gridX && !quadro.get().gridY) {
                            return me.findLabel;
                        } else {
                            quadro.move(LEFT);
                            return me.scan;
                        }
                    },

                    findLabel: function(quadro) {
                        if(quadro.getChar() === BOUND || !(labelChars.test(quadro.getChar()) && !quadro.get().gridX && !quadro.get().gridY)) {
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
                        if(quadro.getChar() === BOUND || !(labelChars.test(quadro.getChar()) && !quadro.get().gridX && !quadro.get().gridY)) {
                            quadro.move(DOWN);
                            return me.readLabel;
                        } else {
                            return me.readName;
                        }
                    },

                    readName: function(quadro) {
                        if(quadro.getChar() !== BOUND && labelChars.test(quadro.getChar()) && !quadro.get().gridX && !quadro.get().gridY) {
                            quadro.name += quadro.getChar();
                            quadro.move(RIGHT);
                            return me.readName;
                        } else {
                            quadro.move(LEFT);
                            return me.readNameReturn;
                        }
                    },

                    readNameReturn: function(quadro) {
                        if(quadro.getChar() !== BOUND && labelChars.test(quadro.getChar()) && !quadro.get().gridX && !quadro.get().gridY) {
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

                        if(labelChars.test(quadro.getChar()) && !quadro.get().gridX && !quadro.get().gridY) {
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
                        } else if(labelChars.test(quadro.getChar()) && !quadro.get().gridX && !quadro.get().gridY) {
                            quadro.text = "";
                            quadro.name = "";
                            if(quadro.getChar(0, -1) !== BOUND && labelChars.test(quadro.getChar(0, -1)) && !quadro.get(0, -1).gridX && !quadro.get(0, -1).gridY) {
                                quadro.move(UP);
                                return new CallMachine(machineReadLabelUpDownProp("name"), me.moveDown);
                            } else if(quadro.getChar(0, 1) !== BOUND && labelChars.test(quadro.getChar(0, 1)) && !quadro.get(0, 1).gridX && !quadro.get(0, 1).gridY) {
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

                        if(labelChars.test(quadro.getChar()) && !quadro.get().gridX && !quadro.get().gridY && quadro.getChar() !== BOUND) {
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

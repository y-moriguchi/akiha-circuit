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
                    if(!isPointDrawn(loops[i][j])) {
                        drawnPoints.push(loops[i][j]);
                        if(loops[i][j].neighbor > 2) {
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
                        } else {
                            drawer.drawLine(drawSerial[k], loops[i][j + 1], k, drawSerial.length);
                        }
                    }
                }
                drawSerial = [];
            }
        }
    }
}

module.exports = draw;


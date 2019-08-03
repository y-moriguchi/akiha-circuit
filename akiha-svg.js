/*
 * akiha-circuit
 *
 * Copyright (c) 2019 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
var defaultOption = {
    sideLength: 110,
    marginX: 70,
    marginY: 30,
    stroke: "#000000",
    fill: "white",
    resistorLong: 50,
    resistorShort: 14,
    batteryGap: 6,
    batteryLong: 20,
    batteryShort: 10,
    capacitorGap: 10,
    capacitorLength: 16,
    inductorLength: 40,
    voltageACRadius: 10,
    voltageACx: 6,
    voltageACy: 8,
    voltageACFill: "none",
    jointRadius: 2,
    fontFamily: "sans-serif",
    fontSize: "10pt",
    textMargin: 14
};

function createDrawer(xMaxNodes, yMaxNodes, svg, option) {
    var me,
        canvas,
        sideLen,
        opt = defaultOption;

    function getPoint(point) {
        var rpoint = sideLen.getLength({ x: 0, y: 0 }, point),
            result;

        result = {
            x: opt.marginX + rpoint.x * opt.sideLength,
            y: opt.marginY + rpoint.y * opt.sideLength
        };
        return result;
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
            } else {
                if(pay < pby) {
                    p3 = p1y + (p2y - p1y) * (divide) / serial;
                    p4 = p1y + (p2y - p1y) * (divide + 1) / serial;
                } else {
                    p3 = p1y + (p2x - p1y) * (serial - divide - 1) / serial;
                    p4 = p1y + (p2y - p1y) * (serial - divide) / serial;
                }
                pl1 = p3 + (p4 - p3) / 2 - length / 2;
                pl2 = p3 + (p4 - p3) / 2 + length / 2;
                drawY(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4);
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
            canvas = svg.createCanvas(opt.marginX * 2 + xLen * opt.sideLength, opt.marginY * 2 + yLen * opt.sideLength);
        },

        drawLine: function(point1, point2) {
            svg.addLine(canvas, getPoint(point1).x, getPoint(point1).y, getPoint(point2).x, getPoint(point2).y, opt.stroke);
        },

        drawJoint: function(point) {
            svg.addCircle(canvas, getPoint(point).x, getPoint(point).y, opt.jointRadius, opt.stroke);
        },

        drawResistor: makeDrawing(
            opt.resistorLong,
            function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                var points = "";

                points += "M " + pl1 + " " + (pay - opt.resistorShort / 2) + " ";
                points += "L " + pl2 + " " + (pay - opt.resistorShort / 2) + " ";
                points += "L " + pl2 + " " + (pay + opt.resistorShort / 2) + " ";
                points += "L " + pl1 + " " + (pay + opt.resistorShort / 2) + " ";
                points += "L " + pl1 + " " + (pay - opt.resistorShort / 2);
                svg.addPath(canvas, points, opt.fill, opt.stroke);
                svg.addLine(canvas, p3, pay, pl1, pay, opt.stroke);
                svg.addLine(canvas, pl2, pay, p4, pay, opt.stroke);
                svg.addText(canvas, point1.text, pl1, pay - opt.textMargin, opt);
            }, function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                var points = "";

                points += "M " + (pax - opt.resistorShort / 2) + " " + pl1 + " ";
                points += "L " + (pax - opt.resistorShort / 2) + " " + pl2 + " ";
                points += "L " + (pax + opt.resistorShort / 2) + " " + pl2 + " ";
                points += "L " + (pax + opt.resistorShort / 2) + " " + pl1 + " ";
                points += "L " + (pax - opt.resistorShort / 2) + " " + pl1;
                svg.addPath(canvas, points, opt.fill, opt.stroke);
                svg.addLine(canvas, pax, p3, pax, pl1, opt.stroke);
                svg.addLine(canvas, pax, pl2, pax, p4, opt.stroke);
                svg.addText(canvas, point1.text, pax + opt.textMargin, p3 + (p4 - p3) / 2, opt);
            }
        ),

        drawBattery: makeDrawing(
            opt.batteryGap,
            function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                svg.addLine(canvas, p3, pay, pl1, pay, opt.stroke);
                svg.addLine(canvas, pl2, pay, p4, pay, opt.stroke);
                if((point1.voltage > 0 && p1x === pax) || (point1.voltage <= 0 && p1x !== pax)) {
                    svg.addLine(canvas, pl1, pay - opt.batteryLong / 2, pl1, pay + opt.batteryLong / 2, opt.stroke);
                    svg.addLine(canvas, pl2, pay - opt.batteryShort / 2, pl2, pay + opt.batteryShort / 2, opt.stroke);
                } else {
                    svg.addLine(canvas, pl2, pay - opt.batteryLong / 2, pl2, pay + opt.batteryLong / 2, opt.stroke);
                    svg.addLine(canvas, pl1, pay - opt.batteryShort / 2, pl1, pay + opt.batteryShort / 2, opt.stroke);
                }
                svg.addText(canvas, Math.abs(point1.voltage) + "V", pl1, pay - opt.textMargin, opt);
            }, function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                svg.addLine(canvas, pax, p3, pax, pl1, opt.stroke);
                svg.addLine(canvas, pax, pl2, pax, p4, opt.stroke);
                if((point1.voltage > 0 && p1y === pay) || (point1.voltage <= 0 && p1y !== pay)) {
                    svg.addLine(canvas, pax - opt.batteryLong / 2, pl1, pax + opt.batteryLong / 2, pl1, opt.stroke);
                    svg.addLine(canvas, pax - opt.batteryShort / 2, pl2, pax + opt.batteryShort / 2, pl2, opt.stroke);
                } else {
                    svg.addLine(canvas, pax - opt.batteryLong / 2, pl2, pax + opt.batteryLong / 2, pl2, opt.stroke);
                    svg.addLine(canvas, pax - opt.batteryShort / 2, pl1, pax + opt.batteryShort / 2, pl1, opt.stroke);
                }
                svg.addText(canvas, point1.text, pax + opt.textMargin, p3 + (p4 - p3) / 2, opt);
            }
        ),

        drawCapacitor: makeDrawing(
            opt.capacitorGap,
            function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                svg.addLine(canvas, p3, pay, pl1, pay, opt.stroke);
                svg.addLine(canvas, pl2, pay, p4, pay, opt.stroke);
                svg.addLine(canvas, pl1, pay - opt.capacitorLength / 2, pl1, pay + opt.capacitorLength / 2, opt.stroke);
                svg.addLine(canvas, pl2, pay - opt.capacitorLength / 2, pl2, pay + opt.capacitorLength / 2, opt.stroke);
                svg.addText(canvas, point1.text, pl1, pay - opt.textMargin, opt);
            }, function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                svg.addLine(canvas, pax, p3, pax, pl1, opt.stroke);
                svg.addLine(canvas, pax, pl2, pax, p4, opt.stroke);
                svg.addLine(canvas, pax - opt.capacitorLength / 2, pl1, pax + opt.capacitorLength / 2, pl1, opt.stroke);
                svg.addLine(canvas, pax - opt.capacitorLength / 2, pl2, pax + opt.capacitorLength / 2, pl2, opt.stroke);
                svg.addText(canvas, point1.text, pax + opt.textMargin, p3 + (p4 - p3) / 2, opt);
            }
        ),

        drawInductor: makeDrawing(
            opt.inductorLength,
            function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                function drawCoil1(num) {
                    var points = "";

                    points += "M " + (pl1 + opt.inductorLength * num / 4) + " " + pay + " ";
                    points += "a " + opt.inductorLength / 8 + " " + opt.inductorLength / 8 + " ";
                    points += "0 0 1 " + opt.inductorLength / 4 + " 0";
                    svg.addPath(canvas, points, opt.fill, opt.stroke);
                }
                svg.addLine(canvas, p3, pay, pl1, pay, opt.stroke);
                svg.addLine(canvas, pl2, pay, p4, pay, opt.stroke);
                drawCoil1(0);
                drawCoil1(1);
                drawCoil1(2);
                drawCoil1(3);
                svg.addText(canvas, point1.text, pl1, pay - opt.textMargin, opt);
            }, function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                function drawCoil1(num) {
                    var points = "";

                    points += "M " + pax + " " + (pl1 + opt.inductorLength * num / 4) + " ";
                    points += "a " + opt.inductorLength / 8 + " " + opt.inductorLength / 8 + " ";
                    points += "90 0 1 0 " + opt.inductorLength / 4;
                    svg.addPath(canvas, points, opt.fill, opt.stroke);
                }
                svg.addLine(canvas, pax, p3, pax, pl1, opt.stroke);
                svg.addLine(canvas, pax, pl2, pax, p4, opt.stroke);
                drawCoil1(0);
                drawCoil1(1);
                drawCoil1(2);
                drawCoil1(3);
                svg.addText(canvas, point1.text, pax + opt.textMargin, p3 + (p4 - p3) / 2, opt);
            }
        ),

        drawVoltageAC: makeDrawing(
            opt.voltageACRadius * 2,
            function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                var points = "";

                svg.addLine(canvas, p3, pay, pl1, pay, opt.stroke);
                svg.addLine(canvas, pl2, pay, p4, pay, opt.stroke);
                points += "M " + ((p4 + p3) / 2) + " " + pay + " ";
                points += "q " + (-opt.voltageACx / 2) + " " + (-opt.voltageACy / 2) + " " + (-opt.voltageACx) + " 0";
                svg.addPath(canvas, points, opt.fill, opt.stroke);
                points += "M " + ((p4 + p3) / 2) + " " + pay + " ";
                points += "q " + (opt.voltageACx / 2) + " " + (opt.voltageACy / 2) + " " + (opt.voltageACx) + " 0";
                svg.addPath(canvas, points, opt.fill, opt.stroke);
                svg.addCircle(canvas, (p4 + p3) / 2, pay, opt.voltageACRadius, opt.stroke, opt.voltageACFill);
                svg.addText(canvas, point1.text, pl1, pay - opt.textMargin, opt);
            }, function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                var points = "";

                svg.addLine(canvas, pax, p3, pax, pl1, opt.stroke);
                svg.addLine(canvas, pax, pl2, pax, p4, opt.stroke);
                points += "M " + pax + " " + ((p4 + p3) / 2) + " ";
                points += "q " + (-opt.voltageACx / 2) + " " + (-opt.voltageACy / 2) + " " + (-opt.voltageACx) + " 0";
                svg.addPath(canvas, points, opt.fill, opt.stroke);
                points += "M " + pax + " " + ((p4 + p3) / 2) + " ";
                points += "q " + (opt.voltageACx / 2) + " " + (opt.voltageACy / 2) + " " + (opt.voltageACx) + " 0";
                svg.addPath(canvas, points, opt.fill, opt.stroke);
                svg.addCircle(canvas, pax, (p4 + p3) / 2, opt.voltageACRadius, opt.stroke, opt.voltageACFill);
                svg.addText(canvas, point1.text, pax + opt.textMargin, p3 + (p4 - p3) / 2, opt);
            }
        ),

        getCanvas: function() {
            return canvas;
        }
    };
    return me;
}

module.exports = createDrawer;


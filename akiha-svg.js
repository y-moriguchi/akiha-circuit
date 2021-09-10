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
    ellipsisRadius: 1,
    ellipsisLength: 30,
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
    terminalLabelMargin: 14,
    terminalLabelMarginY: 3
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
                svg.addText(canvas, point.terminalLabelLeft, p.x - opt.terminalLabelMargin, p.y - opt.terminalLabelMarginY, opt);
            }
            if(point.terminalLabelRight) {
                svg.addText(canvas, point.terminalLabelRight, p.x + opt.terminalRadius * 2, p.y - opt.terminalLabelMarginY, opt);
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

        drawEllipsis: makeDrawing(
            opt.ellipsisLength,
            function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                svg.addLine(canvas, p3, pay, pl1, pay, opt.stroke);
                svg.addLine(canvas, pl2, pay, p4, pay, opt.stroke);
                svg.addCircle(canvas, pl1 + opt.ellipsisLength / 4, pay, opt.ellipsisRadius, opt.stroke, opt.stroke);
                svg.addCircle(canvas, pl1 + opt.ellipsisLength * 2/ 4, pay, opt.ellipsisRadius, opt.stroke, opt.stroke);
                svg.addCircle(canvas, pl1 + opt.ellipsisLength * 3 / 4, pay, opt.ellipsisRadius, opt.stroke, opt.stroke);
            }, function(point1, point2, pax, pay, pbx, pby, p1x, p1y, p2x, p2y, pl1, pl2, p3, p4) {
                svg.addLine(canvas, pax, p3, pax, pl1, opt.stroke);
                svg.addLine(canvas, pax, pl2, pax, p4, opt.stroke);
                svg.addCircle(canvas, pax, pl1 + opt.ellipsisLength / 4, opt.ellipsisRadius, opt.stroke, opt.stroke);
                svg.addCircle(canvas, pax, pl1 + opt.ellipsisLength * 2/ 4, opt.ellipsisRadius, opt.stroke, opt.stroke);
                svg.addCircle(canvas, pax, pl1 + opt.ellipsisLength * 3 / 4, opt.ellipsisRadius, opt.stroke, opt.stroke);
            }
        ),

        getCanvas: function() {
            return canvas;
        }
    };
    return me;
}

module.exports = createDrawer;


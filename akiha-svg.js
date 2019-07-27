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
    margin: 40,
    stroke: "#000000",
    fill: "white",
    resistorLong: 50,
    resistorShort: 14,
    batteryGap: 6,
    batteryLong: 20,
    batteryShort: 10,
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
            x: opt.margin + rpoint.x * opt.sideLength,
            y: opt.margin + rpoint.y * opt.sideLength
        };
        return result;
    }

    me = {
        setSideLength: function(sideLength) {
            var xLen,
                yLen;

            sideLen = sideLength;
            xLen = sideLen.getLength({ x: 0, y: 0 }, { x: xMaxNodes - 1, y: 0 }).x;
            yLen = sideLen.getLength({ x: 0, y: 0 }, { x: 0, y: yMaxNodes - 1 }).y;
            canvas = svg.createCanvas(opt.margin * 2 + xLen * opt.sideLength, opt.margin * 2 + yLen * opt.sideLength);
        },

        drawLine: function(point1, point2) {
            svg.addLine(canvas, getPoint(point1).x, getPoint(point1).y, getPoint(point2).x, getPoint(point2).y, opt.stroke);
        },

        drawJoint: function(point) {
            svg.addCircle(canvas, getPoint(point).x, getPoint(point).y, opt.jointRadius, opt.stroke);
        },

        drawResistor: function(point1, point2, divide, serial) {
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
                pl1 = p3 + (p4 - p3) / 2 - opt.resistorLong / 2;
                pl2 = p3 + (p4 - p3) / 2 + opt.resistorLong / 2;
                points += "M " + pl1 + " " + (pay - opt.resistorShort / 2) + " ";
                points += "L " + pl2 + " " + (pay - opt.resistorShort / 2) + " ";
                points += "L " + pl2 + " " + (pay + opt.resistorShort / 2) + " ";
                points += "L " + pl1 + " " + (pay + opt.resistorShort / 2) + " ";
                points += "L " + pl1 + " " + (pay - opt.resistorShort / 2);
                svg.addPath(canvas, points, opt.fill, opt.stroke);
                svg.addLine(canvas, p3, pay, pl1, pay, opt.stroke);
                svg.addLine(canvas, pl2, pay, p4, pay, opt.stroke);
                svg.addText(canvas, point1.text, pl1, pay - opt.textMargin, opt);
            } else {
                if(pax < pbx) {
                    p3 = p1y + (p2y - p1y) * (divide) / serial;
                    p4 = p1y + (p2y - p1y) * (divide + 1) / serial;
                } else {
                    p3 = p1y + (p2x - p1y) * (serial - divide - 1) / serial;
                    p4 = p1y + (p2y - p1y) * (serial - divide) / serial;
                }
                pl1 = p3 + (p4 - p3) / 2 - opt.resistorLong / 2;
                pl2 = p3 + (p4 - p3) / 2 + opt.resistorLong / 2;
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
        },

        drawBattery: function(point1, point2, divide, serial) {
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
                pl1 = p3 + (p4 - p3) / 2 - opt.batteryGap / 2;
                pl2 = p3 + (p4 - p3) / 2 + opt.batteryGap / 2;
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
            } else {
                if(pax < pbx) {
                    p3 = p1y + (p2y - p1y) * (divide) / serial;
                    p4 = p1y + (p2y - p1y) * (divide + 1) / serial;
                } else {
                    p3 = p1y + (p2y - p1y) * (serial - divide - 1) / serial;
                    p4 = p1y + (p2y - p1y) * (serial - divide) / serial;
                }
                pl1 = p3 + (p4 - p3) / 2 - opt.batteryGap / 2;
                pl2 = p3 + (p4 - p3) / 2 + opt.batteryGap / 2;
                svg.addLine(canvas, pax, p3, pax, pl1, opt.stroke);
                svg.addLine(canvas, pax, pl2, pax, p4, opt.stroke);
                if((point1.voltage > 0 && p1y === pay) || (point1.voltage <= 0 && p1y !== pay)) {
                    svg.addLine(canvas, pax - opt.batteryLong / 2, pl1, pax + opt.batteryLong / 2, pl1, opt.stroke);
                    svg.addLine(canvas, pax - opt.batteryShort / 2, pl2, pax + opt.batteryShort / 2, pl2, opt.stroke);
                } else {
                    svg.addLine(canvas, pax - opt.batteryLong / 2, pl2, pax + opt.batteryLong / 2, pl2, opt.stroke);
                    svg.addLine(canvas, pax - opt.batteryShort / 2, pl1, pax + opt.batteryShort / 2, pl1, opt.stroke);
                }
                svg.addText(canvas, Math.abs(point1.voltage) + "V", pax + opt.textMargin, p3 + (p4 - p3) / 2, opt);
            }
        },

        getCanvas: function() {
            return canvas;
        }
    };
    return me;
}

module.exports = createDrawer;


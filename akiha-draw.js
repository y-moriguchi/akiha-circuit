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
        drawn = [];

    function isSamePosition(point1, point2) {
        return point1.x === point2.x && point1.y === point2.y;
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

    for(i = 0; i < loops.length; i++) {
        for(j = 0; j < loops[i].length - 1; j++) {
            if(!isSideDrawn(loops[i][j], loops[i][j + 1])) {
                drawn.push([loops[i][j], loops[i][j + 1]]);
                if(loops[i][j].voltage !== undef) {
                    drawer.drawBattery(loops[i][j], loops[i][j + 1]);
                } else if(loops[i][j].resist !== undef) {
                    drawer.drawResistor(loops[i][j], loops[i][j + 1]);
                } else {
                    drawer.drawLine(loops[i][j], loops[i][j + 1]);
                }
            }
        }
    }
}

module.exports = draw;


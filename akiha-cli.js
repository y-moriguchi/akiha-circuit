#!/usr/bin/env node
/*
 * akiha-circuit
 *
 * Copyright (c) 2019 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
var text = require("./akiha-text.js");
var defaultOption = {
    option: {
        scriptType: "text/x-akiha-circuit"
    },
    direction: {
        imageDir: "img"
    }
};

function main() {
    if(process.argv.length < 3) {
        console.log("Usage: akihac filename.akihac[.extension]");
        process.exit(2);
    }
    process.exit(text("default", process.argv[2], defaultOption));
}

main();


#!/usr/bin/env node
/*
 * akiha-circuit
 *
 * Copyright (c) 2019 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
var fs = require("fs");
var text = require("./akiha-text.js");
var defaultOption = {
    option: {
        scriptType: "text/x-akiha-circuit"
    },
    direction: {
        imageDir: "img"
    },
    config: {}
};

function main() {
    var argcount = 2,
        input;

    while(true) {
        if(process.argv.length < argcount + 1) {
            break;
        } else if(process.argv[argcount] === "-c" || process.argv[argcount] === "--config") {
            if(process.argv.length < argcount + 2) {
                console.log("Usage: akihac [--config configfile] filename.akihac[.extension]");
                process.exit(2);
            }
            try {
                input = fs.readFileSync(process.argv[argcount + 1], 'utf8');
            } catch(err) {
                console.error('Config file %s can not read', process.argv[argcount + 1]);
                //throw err;
                process.exit(2);
            }
            defaultOption.config = JSON.parse(input);
            argcount += 2;
        } else {
            break;
        }
    }

    if(process.argv.length < argcount + 1) {
        console.log("Usage: akihac [--config configfile] filename.akihac[.extension]");
        process.exit(2);
    }
    process.exit(text("default", process.argv[argcount], defaultOption));
}

main();


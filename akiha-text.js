/**
 * akiha-circuit
 *
 * Copyright (c) 2019 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
var fs = require("fs"),
    akiha = require("./akiha-facade.js"),
    common = require("./akiha-common.js"),
    svgLib = require("./svg-direct.js"),
    preprocessors,
    ptn = {};

function makeMkdir(imageDir) {
    var madedir = false;
    return function() {
        var fstat;
        if(madedir) {
            return;
        }
        try {
            fstat = fs.statSync(imageDir);
        } catch(err) {
            if(err.code === 'ENOENT') {
                fs.mkdirSync(imageDir, 493);  // 0o755
            } else {
                throw err;
            }
        }
        if(fstat && !fstat.isDirectory()) {
            throw new Error(imageDir + " is not a directory");
        }
        madedir = true;
    }
}

function makeimg(imageDir, dataUri, option) {
    var num = 1,
        mkdir = makeMkdir(imageDir);

    return function(input, opt, base) {
        var foutput,
            imgfn,
            result;
        foutput = akiha.createSvg(input, svgLib, option).toString();
        if(dataUri) {
            throw new Error("Data URI is not supported");
        } else {
            mkdir();
            imgfn = base + "." + ("000" + (num++)).slice(-4);
            result = imageDir + "/" + imgfn + ".svg";
            fs.writeFileSync(result, foutput);
        }
        return result;
    }
}

function preprocessimg(beginPatterns, endPatterns, imgOutput, useDataUri) {
    var beginREs,
        endREs;

    function initPattern(opt) {
        if(!beginREs) {
            var i,
                j;
            beginREs = [];
            endREs = [];
            for(i = 0; i < beginPatterns.length; i++) {
                beginREs[i] = [];
                for(j = 0; j < beginPatterns[i].length; j++) {
                    beginREs[i][j] = common.replaceTemplateRegExp(beginPatterns[i][j], opt, 'i');
                }
                endREs[i] = new RegExp(endPatterns[i], 'i');
            }
        }
    }

    function matchPattern(line, lastmatch) {
        var i,
            match;

        function execresult(num, lineno) {
            var rematch,
                result = {};
            if(!!(rematch = beginREs[num][lineno].exec(line))) {
                result.lineno = lineno + 1;
                result.num = num;
                result.match = rematch;
                result.accept = result.lineno >= beginREs[num].length;
                return result;
            } else {
                return false;
            }
        }

        if(lastmatch) {
            return execresult(lastmatch.num, lastmatch.lineno);
        } else {
            for(i = 0; i < beginREs.length; i++) {
                if(!!(match = execresult(i, 0))) {
                    return match;
                }
            }
            return false;
        }
    }

    return function(fileinput, opt, base) {
        var input,
            lines,
            line,
            output = "",
            i,
            state = "INIT",
            match = null,
            dataUri = useDataUri && opt.direction.dataUri;
            img = makeimg(opt.direction.imageDir, dataUri, opt.config),
            imgfn = {};

        initPattern(opt.option);
        lines = fileinput.split(/\r?\n/);
        for(i = 0; i < lines.length; i++) {
            line = lines[i];
            switch(state) {
            case "INIT":
                if(!!(match = matchPattern(line, match)) && match.accept) {
                    state = "LINE";
                    input = "";
                } else {
                    output += line + "\n";
                }
                break;

            case "LINE":
                if(endREs[match.num].test(line)) {
                    imgfn.img = img(input, opt.option, base);
                    if(typeof imgOutput === 'string') {
                        output += common.replaceTemplate(imgOutput, imgfn) + "\n";
                    } else {
                        output += imgOutput(imgfn, match.match);
                    }
                    state = "INIT";
                    match = null;
                } else {
                    input += line + "\n";
                }
                break;
            }
        }
        return output;
    }
}

function preprocess(pptype, file, opt) {
    var i,
        match,
        input,
        output,
        pp = preprocessors[pptype];

    for(i = 0; i < pp.length; i++) {
        match = pp[i].pattern.exec(file);
        if(match) {
            try {
                input = fs.readFileSync(file, 'utf8');
                output = pp[i].action(input, opt, match[1]);
                fs.writeFileSync(match[1] + (match[2] ? match[2] : ""), output);
                return 0;
            } catch(err) {
                console.error('File %s can not read', file);
                //throw err;
                return 2;
            }
        }
    }
    console.error('Unrecognized file %s', file);
    return 2;
}

ptn.val = '(?:[^\\/>\s]+|\'[^\']+\'|"[^"]+")';
ptn.valtmp = '(?:@className@|\'(?:[^\'\\s]+\\s+)*@className@(?:\\s+[^\'\\s]+)*\'|"(?:[^"\\s]+\\s+)*@className@(?:\\s+[^"\\s]+)*")';
ptn.classe = '[^\\/>\\s=]+=' + ptn.val;
ptn.classes = '(?:\\s*' + ptn.classe + ')*';
ptn.attr = ptn.classes + '\\s*class=' + ptn.valtmp + ptn.classes;
ptn.pre = '<(pre)(' + ptn.attr + ')\\s*>';
ptn.div = '<(div)(' + ptn.attr + ')\\s*>';
ptn.script = '<(script)\\s+type=(?:\'@scriptType@\'|"@scriptType@")>';
preprocessors = {
    "default": [
        {
            pattern: /^(.*)\.akihac(\.md)$/,
            action: preprocessimg([["^\\`\\`\\`akiha-circuit$"]], ["^\\`\\`\\`$"], '![svg](@img@)')
        },
        {
            pattern: /^(.*)\.akihac(\.html?)$/,
            action: preprocessimg(
                        [[ptn.script]],
                        ['^\\s*<\\/script>'],
                        function(imgfn, match) {
                            var output = '';
                            switch(match[1].toLowerCase()) {
                            case 'script':
                                output += common.replaceTemplate('<img src="@img@">', imgfn) + "\n";
                                break;
                            }
                            return output;
                        },
                        true)
        },
        {
            pattern: /^(.*)\.akihac(\.a(scii)?doc)$/,
            action: preprocessimg([["^\\[akiha-circuit\\]$", "^-+$"]], ["^-+$"], 'image::@img@[svg]')
        }
    ]
}

module.exports = preprocess;


import {getFiles, readFile, writeFile} from './utils';
const path = require('path');

function parse(dir) {
    let paths = getFiles(dir);
    let files = paths.map((p) => {
        let absolutePath = path.join(dir, p);
        let content = readFile(absolutePath);

        return {
            content,
            path: p,
        };
    });
    let groupedFiles = {
        other: [],
    };

    files.forEach((file) => {
        let extname = path.extname(file.path);

        if (['.wxss', '.wxml', '.js', '.json'].includes(extname)) {
            let name = file.path.replace(extname, '');
            groupedFiles[name] = groupedFiles[name] || [];
            groupedFiles[name].push(file);

            return;
        }

        groupedFiles.other.push(file);
    });

    for (const [name, files] of Object.entries(groupedFiles)) {
        if (name !== 'other') {
            let keep = files.some((file) => {
                let extname = path.extname(file.path);
                return ['.wxss', '.wxml'].includes(extname);
            });

            if (!keep) {
                groupedFiles.other = groupedFiles.other.concat(files);
                delete groupedFiles[name];
            }
        }
    }

    return groupedFiles;
}

function formatContent(content, type) {
    if (typeof content !== 'string') {
        throw new Error(`${content} is not String`);
    }

    let res = [];

    for (let i = 0; i < content.length; i++) {
        if (i === content.length - 1 && content[i] === '\n') {
            res[i] = '';
        } else if (type === 'wxml') {
            if (i === 0) {
                res[i] = '  ' + content[i];  
            } else if (content[i] === '\n') {
                res[i] = content[i] + '  ';
            } else {
                res[i] = content[i];
            }
        } else {
            res[i] = content[i];
        }
    }

    return res.join('');
}

function output(groupedFiles, outputDir) {
    for (const [name, files] of Object.entries(groupedFiles)) {
        if (name !== 'other') {
            let res = [];
            files.forEach((file) => {
                let type = path.extname(file.path).replace('.', '');
                let content = formatContent(file.content, type);
                switch (type) {
                    case 'js':
                        res[0] = `<script>\n${content}\n</script>\n\n`;
                        break;
                    case 'json':
                        res[1] = `<config>\n${content}\n</config>\n\n`;
                        break;
                    case 'wxml':
                        res[2] = `<template>\n${content}\n</template>\n\n`;
                        break;
                    case 'wxss':
                        res[3] = `<style>\n${content}\n</style>\n\n`;
                        break;
                    default:
                        break;
                }
            });

            res = res.join('');
            let p = path.join(outputDir, name + '.wxa');
            writeFile(p, res);
        } else {
            files.forEach((file) => {
                let p = path.join(outputDir, file.path);
                writeFile(p, file.content);
            });
        }
    }
}

export default function convert(cmd) {
    let {input: inputDir, output: outDir} = cmd;
    let groupedFiles = parse(inputDir);
    output(groupedFiles, outDir);
}

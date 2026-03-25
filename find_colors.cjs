const fs = require("fs");
const path = require("path");

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith(".css") || file.endsWith(".ts" || file.endsWith(".tsx"))) {
            results.push(file);
        }
    });
    return results;
}

const files = walk("src");
let allColors = new Set();
const rgbRegex = /rgba?\([^)]+\)/gi;
const hexRegex = /#[0-9a-fA-F]{2,8}\b/gi;
const nameRegex = /\b(purple|violet|magenta|fuchsia|pink)\b/gi;

files.forEach(f => {
    const content = fs.readFileSync(f, "utf8");
    const rgbs = content.match(rgbRegex) || [];
    const hexs = content.match(hexRegex) || [];
    const names = content.match(nameRegex) || [];
    rgbs.forEach(c => allColors.add(`${f} -> ${c}`));
    hexs.forEach(c => allColors.add(`${f} -> ${c}`));
    names.forEach(c => allColors.add(`${f} -> ${c}`));
});

console.log([...allColors].sort().join("\n"));
const fs = require('fs');
const path = require('path');

const targetFiles = [
    'app/inventory/in/page.js',
    'app/inventory/milk/in/page.js',
    'app/inventory/vegetable-fruit/in/page.js',
    'app/inventory/out/page.js',
    'app/inventory/milk/out/page.js',
    'app/inventory/vegetable-fruit/out/page.js',
    'app/inventory/page.js',
    'app/staff/page.js',
    'app/othermaintenance/page.js'
];

targetFiles.forEach(relPath => {
    const fullPath = path.join(__dirname, '..', relPath);
    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${fullPath}`);
        return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    if (!content.includes('alert(')) return;

    // determine relative depth for import
    const parts = relPath.split('/');
    const depth = parts.length - 1;
    let prefix = '../'.repeat(depth);
    let importPath = `'${prefix}components/Toast'`;

    // add import if missing
    if (!content.includes("useToast")) {
        const importRegex = /import React[^;]+;/;
        if (importRegex.test(content)) {
            content = content.replace(importRegex, match => `${match}\nimport { useToast } from ${importPath};`);
        } else {
            content = `import { useToast } from ${importPath};\n` + content;
        }
    }

    // add const { showToast } = useToast(); inside the main component function
    if (!content.includes('showToast = useToast()')) {
        const funcRegex = /(export default function [^(]+\([^)]*\)\s*\{)/;
        if (funcRegex.test(content)) {
            content = content.replace(funcRegex, match => `${match}\n    const { showToast } = useToast();`);
        }
    }

    // replace alert(msg) with showToast(msg, type)
    let modified = content.replace(/alert\(([^)]+)\)/g, (match, p1) => {
        let type = 'error';
        let p1Lower = p1.toLowerCase();
        if (p1Lower.includes('success') || p1Lower.includes('added') || p1Lower.includes('saved') || p1Lower.includes('updated') || p1Lower.includes('deleted') || p1Lower.includes('reduced') || p1Lower.includes('registered')) {
            type = 'success';
        } else if (p1Lower.includes('please') || p1Lower.includes('required') || p1Lower.includes('warning') || p1Lower.includes('exceed')) {
            type = 'warning';
        }
        return `showToast(${p1}, '${type}')`;
    });

    if (content !== modified) {
        fs.writeFileSync(fullPath, modified, 'utf8');
        console.log(`Modified ${relPath}`);
    }
});

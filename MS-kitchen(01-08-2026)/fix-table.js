const fs = require('fs');
let code = fs.readFileSync('app/inventory/page.js', 'utf8');

const theadRegex = /<tr className="bg-gray-50 text-\\[11px\\] font-bold uppercase tracking-wider text-slate-600 backdrop-blur-sm sticky top-0 z-20 whitespace-nowrap double-header-row">([\\s\\S]*?)<\\/tr>/;
code = code.replace(theadRegex, (match, inner) => {
    const classes = [
        "py-5 px-6 w-10 text-center",
        "py-5 px-6 text-center w-[80px]",
        "py-5 px-6 border-r-2 border-gray-200",
        "py-5 px-6 text-center",
        "py-5 px-6 text-center",
        "py-5 px-6 text-center",
        "py-5 px-6 text-center",
        "py-5 px-6 text-center",
        "py-5 px-6 text-center border-r-2 border-gray-200",
        "py-5 px-6 text-left border-r-2 border-gray-200",
        "py-5 px-6 text-right",
        "py-5 px-6 text-left"
    ];
    let i = 0;
    return match.replace(/<th className="[^"]*"/g, (m) => `<th className="${classes[i++] || 'py-5 px-6'}"`);
});

const tbodyMapRegex = /paginatedItems\\.map\\(\\(item\\) => \\{/;
code = code.replace(tbodyMapRegex, 'paginatedItems.map((item, index) => {');

const rowClassRegex = /const rowClass = isCritical[\\s\\S]*?"hover:bg-gray-50";/;
code = code.replace(rowClassRegex, `const rowClass = isEditing ? 'bg-orange-50 ring-2 ring-inset ring-primary/40 relative z-10' : isCritical ? 'bg-red-50 hover:bg-red-100/60' : isLow ? 'bg-amber-50 hover:bg-amber-100/60' : index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50 hover:bg-gray-100/60';`);

const motionTrRegex = /<motion\\.tr[\\s\\S]*?className=\\{.*?\\}[\\s\\S]*?>([\\s\\S]*?)<\\/motion\\.tr>/g;
code = code.replace(motionTrRegex, (match, inner) => {
    let classes = [
        "py-5 px-6 w-10 text-center",
        "py-5 px-6 text-center w-[80px]",
        "py-5 px-6 border-r-2 border-gray-200",
        "py-5 px-6 text-center",
        "py-5 px-6 text-center",
        "py-5 px-6 text-center",
        "py-5 px-6 text-center",
        "py-5 px-6 text-center",
        "py-5 px-6 text-center border-r-2 border-gray-200",
        "py-5 px-6 text-left border-r-2 border-gray-200",
        "py-5 px-6 text-right",
        "py-5 px-6 text-left"
    ];
    let i = 0;
    return match.replace(/<td className="[^"]*"/g, (m) => `<td className="${classes[i++] || 'py-5 px-6'}"`);
});

code = code.replace(/className=\\{\`\\$\\{rowClass\\} transition-colors group border-b border-border\\/90 bg-white\`\\}/g, "className={`\\${rowClass} transition-colors group`}");
code = code.replace(/className=\\{\`\\$\\{rowClass\\} transition-colors group\`\\}/g, "className={`\\${rowClass} transition-colors group`}");

fs.writeFileSync('app/inventory/page.js', code);

const fs = require('fs');
const path = 'app/inventory/in/page.js';
let content = fs.readFileSync(path, 'utf8');

// Target the header
if (!content.includes('GST (%)')) {
    content = content.replace(
        /(<th className=\"pb-4 px-3 font-semibold text-foreground\/70 w-\[7%\] text-center\">Qty <span className=\"text-destructive\">\*<\/span><\/th>)/,
        '$1\n                                                        <th className=\"pb-4 px-3 font-semibold text-foreground/70 w-[7%] text-center\">GST (%)</th>'
    );
}

// Target the body input
// We want to insert AFTER the </td> of the qty cell
const qtyMatch = content.match(/<input type=\"number\" value=\{item\.quantity\}.*?<\/td>/s);
if (qtyMatch && !content.includes('item.gstRate')) {
    const afterQtyTd = qtyMatch[0];
    content = content.replace(
        afterQtyTd,
        afterQtyTd + `
                                                                <td className=\"py-5 px-1\">
                                                                    <input type="number" value={item.gstRate} onChange={e => handleRowChange(item.tempId, 'gstRate', e.target.value)} placeholder="0%" className="w-full text-center text-xs font-semibold text-blue-500 bg-transparent border-b-2 border-border focus:border-primary py-1.5 outline-none hover:border-muted-foreground/30 transition-colors" />
                                                                </td>`
    );
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated GST column (take 2)');

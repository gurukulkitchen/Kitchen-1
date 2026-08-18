import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import * as XLSX from 'xlsx';
import KitchenItem from '../../../../../models/KitchenItem';
import KitchenTransaction from '../../../../../models/KitchenTransaction';
import Category from '../../../../../models/Category';
import Unit from '../../../../../models/Unit';

const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI);
}

export async function POST(req) {
    try {
        await connectDB();
        const formData = await req.formData();
        const file = formData.get('file');
        const type = formData.get('type'); // 'IN', 'OUT' or 'REGISTER'
        const companyId = formData.get('companyId');

        if (!file || !type || !companyId || companyId === 'undefined') {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        let validRows = [];
        let errors = [];

        // Fetch Master Data (Categories and Units in system)
        const [masterCategories, masterUnits] = await Promise.all([
            Category.find({}).select('name'),
            Unit.find({}).select('name')
        ]);
        const validCategoryNames = new Set(masterCategories.map(c => c.name.toLowerCase().trim()));
        const validUnitNames = new Set(masterUnits.map(u => u.name.toLowerCase().trim()));

        const categoryIdToName = new Map();
        masterCategories.forEach(c => categoryIdToName.set(c._id.toString(), c.name));
        
        const unitIdToName = new Map();
        masterUnits.forEach(u => unitIdToName.set(u._id.toString(), u.name));

        // Fetch all items for this company to avoid N+1 queries
        const allItems = await KitchenItem.find({ companyId: companyId }).select('_id name currentStock currentRate category unit gst');
        const itemMap = new Map();
        allItems.forEach(item => itemMap.set(item.name.toLowerCase().trim(), item));

        // Fetch active batches for rate-wise OUT validation
        const activeBatches = await KitchenTransaction.find({
            companyId: companyId,
            type: 'IN',
            remainingQuantity: { $gt: 0 }
        }).select('item rate remainingQuantity');

        const batchStockMap = new Map();
        activeBatches.forEach(b => {
            const key = `${b.item.toString()}:${Number(b.rate || 0)}`;
            batchStockMap.set(key, (batchStockMap.get(key) || 0) + b.remainingQuantity);
        });

        for (const [index, row] of jsonData.entries()) {
            const rowIndex = index + 2; // Excel row number (1-based, +1 for header)
            try {
                const itemName = row['Item Name']?.toString().trim();
                const excelCategory = row['Category']?.toString().trim();
                const excelUnit = row['Unit']?.toString().trim();

                if (type === 'REGISTER') {
                    if (!itemName) {
                        errors.push(`Row ${rowIndex}: Item Name missing`);
                        continue;
                    }
                    if (!excelCategory) {
                        errors.push(`Row ${rowIndex}: Category missing for '${itemName}'`);
                        continue;
                    }

                    // Validate Category against Master Data
                    if (!validCategoryNames.has(excelCategory.toLowerCase())) {
                        errors.push(`Row ${rowIndex}: Category '${excelCategory}' is not found in system. Please add it in Master Data first.`);
                        continue;
                    }

                    // Validate Unit against Master Data
                    const unitToUse = excelUnit || ((excelCategory?.toUpperCase().includes('MILK') || excelCategory?.toUpperCase().includes('DAIRY')) ? 'L' : (excelCategory?.toUpperCase().includes('VEG') || excelCategory?.toUpperCase().includes('FRUIT')) ? 'kg' : 'PC');
                    if (!validUnitNames.has(unitToUse.toLowerCase())) {
                        errors.push(`Row ${rowIndex}: Unit '${unitToUse}' is invalid or not registered in Master Data.`);
                        continue;
                    }

                    // Check if item name already exists in DB for this company
                    if (itemMap.has(itemName.toLowerCase())) {
                        errors.push(`Row ${rowIndex}: Item '${itemName}' already exists in catalog`);
                        continue;
                    }

                    validRows.push({
                        name: itemName,
                        category: excelCategory,
                        unit: unitToUse,
                        alertLow: Number(row['Alert Low'] || 0),
                        alertCritical: Number(row['Alert Crit'] || 0),
                        note: row['Note / Remark']?.toString().trim() || '',
                        companyId
                    });
                    continue; // Skip further processing for registration
                }

                // For IN/OUT transitions
                let qty = Number(row['Quantity']);
                if (isNaN(qty)) qty = 0;

                let dateStr = row['Date (YYYY-MM-DD)'];
                let date;
                if (typeof dateStr === 'number') {
                    date = new Date(Math.round((dateStr - 25569) * 86400 * 1000));
                } else {
                    date = dateStr ? new Date(dateStr) : new Date();
                }

                if (isNaN(date.getTime())) date = new Date();

                if (!itemName) {
                    errors.push(`Row ${rowIndex}: Item Name missing`);
                    continue;
                }

                if (qty < 0) {
                    errors.push(`Row ${rowIndex}: Negative Quantity not allowed`);
                    continue;
                }

                const item = itemMap.get(itemName.toLowerCase());

                if (!item) {
                    errors.push(`Row ${rowIndex}: Item '${itemName}' not found in catalog`);
                    continue;
                }

                // Validate Excel Category and Unit against Item in DB
                const itemCategoryName = categoryIdToName.get(item.category.toString()) || '';
                if (excelCategory && excelCategory.toLowerCase() !== itemCategoryName.toLowerCase()) {
                    errors.push(`Row ${rowIndex}: Category '${excelCategory}' does not match catalog category '${itemCategoryName}' for '${itemName}'`);
                    continue;
                }

                const itemUnitName = unitIdToName.get(item.unit.toString()) || '';
                if (excelUnit && excelUnit.toLowerCase() !== itemUnitName.toLowerCase()) {
                    errors.push(`Row ${rowIndex}: Unit '${excelUnit}' does not match catalog unit '${itemUnitName}' for '${itemName}'`);
                    continue;
                }

                if (type === 'OUT') {
                    const rowRate = Number(row['Rate']);
                    if (isNaN(rowRate)) {
                        errors.push(`Row ${rowIndex}: Rate is required for OUT transactions`);
                        continue;
                    }

                    const batchKey = `${item._id}:${rowRate}`;
                    const availableAtRate = batchStockMap.get(batchKey) || 0;

                    if (availableAtRate < qty) {
                        errors.push(`Row ${rowIndex}: No stock found for '${itemName}' at rate ₹${rowRate}. Available at this rate: ${availableAtRate}`);
                        continue;
                    }

                    if ((item.currentStock || 0) < qty) {
                        errors.push(`Row ${rowIndex}: Insufficient total stock for '${itemName}'. Available: ${item.currentStock}, Requested: ${qty}`);
                        continue;
                    }

                    const totalAmount = rowRate * qty;
                    validRows.push({
                        item: item._id,
                        itemName: item.name,
                        category: categoryIdToName.get(item.category.toString()) || item.category,
                        quantity: qty,
                        rate: rowRate,
                        totalAmount: Number(totalAmount.toFixed(2)),
                        date: date.toISOString(),
                        department: row['Department'] || 'LUNCH',
                        event: row['Event'] || 'REGULAR',
                        narration: row['Narration'] || '',
                        unit: unitIdToName.get(item.unit.toString()) || item.unit
                    });

                } else if (type === 'IN') {
                    const rate = Number(row['Rate'] || 0);
                    const mrp = Number(row['MRP'] || 0);

                    // Prioritize GST from Excel, fallback to item master GST
                    const excelGstRate = row['GST %'] || row['GST Rate'] || row['GST'] || row['GST Percentage'];
                    const excelGstAmount = row['GST Amount'] || row['GST Amt'];

                    let gstPercent = Number(item.gst || 0);
                    if (excelGstRate !== undefined && !isNaN(Number(excelGstRate))) {
                        gstPercent = Number(excelGstRate);
                    }

                    const grandTotal = mrp * qty;
                    let totalAmount, gstAmount;

                    if (excelGstAmount !== undefined && !isNaN(Number(excelGstAmount)) && (excelGstRate === undefined || isNaN(Number(excelGstRate)))) {
                        // If only GST Amount is provided, derive percent and total
                        gstAmount = Number(excelGstAmount);
                        totalAmount = grandTotal - gstAmount;
                        gstPercent = totalAmount > 0 ? (gstAmount / totalAmount) * 100 : gstPercent;
                    } else {
                        // Default behavior: calculate from percent
                        totalAmount = grandTotal / (1 + gstPercent / 100);
                        gstAmount = grandTotal - totalAmount;
                    }

                    validRows.push({
                        item: item._id,
                        itemName: item.name,
                        category: categoryIdToName.get(item.category.toString()) || item.category,
                        quantity: qty,
                        rate: rate,
                        mrp: mrp,
                        gstRate: Number(gstPercent.toFixed(2)),
                        gstAmount: Number(gstAmount.toFixed(2)),
                        totalAmount: Number(totalAmount.toFixed(2)),
                        grandTotal: Number(grandTotal.toFixed(2)),
                        date: date.toISOString(),
                        vendor: row['Vendor'] || '',
                        billNumber: row['Bill Number'] || '',
                        subType: row['Type (Purchase/Donation)'] || 'Purchase',
                        narration: row['Narration'] || (row['Bill Number'] ? `Bill: ${row['Bill Number']}` : ''),
                        unit: unitIdToName.get(item.unit.toString()) || item.unit
                    });
                }

            } catch (err) {
                errors.push(`Row ${rowIndex}: Unexpected error - ${err.message}`);
            }
        }

        return NextResponse.json({
            validRows,
            errors,
            summary: {
                total: jsonData.length,
                valid: validRows.length,
                invalid: errors.length
            }
        });

    } catch (error) {
        console.error("Preview Error:", error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import * as XLSX from 'xlsx';
import KitchenTransaction from '../../../../models/KitchenTransaction';
import KitchenItem from '../../../../models/KitchenItem';
import LogCategory from '../../../../models/LogCategory';
import Department from '../../../../models/Department';
import Event from '../../../../models/Event';

const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI);
}

export async function POST(req) {
    try {
        await connectDB();
        const formData = await req.formData();
        const file = formData.get('file');
        const type = formData.get('type'); // 'IN' or 'OUT'
        const companyId = formData.get('companyId');
        const createdBy = formData.get('userId');
        const createdByName = formData.get('userName');

        // Basic validation
        if (!file || !type || !companyId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        let successCount = 0;
        let errors = [];

        for (const [index, row] of jsonData.entries()) {
            try {
                // Common fields mapping from Excel keys (assuming standard keys from sample)
                const itemName = row['Item Name'];
                const qty = Number(row['Quantity']);
                const dateStr = row['Date (YYYY-MM-DD)'] || new Date().toISOString().split('T')[0];
                const date = new Date(dateStr);

                if (!itemName || isNaN(qty) || qty <= 0) {
                    throw new Error(`Invalid Item Name or Quantity`);
                }

                // Find Item
                const item = await KitchenItem.findOne({
                    name: { $regex: new RegExp(`^${itemName.trim()}$`, 'i') },
                    companyId: companyId
                });

                if (!item) {
                    throw new Error(`Item '${itemName}' not found`);
                }

                if (type === 'IN') {
                    // --- IN LOGIC ---
                    const rate = Number(row['Rate'] || 0);
                    const vendor = row['Vendor'];
                    const subType = row['Type (Purchase/Donation)'];
                    const narration = row['Bill Number'] ? `Bill: ${row['Bill Number']}` : '';
                    const totalAmount = qty * rate;

                    // Lookup subType ID
                    let subTypeId = null;
                    if (subType) {
                        const logCat = await LogCategory.findOne({ name: { $regex: new RegExp(`^${subType.trim()}$`, 'i') } });
                        subTypeId = logCat ? logCat._id : null;
                    }

                    await KitchenTransaction.create({
                        type: 'IN',
                        item: item._id,
                        quantity: qty,
                        rate: rate,
                        totalAmount: totalAmount,
                        vendor: vendor,
                        subType: subTypeId,
                        remainingQuantity: qty,
                        date: date,
                        companyId: companyId,
                        narration: narration,
                        createdBy, createdByName
                    });

                    // Update item stock
                    item.currentStock = (item.currentStock || 0) + qty;
                    if (rate > 0) item.currentRate = rate; // Update last purchase rate
                    await item.save();
                    successCount++;

                } else if (type === 'OUT') {
                    // --- OUT LOGIC (FIFO) ---
                    const department = row['Department'];
                    const event = row['Event'];
                    const narration = row['Narration'];

                    let qtyToDeduct = qty;

                    if ((item.currentStock || 0) < qtyToDeduct) {
                        throw new Error(`Insufficient stock for '${itemName}'. Available: ${item.currentStock}`);
                    }

                    // Find batches with remaining quantity > 0, sorted by Date ASC
                    const batches = await KitchenTransaction.find({
                        item: item._id,
                        type: 'IN',
                        remainingQuantity: { $gt: 0 },
                        companyId: companyId
                    }).sort({ date: 1 });

                    // Distribute deduction
                    for (const batch of batches) {
                        if (qtyToDeduct <= 0) break;

                        const deduct = Math.min(batch.remainingQuantity, qtyToDeduct);

                        // Lookup department and event IDs
                        let deptId = null;
                        if (department) {
                            const dept = await Department.findOne({ 
                                name: { $regex: new RegExp(`^${department.trim()}$`, 'i') },
                                companyId: companyId
                            });
                            deptId = dept ? dept._id : null;
                        }

                        let eventId = null;
                        if (event) {
                            const evt = await Event.findOne({ 
                                name: { $regex: new RegExp(`^${event.trim()}$`, 'i') },
                                companyId: companyId
                            });
                            eventId = evt ? evt._id : null;
                        }

                        // Create OUT transaction linked to this batch
                        await KitchenTransaction.create({
                            type: 'OUT',
                            item: item._id,
                            quantity: deduct,
                            date: date,
                            department: deptId,
                            event: eventId,
                            batchId: batch._id,
                            companyId,
                            narration,
                            createdBy, createdByName
                        });

                        // Update batch
                        batch.remainingQuantity -= deduct;
                        await batch.save();

                        qtyToDeduct -= deduct;
                    }

                    // If still qtyToDeduct > 0 (shouldn't happen if we checked currentStock, but safety catch)
                    // If stocks are out of sync, we might have issues. 
                    // For now assuming Item.currentStock is reliable metadata.

                    // Update Item Stock
                    item.currentStock -= qty;
                    await item.save();
                    successCount++;
                }

            } catch (err) {
                errors.push(`Row ${index + 2}: ${err.message}`);
            }
        }

        return NextResponse.json({
            message: `Processed ${successCount} rows successfully`,
            errors: errors
        });

    } catch (error) {
        console.error("Bulk Upload Error:", error);
        return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
    }
}

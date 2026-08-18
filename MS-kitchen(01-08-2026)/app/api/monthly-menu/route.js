import dbConnect from '../../../lib/db';
import MonthlyMenu from '../../../models/MonthlyMenu';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get('companyId');
        const month = searchParams.get('month');

        const { getDataFromToken } = await import('../../../helpers/getDataFromToken');
        const user = getDataFromToken(req);

        let query = {};
        if (month) {
            query.date = { $regex: `^${month}` };
        }

        if (companyId) {
            query.companyId = companyId;
        } else if (user && user.role !== 'Super Admin') {
            query.companyId = user.companyId;
        }

        const menus = await MonthlyMenu.find(query).sort({ date: 1 });

        // Convert Mongoose Map to plain object for each menu
        const result = menus.map(m => ({
            _id: m._id,
            date: m.date,
            companyId: m.companyId,
            meals: m.meals ? Object.fromEntries(m.meals) : {},
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
        }));

        return NextResponse.json(result);

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}



export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();

        const { getDataFromToken } = await import('../../../helpers/getDataFromToken');
        const user = getDataFromToken(req);

        // 🔹 BULK UPSERT (array)
        if (Array.isArray(body)) {
            const operations = [];

            for (const item of body) {
                let targetCompanyId = item.companyId;
                if (!targetCompanyId && user && user.role !== 'Super Admin') {
                    targetCompanyId = user.companyId;
                }
                if (!targetCompanyId) continue;

                // item.meals is an object like { breakfast: "...", lunch: "..." }
                const meals = item.meals || {};

                operations.push({
                    updateOne: {
                        filter: { date: item.date, companyId: targetCompanyId },
                        update: { $set: { meals, companyId: targetCompanyId } },
                        upsert: true
                    }
                });
            }

            if (operations.length === 0) {
                return NextResponse.json({ error: "No valid records or Company ID missing." }, { status: 400 });
            }

            const result = await MonthlyMenu.bulkWrite(operations);

            if (user) {
                const { activityMiddleware } = await import('../../../lib/activityMiddleware');
                await activityMiddleware(req, user, 'MONTHLY_MENU_BULK_UPDATE', {
                    count: result.upsertedCount + result.modifiedCount,
                });
            }

            return NextResponse.json({
                success: true,
                count: result.upsertedCount + result.modifiedCount
            });
        }

        // 🔹 SINGLE UPSERT
        const { id, date, meals, companyId: bodyCompanyId } = body;

        if (!date) {
            return NextResponse.json({ error: "Date is required" }, { status: 400 });
        }

        const targetCompanyId = bodyCompanyId || (user && user.role !== 'Super Admin' ? user.companyId : null);

        if (!targetCompanyId) {
            return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
        }

        let menu;
        if (id) {
            // Check if there is already another document with the same date and companyId (to avoid unique index duplicate key error)
            const existing = await MonthlyMenu.findOne({ date, companyId: targetCompanyId, _id: { $ne: id } });
            if (existing) {
                return NextResponse.json({ error: "A menu already exists for this date." }, { status: 400 });
            }
            menu = await MonthlyMenu.findByIdAndUpdate(
                id,
                { $set: { date, meals: meals || {}, companyId: targetCompanyId } },
                { new: true }
            );
            if (!menu) {
                // If not found by ID (should not happen), fallback to findOneAndUpdate
                menu = await MonthlyMenu.findOneAndUpdate(
                    { date, companyId: targetCompanyId },
                    { $set: { meals: meals || {}, companyId: targetCompanyId } },
                    { new: true, upsert: true }
                );
            }
        } else {
            menu = await MonthlyMenu.findOneAndUpdate(
                { date, companyId: targetCompanyId },
                { $set: { meals: meals || {}, companyId: targetCompanyId } },
                { new: true, upsert: true }
            );
        }

        if (user) {
            const { activityMiddleware } = await import('../../../lib/activityMiddleware');
            await activityMiddleware(req, user, 'MONTHLY_MENU_UPDATE', { date });
        }

        return NextResponse.json({
            _id: menu._id,
            date: menu.date,
            companyId: menu.companyId,
            meals: menu.meals ? Object.fromEntries(menu.meals) : {},
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}



export async function PUT(req) {
    return POST(req);
}



export async function DELETE(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        const { getDataFromToken } = await import('../../../helpers/getDataFromToken');
        const user = getDataFromToken(req);

        // 🔹 BULK DELETE
        if (!id) {
            try {
                const body = await req.json();
                if (body && Array.isArray(body.ids)) {
                    const result = await MonthlyMenu.deleteMany({ _id: { $in: body.ids } });
                    
                    if (user) {
                        const { activityMiddleware } = await import('../../../lib/activityMiddleware');
                        await activityMiddleware(req, user, 'MONTHLY_MENU_BULK_DELETE', { count: result.deletedCount });
                    }
                    
                    return NextResponse.json({ success: true, count: result.deletedCount });
                }
            } catch (e) {
                // Fallback if no body
            }
        }

        // 🔹 SINGLE DELETE
        if (!id) {
            return NextResponse.json({ error: "ID or IDs required" }, { status: 400 });
        }

        await MonthlyMenu.findByIdAndDelete(id);

        if (user) {
            const { activityMiddleware } = await import('../../../lib/activityMiddleware');
            await activityMiddleware(req, user, 'MONTHLY_MENU_DELETE', { menuId: id });
        }

        return NextResponse.json({ success: true, message: "Menu deleted" });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

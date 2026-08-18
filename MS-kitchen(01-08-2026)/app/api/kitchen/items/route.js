import dbConnect from '../../../../lib/db';
import KitchenItem from '../../../../models/KitchenItem';
import Company from '../../../../models/Company';
import User from '../../../../models/User';
import Unit from '../../../../models/Unit';
import Category from '../../../../models/Category';
import { NextResponse } from 'next/server';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';

export async function GET(req) {
    await dbConnect();
    try {
        const payload = getDataFromToken(req);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, payload, 'KITCHEN_ITEM_VIEW');

        const { searchParams } = new URL(req.url);
        const companyIdParam = searchParams.get('companyId');
        const category = searchParams.get('category');
        const section = searchParams.get('section');

        let query = {};

        if (payload.role === 'Super Admin') {
            if (companyIdParam) {
                const ids = companyIdParam.split(',').filter(Boolean);
                query.companyId = ids.length > 1 ? { $in: ids } : ids[0];
            }
        } else {
            if (companyIdParam) {
                const ids = companyIdParam.split(',').filter(Boolean);
                query.companyId = ids.length > 1 ? { $in: ids } : ids[0];
            } else {
                // DEFAULT: Use ALL assigned companies
                const user = await User.findById(payload.userId).select('assignedCompanies companyId');
                if (user) {
                    const assigned = user.assignedCompanies || [];
                    if (assigned.length > 0) {
                        query.companyId = { $in: assigned };
                    } else if (user.companyId) {
                        query.companyId = user.companyId;
                    }
                }
            }
        }

        if (section) {
            const catQuery = { section };
            if (query.companyId) {
                catQuery.companyId = query.companyId;
            }

            const categories = await Category.find(catQuery).select('_id name');
            const categoryIds = categories.map(c => c._id);

            // Note: If section is veg-fruits or dairy, we might still have legacy string categories in DB.
            // But going forward, we expect IDs.
            query.category = { $in: categoryIds };
        } else if (category) {
            query.category = category; // Assumes category passed is an ID
        }

        const items = await KitchenItem.find(query)
            .populate('category', 'name')
            .populate('unit', 'name')
            .populate('companyId', 'name')
            .sort({ name: 1 });
        return NextResponse.json(items);
    } catch (error) {
        console.error('Kitchen Items GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user || (!user.companyId && user.role !== 'Super Admin')) {
            return NextResponse.json({ error: 'Unauthorized or missing company' }, { status: 401 });
        }

        const body = await req.json();
        const dbUser = await User.findById(user.userId);
        const itemData = {
            ...body,
            companyId: body.companyId || user.companyId,
            createdBy: user.userId,
            createdByName: dbUser ? dbUser.name : 'Unknown User'
        };

        const item = await KitchenItem.create(itemData);
        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'KITCHEN_ITEM_CREATE', {
            itemId: item._id,
            name: item.name,
            category: item.category
        });
        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    await dbConnect();
    try {
        const body = await req.json();
        const { _id, ...updateData } = body;

        const user = getDataFromToken(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = await User.findById(user.userId);
        updateData.updatedBy = user.userId;
        updateData.updatedByName = dbUser ? dbUser.name : 'Unknown User';

        const item = await KitchenItem.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true });
        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'KITCHEN_ITEM_UPDATE', {
            itemId: item._id,
            name: item.name,
            updatedFields: Object.keys(updateData)
        });

        return NextResponse.json(item);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const item = await KitchenItem.findByIdAndDelete(id);

        if (item) {
            const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
            await activityMiddleware(req, user, 'KITCHEN_ITEM_DELETE', {
                itemId: id,
                name: item.name
            });
        }
        return NextResponse.json({ message: 'Item deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

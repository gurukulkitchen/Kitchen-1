import dbConnect from '../../../lib/db';
import MealNotification from '../../../models/MealNotification';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date');
        const companyId = searchParams.get('companyId');
        const notificationDate = searchParams.get('notificationDate');

        const { getDataFromToken } = await import('../../../helpers/getDataFromToken');
        const user = getDataFromToken(req);

        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        let query = {};
        if (date) query.date = date;
        if (notificationDate) query.notificationDate = notificationDate;
        
        if (companyId) {
            query.companyId = companyId;
        } else if (user.role !== 'Super Admin') {
            query.companyId = user.companyId;
        }

        // Filter out notifications read by this user
        query.readBy = { $ne: user.id || user._id };

        const notifications = await MealNotification.find(query).populate('mealType', 'name');

        const transformedNotifications = notifications.map(n => {
            const nObj = n.toObject();
            return {
                ...nObj,
                mealType: n.mealType && typeof n.mealType === 'object' && n.mealType.name 
                    ? n.mealType.name 
                    : (n.mealType || '')
            };
        });

        return NextResponse.json(transformedNotifications);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        const { getDataFromToken } = await import('../../../helpers/getDataFromToken');
        const user = getDataFromToken(req);

        if (!user || !id) {
            return NextResponse.json({ error: "Unauthorized or ID missing" }, { status: 401 });
        }

        await MealNotification.findByIdAndUpdate(id, {
            $addToSet: { readBy: user.id || user._id }
        });

        return NextResponse.json({ success: true });
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

        const { date, mealType, notificationDate, text, companyId: bodyCompanyId } = body;

        if (!date || !mealType || !notificationDate || !text) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const targetCompanyId = bodyCompanyId || (user && user.role !== 'Super Admin' ? user.companyId : null);

        if (!targetCompanyId) {
            return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
        }

        const MealTypeModel = (await import('../../../models/MealType')).default;

        // Resolve mealType string to ObjectId
        let targetMealType = await MealTypeModel.findOne({ name: mealType, companyId: targetCompanyId });
        if (!targetMealType) {
            const count = await MealTypeModel.countDocuments({ companyId: targetCompanyId });
            targetMealType = await MealTypeModel.create({
                name: mealType,
                order: count,
                companyId: targetCompanyId
            });
        }

        const notification = await MealNotification.findOneAndUpdate(
            { date, mealType: targetMealType._id, companyId: targetCompanyId },
            { $set: { notificationDate, text, companyId: targetCompanyId } },
            { new: true, upsert: true }
        );

        return NextResponse.json(notification, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        await MealNotification.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

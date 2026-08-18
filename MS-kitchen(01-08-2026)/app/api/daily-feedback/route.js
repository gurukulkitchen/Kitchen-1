import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DailyFeedback from '@/models/DailyFeedback';
import User from '@/models/User';
import MealType from '@/models/MealType';
import PeopleCategory from '@/models/PeopleCategory';
import { getDataFromToken } from '@/helpers/getDataFromToken';

export async function GET(req) {
    try {
        await dbConnect();
        const payload = getDataFromToken(req);
        if (!payload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const companyIdParam = searchParams.get('companyId');

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

        const entries = await DailyFeedback.find(query)
            .sort({ date: -1, createdAt: -1 })
            .populate('mealType', 'name')
            .populate('ratings.categoryId', 'name');

        // Transform mealType back to name string for the frontend (which expects a string like "breakfast")
        // and keep backwards compatibility for legacy string values in MongoDB
        const transformedEntries = entries.map(entry => {
            const entryObj = entry.toObject();
            return {
                ...entryObj,
                mealType: entry.mealType && typeof entry.mealType === 'object' && entry.mealType.name 
                    ? entry.mealType.name 
                    : (entry.mealType || '')
            };
        });

        return NextResponse.json(transformedEntries, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch daily feedback:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const user = getDataFromToken(req);
        const data = await req.json();

        if (!user || (!user.companyId && user.role !== 'Super Admin')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const targetCompanyId = user.companyId || data.companyId;

        if (!targetCompanyId) {
            return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
        }

        // Calculate average rating if not provided
        if (data.ratings && data.ratings.length > 0) {
            const sum = data.ratings.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0);
            data.averageRating = sum / data.ratings.length;
        }

        // 1. Resolve target mealType string to ObjectId
        let targetMealType = await MealType.findOne({ name: data.mealType, companyId: targetCompanyId });
        if (!targetMealType) {
            // Count existing meal types to assign an order
            const count = await MealType.countDocuments({ companyId: targetCompanyId });
            targetMealType = await MealType.create({
                name: data.mealType,
                order: count,
                companyId: targetCompanyId
            });
        }

        // Set the ObjectId as the mealType value
        data.mealType = targetMealType._id;

        // 2. Perform findOneAndUpdate with upsert: true to support both create and edit gracefully
        const entry = await DailyFeedback.findOneAndUpdate(
            { date: data.date, mealType: data.mealType, companyId: targetCompanyId },
            { $set: { ...data, companyId: targetCompanyId } },
            { new: true, upsert: true }
        );

        // Log activity if middleware exists
        try {
            const { activityMiddleware } = await import('@/lib/activityMiddleware');
            await activityMiddleware(req, user, 'FEEDBACK_CREATE', { entryId: entry._id, date: entry.date });
        } catch (e) {
            console.warn('Activity logging failed:', e.message);
        }

        return NextResponse.json({ message: 'Feedback saved successfully', entry }, { status: 201 });
    } catch (error) {
        console.error('Failed to create daily feedback:', error);
        // Check for duplicate key error
        if (error.code === 11000) {
            return NextResponse.json({ message: 'Feedback already exists for this date and meal type' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

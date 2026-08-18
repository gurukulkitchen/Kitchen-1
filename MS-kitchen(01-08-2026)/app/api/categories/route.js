import connectDB from '@/lib/db';
import Category from '@/models/Category';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { getDataFromToken } from '@/helpers/getDataFromToken';

const defaultCategories = [
    "ANAJ", "LOT", "MASALA", "MASALA (POWDER)", "OIL & GHEE", "SNACKS", "SUGAR",
    "BACKERY", "DRY FRUITS", "MILK PRODUCTS", "MILK & BUTTERMILK", "FALAHAR",
    "SAUCE", "VEGETABLE & FRUIT", "SARBAT & ASSENCE", "ASSETS", "CLEANING",
    "CYLINDER", "DISPOSABLE", "HR", "MAINTENANCE"
];

export async function GET(req) {
    await connectDB();
    try {
        const user = getDataFromToken(req);
        // Allow if companyId exists OR if user is Super Admin
        if (!user || (!user.companyId && user.role !== 'Super Admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'CATEGORY_VIEW');

        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get('companyId');
        const section = searchParams.get('section');

        let query = {};
        if (user.role !== 'Super Admin') {
            query.companyId = new mongoose.Types.ObjectId(user.companyId);
        } else if (companyId) {
            query.companyId = new mongoose.Types.ObjectId(companyId);
        }

        if (section) {
            query.section = section;
        }
        let categories = await Category.find(query).populate('companyId', 'name').sort({ name: 1 });

        if (categories.length === 0) {
            // Seed default categories for this company
            try {
                const seedDocs = defaultCategories.map(name => ({ name, companyId: user.companyId }));
                await Category.insertMany(seedDocs);
                categories = await Category.find(query).sort({ name: 1 });
                console.log('Seeded default categories for company:', user.companyId);
            } catch (seedError) {
                // Auto-fix for old index
                if (seedError.code === 11000 && seedError.message.includes('name_1')) {
                    console.log('Detected old unique index on name. Dropping index...');
                    try {
                        await Category.collection.dropIndex('name_1');
                        console.log('Index dropped. Retrying seed...');
                        const seedDocs = defaultCategories.map(name => ({ name, companyId: user.companyId }));
                        await Category.insertMany(seedDocs);
                        categories = await Category.find(query).sort({ name: 1 });
                    } catch (retryError) {
                        console.error('Failed to auto-fix index:', retryError);
                    }
                } else {
                    console.error('Error seeding categories:', seedError);
                }
            }
        }

        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    await connectDB();
    try {
        const user = getDataFromToken(req);
        if (!user || !user.companyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, section } = await req.json();
        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        const category = await Category.create({ name, section, companyId: user.companyId });

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'CATEGORY_CREATE', {
            categoryId: category._id,
            name: category.name
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    await connectDB();
    try {
        const user = getDataFromToken(req); // Added for logging
        const { id, name, section, companyId } = await req.json();
        if (!id || !name) {
            return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });
        }
        const category = await Category.findByIdAndUpdate(id, { name, section, companyId }, { new: true, runValidators: true });
        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // LOG ACTIVITY
        if (user) {
            // LOG ACTIVITY
            if (user) {
                const { activityMiddleware } = await import('../../../lib/activityMiddleware');
                await activityMiddleware(req, user, 'CATEGORY_UPDATE', {
                    categoryId: category._id,
                    name: category.name
                });
            }
        }

        return NextResponse.json(category);
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    await connectDB();
    try {
        const user = getDataFromToken(req); // Added for logging
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // LOG ACTIVITY
        if (user) {
            // LOG ACTIVITY
            if (user) {
                const { activityMiddleware } = await import('../../../lib/activityMiddleware');
                await activityMiddleware(req, user, 'CATEGORY_DELETE', {
                    categoryId: id,
                    name: category.name
                });
            }
        }

        return NextResponse.json({ message: 'Category deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

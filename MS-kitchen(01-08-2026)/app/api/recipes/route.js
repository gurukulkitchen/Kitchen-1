import connectDB from '@/lib/db';
import Recipe from '@/models/Recipe';
import User from '@/models/User';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { getDataFromToken } from '@/helpers/getDataFromToken';

export async function GET(req) {
    await connectDB();
    try {
        const payload = getDataFromToken(req);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const companyIdParam = searchParams.get('companyId');

        const query = {};

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

        const recipes = await Recipe.find(query).sort({ createdAt: -1 }).populate('companyId', 'name');
        return NextResponse.json(recipes);
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

        const body = await req.json();
        const { name, description, ingredients, youtubeLink, companyId } = body;

        const newRecipe = new Recipe({
            name,
            description,
            ingredients,
            youtubeLink,
            companyId: companyId || user.companyId
        });

        await newRecipe.save();
        return NextResponse.json(newRecipe, { status: 201 });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Recipe name already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    await connectDB();
    try {
        const user = getDataFromToken(req);
        if (!user || !user.companyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, name, description, ingredients, youtubeLink } = await req.json();

        if (!id || !name || !ingredients) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const updatedRecipe = await Recipe.findByIdAndUpdate(
            id,
            { name, description, ingredients, youtubeLink },
            { new: true, runValidators: true }
        );

        if (!updatedRecipe) {
            return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
        }

        return NextResponse.json(updatedRecipe);
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Recipe name already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const deletedRecipe = await Recipe.findByIdAndDelete(id);
        if (!deletedRecipe) {
            return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Recipe deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


import connectDB from '@/lib/db';
import RecipeQty from '@/models/RecipeQty';
import User from '@/models/User';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { getDataFromToken } from '@/helpers/getDataFromToken';

export async function GET(req) {
    await connectDB();
    try {
        const payload = getDataFromToken(req);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const companyIdParam = searchParams.get('companyId');

        const query = {};

        const isGlobal = searchParams.get('isGlobal') === 'true';

        // Multi-Company and Default Logic
        if (!isGlobal) {
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
        }

        const recipes = await RecipeQty.find(query)
            .populate('companyId', 'name')
            .populate('ingredients.unit', 'name')
            .sort({ name: 1 });
        return NextResponse.json(recipes);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    await connectDB();
    try {
        const user = getDataFromToken(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { name, details, baseQuantity, baseUnit, ingredients, youtubeLink, image, basePeople } = body;

        const targetCompanyId = body.companyId || user.companyId;
        if (!targetCompanyId) return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });

        const newRecipe = new RecipeQty({
            name,
            details,
            baseQuantity,
            baseUnit,
            ingredients,
            youtubeLink,
            image,
            basePeople,
            companyId: targetCompanyId
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
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { id, name, details, baseQuantity, baseUnit, ingredients, youtubeLink, image, basePeople } = body;

        const updatedRecipe = await RecipeQty.findByIdAndUpdate(
            id,
            { name, details, baseQuantity, baseUnit, ingredients, youtubeLink, image, basePeople },
            { new: true, runValidators: true }
        );

        if (!updatedRecipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });

        return NextResponse.json(updatedRecipe);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await RecipeQty.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Recipe deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}






// import connectDB from '@/lib/db';
// import RecipeQty from '@/models/RecipeQty';
// import User from '@/models/User';
// import mongoose from 'mongoose';
// import { NextResponse } from 'next/server';
// import { getDataFromToken } from '@/helpers/getDataFromToken';

// export async function GET(req) {
//     await connectDB();
//     try {
//         const payload = getDataFromToken(req);
//         if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//         const { searchParams } = new URL(req.url);
//         const companyIdParam = searchParams.get('companyId');

//         const query = {};

//         const isGlobal = searchParams.get('isGlobal') === 'true';

//         // Multi-Company and Default Logic
//         if (!isGlobal) {
//             if (payload.role === 'Super Admin') {
//                 if (companyIdParam) {
//                     const ids = companyIdParam.split(',').filter(Boolean);
//                     query.companyId = ids.length > 1 ? { $in: ids } : ids[0];
//                 }
//             } else {
//                 if (companyIdParam) {
//                     const ids = companyIdParam.split(',').filter(Boolean);
//                     query.companyId = ids.length > 1 ? { $in: ids } : ids[0];
//                 } else {
//                     // DEFAULT: Use ALL assigned companies
//                     const user = await User.findById(payload.userId).select('assignedCompanies companyId');
//                     if (user) {
//                         const assigned = user.assignedCompanies || [];
//                         if (assigned.length > 0) {
//                             query.companyId = { $in: assigned };
//                         } else if (user.companyId) {
//                             query.companyId = user.companyId;
//                         }
//                     }
//                 }
//             }
//         }

//         const recipes = await RecipeQty.find(query).populate('companyId', 'name').sort({ name: 1 });
//         return NextResponse.json(recipes);
//     } catch (error) {
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }

// export async function POST(req) {
//     await connectDB();
//     try {
//         const user = getDataFromToken(req);
//         if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//         const body = await req.json();
//         const { name, details, baseQuantity, baseUnit, ingredients, youtubeLink, basePeople } = body;

//         const targetCompanyId = body.companyId || user.companyId;
//         if (!targetCompanyId) return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });

//         const newRecipe = new RecipeQty({
//             name,
//             details,
//             baseQuantity,
//             baseUnit,
//             ingredients,
//             youtubeLink,
//             basePeople,
//             companyId: targetCompanyId
//         });

//         await newRecipe.save();
//         return NextResponse.json(newRecipe, { status: 201 });
//     } catch (error) {
//         if (error.code === 11000) {
//             return NextResponse.json({ error: 'Recipe name already exists' }, { status: 400 });
//         }
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }

// export async function PUT(req) {
//     await connectDB();
//     try {
//         const user = getDataFromToken(req);
//         if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//         const body = await req.json();
//         const { id, name, details, baseQuantity, baseUnit, ingredients, youtubeLink, basePeople } = body;

//         const updatedRecipe = await RecipeQty.findByIdAndUpdate(
//             id,
//             { name, details, baseQuantity, baseUnit, ingredients, youtubeLink, basePeople },
//             { new: true, runValidators: true }
//         );

//         if (!updatedRecipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });

//         return NextResponse.json(updatedRecipe);
//     } catch (error) {
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }

// export async function DELETE(req) {
//     await connectDB();
//     try {
//         const { searchParams } = new URL(req.url);
//         const id = searchParams.get('id');
//         if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

//         await RecipeQty.findByIdAndDelete(id);
//         return NextResponse.json({ message: 'Recipe deleted' });
//     } catch (error) {
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }


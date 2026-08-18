import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Unit from '@/models/Unit';
import Department from '@/models/Department';
import Event from '@/models/Event';

export async function GET() {
    await connectDB();
    const results = [];

    const models = [
        { name: 'Category', model: Category },
        { name: 'Unit', model: Unit },
        { name: 'Department', model: Department },
        { name: 'Event', model: Event }
    ];

    for (const { name, model } of models) {
        try {
            // Drop all indexes except _id
            await model.collection.dropIndexes();
            results.push(`✅ Dropped indexes for ${name}`);

            // Re-sync indexes defined in Schema
            await model.syncIndexes();
            results.push(`✅ Re-synced indexes for ${name}`);
        } catch (error) {
            results.push(`❌ Error processing ${name}: ${error.message}`);
        }
    }

    return NextResponse.json({ results });
}

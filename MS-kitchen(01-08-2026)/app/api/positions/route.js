import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Position from '../../../models/Position';

export async function GET(req) {
    try {
        await dbConnect();

        // LOG ACTIVITY (GET)
        const { getDataFromToken } = await import('../../../helpers/getDataFromToken');
        const user = getDataFromToken(req);
        if (user) {
            if (user) {
                const { activityMiddleware } = await import('../../../lib/activityMiddleware');
                await activityMiddleware(req, user, 'POSITION_VIEW');
            }
        }

        const positions = await Position.find({}).sort({ name: 1 });
        return NextResponse.json(positions, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch positions:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const { name } = await req.json();

        if (!name) {
            return NextResponse.json({ message: 'Position name is required' }, { status: 400 });
        }

        const existingPosition = await Position.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingPosition) {
            return NextResponse.json({ message: 'Position already exists' }, { status: 400 });
        }

        const newPosition = await Position.create({ name });

        // LOG ACTIVITY
        const { getDataFromToken } = await import('../../../helpers/getDataFromToken');
        const user = getDataFromToken(req);
        if (user) {
            if (user) {
                const { activityMiddleware } = await import('../../../lib/activityMiddleware');
                await activityMiddleware(req, user, 'POSITION_CREATE', {
                    positionId: newPosition._id,
                    name: newPosition.name
                });
            }
        }

        return NextResponse.json(newPosition, { status: 201 });
    } catch (error) {
        console.error('Failed to create position:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const { id, name } = await req.json();

        if (!id || !name) {
            return NextResponse.json({ message: 'ID and name are required' }, { status: 400 });
        }

        const position = await Position.findByIdAndUpdate(id, { name }, { new: true });
        if (!position) {
            return NextResponse.json({ message: 'Position not found' }, { status: 404 });
        }

        // LOG ACTIVITY
        const { getDataFromToken } = await import('../../../helpers/getDataFromToken');
        const user = getDataFromToken(req);
        if (user) {
            const { activityMiddleware } = await import('../../../lib/activityMiddleware');
            await activityMiddleware(req, user, 'POSITION_UPDATE', {
                positionId: id,
                name: position.name
            });
        }

        return NextResponse.json(position);
    } catch (error) {
        console.error('Failed to update position:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'ID is required' }, { status: 400 });
        }

        const position = await Position.findByIdAndDelete(id);
        if (!position) {
            return NextResponse.json({ message: 'Position not found' }, { status: 404 });
        }

        // LOG ACTIVITY
        const { getDataFromToken } = await import('../../../helpers/getDataFromToken');
        const user = getDataFromToken(req);
        if (user) {
            const { activityMiddleware } = await import('../../../lib/activityMiddleware');
            await activityMiddleware(req, user, 'POSITION_DELETE', {
                positionId: id,
                name: position.name
            });
        }

        return NextResponse.json({ message: 'Position deleted' });
    } catch (error) {
        console.error('Failed to delete position:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

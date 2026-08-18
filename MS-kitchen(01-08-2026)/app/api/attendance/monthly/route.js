import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Attendance from '../../../../models/Attendance';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';

export async function GET(req) {
    try {
        await dbConnect();
        const user = getDataFromToken(req);
        const { searchParams } = new URL(req.url);

        const year = parseInt(searchParams.get('year'));
        const month = parseInt(searchParams.get('month'));
        const filterCompanyId = searchParams.get('companyId');

        if (!year || !month) {
            return NextResponse.json({ message: 'Year and Month are required' }, { status: 400 });
        }

        let query = {};
        if (user && user.companyId) {
            query.companyId = user.companyId;
        } else if (user && user.role === 'Super Admin' && filterCompanyId) {
            query.companyId = filterCompanyId;
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        query.date = { $gte: startDate, $lte: endDate };

        const attendance = await Attendance.find(query).populate('userId', 'name position');
        return NextResponse.json(attendance, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch monthly attendance:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Attendance from '../../../models/Attendance';
import { getDataFromToken } from '../../../helpers/getDataFromToken';

export async function GET(req) {
    try {
        await dbConnect();
        const user = getDataFromToken(req);
        const { searchParams } = new URL(req.url);

        // LOG ACTIVITY
        if (user) {
            const { activityMiddleware } = await import('../../../lib/activityMiddleware');
            await activityMiddleware(req, user, 'ATTENDANCE_VIEW');
        }

        const date = searchParams.get('date');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const filterCompanyId = searchParams.get('companyId');

        let query = {};

        // Handle company context
        if (user && user.companyId) {
            query.companyId = user.companyId;
        } else if (user && user.role === 'Super Admin' && filterCompanyId) {
            query.companyId = filterCompanyId;
        }

        // Handle date filtering
        if (date) {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            const nextDay = new Date(d);
            nextDay.setDate(d.getDate() + 1);
            query.date = { $gte: d, $lt: nextDay };
        } else if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query).populate('userId', 'name position');
        return NextResponse.json(attendance, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch attendance:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const user = getDataFromToken(req);
        const body = await req.json(); // Expected: { date: 'YYYY-MM-DD', records: [{ userId, status, workingHours, overtime }] }

        const { date, records, companyId: providedCompanyId } = body;

        const effectiveCompanyId = (user && user.role === 'Super Admin' && providedCompanyId)
            ? providedCompanyId
            : user?.companyId;

        if (!effectiveCompanyId) {
            return NextResponse.json({ message: 'Company context missing' }, { status: 400 });
        }

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const results = [];
        for (const record of records) {
            const attendanceRecord = await Attendance.findOneAndUpdate(
                { userId: record.userId, date: targetDate, companyId: effectiveCompanyId },
                {
                    status: record.status,
                    workingHours: record.workingHours,
                    overtime: record.overtime
                },
                { upsert: true, new: true }
            );
            results.push(attendanceRecord);
        }

        // LOG ACTIVITY
        if (user) {
            const { activityMiddleware } = await import('../../../lib/activityMiddleware');
            await activityMiddleware(req, user, 'ATTENDANCE_UPDATE', {
                date,
                recordsCount: records.length
            });
        }

        return NextResponse.json({ message: 'Attendance updated successfully', results }, { status: 200 });
    } catch (error) {
        console.error('Failed to save attendance:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

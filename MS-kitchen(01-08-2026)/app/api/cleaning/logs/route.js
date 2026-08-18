import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import CleaningLog from '../../../../models/CleaningLog';
import User from '../../../../models/User';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';

export async function GET(req) {
    await dbConnect();
    try {
        const payload = getDataFromToken(req);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date');
        const companyIdParam = searchParams.get('companyId');
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        let query = {};

        // Multi-Company and Default Logic
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

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, payload, 'CLEANING_LOG_VIEW', { date, month, year });

        if (date) {
            // Find logs matching query
            const logs = await CleaningLog.find({ ...query, date });
            
            if (logs.length === 0) return NextResponse.json({ logs: [], note: '' });
            if (logs.length === 1) return NextResponse.json(logs[0]);
            
            // If multiple companies aggregated, combine them
            return NextResponse.json({ 
                logs: logs.flatMap(l => l.logs), 
                note: logs.map(l => l.note).filter(Boolean).join(' | ') 
            });
        }

        if (month && year) {
            const paddedMonth = month.toString().padStart(2, '0');
            const regex = new RegExp(`^${year}-${paddedMonth}-`);
            const logs = await CleaningLog.find({
                ...query,
                date: { $regex: regex }
            });
            return NextResponse.json(logs);
        }

        return NextResponse.json({ error: 'Date or Month/Year required' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { date, logs, note, companyId } = await req.json();
        if (!date) return NextResponse.json({ error: 'Date is required' }, { status: 400 });

        // Robust target company detection
        let targetCompanyId = companyId || user.companyId;

        if (!targetCompanyId && user.role !== 'Super Admin') {
             // If not super admin and no ID, fetch from user profile
             const dbUser = await User.findById(user.userId).select('companyId assignedCompanies');
             targetCompanyId = dbUser?.companyId || dbUser?.assignedCompanies?.[0];
        }

        if (!targetCompanyId) {
            return NextResponse.json({ error: 'Company identification required' }, { status: 400 });
        }

        const updatedLog = await CleaningLog.findOneAndUpdate(
            { date, companyId: targetCompanyId },
            { $set: { logs: logs || [], note: note !== undefined ? note : undefined } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'CLEANING_LOG_UPDATE', { date, areasCount: logs?.length, targetCompanyId });

        return NextResponse.json(updatedLog);
    } catch (error) {
        console.error("Cleaning Log Save Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


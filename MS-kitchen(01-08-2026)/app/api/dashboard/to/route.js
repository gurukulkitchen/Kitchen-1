import dbConnect from '../../../../lib/db';
import KitchenTransaction from '../../../../models/KitchenTransaction';
import Department from '../../../../models/Department';
import StudentCount from '../../../../models/StudentCount';
import { NextResponse } from 'next/server';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';
import mongoose from 'mongoose';

export async function GET(req) {
    await dbConnect();
    try {
        const payload = getDataFromToken(req);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const companyIdParam = searchParams.get('companyId');
        const year = parseInt(searchParams.get('year')) || new Date().getFullYear();

        const companyIds = companyIdParam ? companyIdParam.split(',').filter(Boolean) : [];
        const query = { 
            type: 'OUT',
            date: {
                $gte: new Date(year, 0, 1),
                $lte: new Date(year, 11, 31, 23, 59, 59, 999)
            }
        };
        if (companyIds.length > 0) {
            query.companyId = { $in: companyIds.map(id => new mongoose.Types.ObjectId(id)) };
        }

        // Aggregate by month and department
        const stats = await KitchenTransaction.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        month: { $month: '$date' },
                        deptId: '$department'
                    },
                    totalAmount: { $sum: { $ifNull: ['$totalAmount', 0] } }
                }
            }
        ]);

        // Fetch Student Counts for the year
        const studentCountQuery = {
            month: { $regex: `^${year}` }
        };
        if (companyIds.length > 0) {
            studentCountQuery.companyId = { $in: companyIds.map(id => new mongoose.Types.ObjectId(id)) };
        }
        const studentCountsData = await StudentCount.find(studentCountQuery);
        const monthlyStudentCounts = new Array(12).fill(0);
        studentCountsData.forEach(sc => {
            const mIdx = parseInt(sc.month.split('-')[1]) - 1;
            if (mIdx >= 0 && mIdx < 12) monthlyStudentCounts[mIdx] = sc.count;
        });

        // Get actual department names for mapping
        const deptQuery = {};
        if (companyIds.length > 0) {
            deptQuery.companyId = { $in: companyIds.map(id => new mongoose.Types.ObjectId(id)) };
        }
        const departments = await Department.find(deptQuery);
        
        // Map deptId string to normalized lowercase trimmed name
        const deptMap = {};
        departments.forEach(d => {
            if (d._id) {
                deptMap[d._id.toString()] = d.name.toLowerCase().trim();
            }
        });

        // Organize data into 12 months for each department
        const dataMap = {}; // { deptKey: [12 months] }
        
        // Ensure Breakfast, Lunch, Night/Dinner exist
        const mainDepts = ['breakfast', 'lunch', 'night', 'all'];
        mainDepts.forEach(d => { dataMap[d] = new Array(12).fill(0); });

        stats.forEach(s => {
            const mIdx = s._id.month - 1;
            const deptIdStr = s._id.deptId ? s._id.deptId.toString() : '';
            const dept = deptMap[deptIdStr] || 'unassigned';
            if (!dataMap[dept]) dataMap[dept] = new Array(12).fill(0);
            dataMap[dept][mIdx] += s.totalAmount;
        });

        // Distribution Logic for "ALL"
        const allAmounts = dataMap['all'] || new Array(12).fill(0);
        const distributionKeys = ['breakfast', 'lunch', 'night'];
        
        distributionKeys.forEach(key => {
            if (!dataMap[key]) dataMap[key] = new Array(12).fill(0);
            for (let i = 0; i < 12; i++) {
                dataMap[key][i] += (allAmounts[i] / 3);
            }
        });

        const result = {
            year,
            monthlyStudentCounts,
            departments: Object.keys(dataMap).map(key => {
                const dept = departments.find(d => d.name.toLowerCase().trim().includes(key));
                return {
                    key: key,
                    name: dept ? dept.name : (key.charAt(0).toUpperCase() + key.slice(1)),
                    monthlyAmounts: dataMap[key],
                    total: dataMap[key].reduce((a, b) => a + b, 0)
                };
            })
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('To Dashboard API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

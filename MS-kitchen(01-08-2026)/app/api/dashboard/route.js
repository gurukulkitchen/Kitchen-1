import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import KitchenItem from '../../../models/KitchenItem';
import CleaningLog from '../../../models/CleaningLog';
import EventPlan from '../../../models/EventPlan';
import Recipe from '../../../models/Recipe';
import KitchenTransaction from '../../../models/KitchenTransaction';
import Category from '../../../models/Category';
import DailyFeedback from '../../../models/DailyFeedback';
import { NextResponse } from 'next/server';
import { getDataFromToken } from '../../../helpers/getDataFromToken';

// Helper for timezone-aware today string (e.g., India +5:30)
const getTodayString = () => {
    const now = new Date();
    // Use Intl which is supported in Node 18+ to get local date in accurate ISO format
    const indiaDate = new Intl.DateTimeFormat('en-CA', { 
        timeZone: 'Asia/Kolkata', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    }).format(now);
    return indiaDate; // Returns YYYY-MM-DD
};

export async function GET(req) {
    await dbConnect();

    try {
        const user = getDataFromToken(req);
        if (!user || (!user.companyId && user.role !== 'Super Admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const filterCompanyId = searchParams.get('companyId');

        let query = {};
        if (user.role === 'Super Admin') {
            if (filterCompanyId) {
                const ids = filterCompanyId.split(',').filter(Boolean);
                query.companyId = ids.length > 1 ? { $in: ids } : ids[0];
            }
        } else {
            if (filterCompanyId) {
                const ids = filterCompanyId.split(',').filter(Boolean);
                query.companyId = ids.length > 1 ? { $in: ids } : ids[0];
            } else {
                // DEFAULT: Use ALL assigned companies from database for standard user
                const dbUser = await User.findById(user.userId).select('assignedCompanies companyId');
                if (dbUser) {
                    const assigned = dbUser.assignedCompanies || [];
                    if (assigned.length > 0) query.companyId = { $in: assigned };
                    else if (dbUser.companyId) query.companyId = dbUser.companyId;
                }
            }
        }

        // 1. Staff Stats
        const staffQuery = { ...query, role: { $ne: 'Super Admin' } };
        const allStaff = await User.find(staffQuery).select('name position salary advances');

        const totalStaff = allStaff.length;
        let totalAdvance = 0;
        let staffWithAdvanceCount = 0;
        const staffWithAdvances = [];

        allStaff.forEach(staff => {
            const pendingAdvances = staff.advances?.filter(a => a.status && a.status.toLowerCase() === 'pending') || [];
            if (pendingAdvances.length > 0) {
                const staffTotal = pendingAdvances.reduce((sum, a) => sum + (a.amount || 0), 0);
                totalAdvance += staffTotal;
                staffWithAdvanceCount++;
                staffWithAdvances.push({
                    id: staff._id,
                    name: staff.name,
                    position: staff.position || 'Staff',
                    advanceRemaining: staffTotal,
                    salary: staff.salary || 0
                });
            }
        });

        // 2. Inventory Stats (Critical & Low)
        const inventoryItems = await KitchenItem.find(query);
        const criticalStock = [];
        const lowStock = [];

        inventoryItems.forEach(item => {
            if (item.currentStock <= item.alertCritical) {
                criticalStock.push({
                    id: item._id,
                    name: item.name,
                    category: item.category,
                    stock: item.currentStock,
                    critical: item.alertCritical,
                    unit: item.unit
                });
            } else if (item.currentStock <= item.alertLow) {
                lowStock.push({
                    id: item._id,
                    name: item.name,
                    category: item.category,
                    stock: item.currentStock,
                    low: item.alertLow,
                    critical: item.alertCritical,
                    unit: item.unit,
                    isLow: true
                });
            }
        });

        // 3. Cleaning Stats (Today)
        const today = getTodayString();
        const cleaningLog = await CleaningLog.findOne({ ...query, date: today });

        let cleaningStats = {
            completed: 0,
            total: 0,
            percentage: 0,
            note: cleaningLog?.note || ''
        };

        if (cleaningLog && cleaningLog.logs) {
            cleaningStats.total = cleaningLog.logs.length;
            cleaningStats.completed = cleaningLog.logs.filter(l => l.status).length;
            cleaningStats.percentage = cleaningStats.total > 0
                ? Math.round((cleaningStats.completed / cleaningStats.total) * 100)
                : 0;
        }

        // 4. Upcoming Events (Next 3)
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        const eventQuery = {
            ...query,
            date: { $gte: todayDate }
        };

        const upcomingEvents = await EventPlan.find(eventQuery)
            .sort({ date: 1 })
            .limit(10)
            .populate('recipeId');

        // 5. Shopping List Calculation
        const shoppingListMap = new Map();
        upcomingEvents.forEach(e => {
            const event = e.toObject();
            if (event.recipeId && event.recipeId.ingredients) {
                event.recipeId.ingredients.forEach(ing => {
                    const qtd = ing.qtd || {};
                    const counts = event.counts || {};
                    let totalRequiredForEvent = 0;
                    Object.keys(counts).forEach(cat => {
                        const count = counts[cat] || 0;
                        const qtyPerPerson = qtd[cat] || 0;
                        totalRequiredForEvent += count * qtyPerPerson;
                    });

                    if (totalRequiredForEvent > 0) {
                        const itemIdStr = ing.itemId.toString();
                        if (!shoppingListMap.has(itemIdStr)) {
                            shoppingListMap.set(itemIdStr, {
                                itemId: ing.itemId,
                                name: ing.name,
                                unit: ing.unit,
                                totalRequired: 0,
                                earliestEvent: event.date
                            });
                        }
                        const itemData = shoppingListMap.get(itemIdStr);
                        itemData.totalRequired += totalRequiredForEvent;
                        if (new Date(event.date) < new Date(itemData.earliestEvent)) {
                            itemData.earliestEvent = event.date;
                        }
                    }
                });
            }
        });

        const shoppingList = [];
        const inventoryMap = new Map();
        inventoryItems.forEach(item => inventoryMap.set(item._id.toString(), item));

        shoppingListMap.forEach((reqItem, itemId) => {
            const invItem = inventoryMap.get(itemId);
            const currentStock = invItem ? invItem.currentStock : 0;
            if (currentStock < reqItem.totalRequired) {
                shoppingList.push({
                    item: reqItem.name,
                    unit: reqItem.unit,
                    required: Math.ceil(reqItem.totalRequired),
                    available: currentStock,
                    toBuy: Math.ceil(reqItem.totalRequired - currentStock),
                    eventDate: reqItem.earliestEvent
                });
            }
        });

        // 6. Last Entries
        // Generic Stock IN/OUT
        const lastStockIn = await KitchenTransaction.findOne({ ...query, type: 'IN' })
            .sort({ date: -1, createdAt: -1 })
            .populate('item', 'name unit');

        const lastStockOut = await KitchenTransaction.findOne({ ...query, type: 'OUT' })
            .sort({ date: -1, createdAt: -1 })
            .populate('item', 'name unit');

        // Helper to find categories by section more reliably
        const getItemsBySection = async (section) => {
            const catQuery = { section };
            if (query.companyId) catQuery.companyId = query.companyId;
            const categories = await Category.find(catQuery).select('name');
            const names = categories.map(c => c.name);
            
            if (section === 'veg-fruits') names.push('VEGETABLE & FRUIT', 'VEGETABLE AND FRUIT', 'vegetable & fruit');
            if (section === 'dairy') names.push('MILK', 'Milk', 'MILK & BUTTERMILK');
            
            // Get actual matching categories to retrieve their ObjectIds
            const resolvedCategories = await Category.find({
                name: { $in: names },
                ...(query.companyId ? { companyId: query.companyId } : {})
            }).select('_id');
            const categoryIds = resolvedCategories.map(c => c._id);
            
            if (categoryIds.length === 0) return [];
            
            const items = await KitchenItem.find({ category: { $in: categoryIds }, ...query }).select('_id');
            return items.map(i => i._id);
        };

        const [vegFruitItemIds, milkItemIds] = await Promise.all([
            getItemsBySection('veg-fruits'),
            getItemsBySection('dairy')
        ]);

        const lastVegFruitOut = await KitchenTransaction.findOne({
            ...query,
            type: 'OUT',
            item: { $in: vegFruitItemIds }
        }).sort({ date: -1, createdAt: -1 }).populate('item', 'name unit');

        const lastMilkOut = await KitchenTransaction.findOne({
            ...query,
            type: 'OUT',
            item: { $in: milkItemIds }
        }).sort({ date: -1, createdAt: -1 }).populate('item', 'name unit');

        // 7. Today's Feedback Summary
        const todayStr = getTodayString();
        const todaysFeedbacks = await DailyFeedback.find({ ...query, date: todayStr });
        const feedbackSummary = {
            count: todaysFeedbacks.length,
            averageRating: todaysFeedbacks.length > 0 
                ? (todaysFeedbacks.reduce((acc, f) => acc + (f.averageRating || 0), 0) / todaysFeedbacks.length).toFixed(1)
                : 0,
            lastMenu: todaysFeedbacks.length > 0 ? todaysFeedbacks[todaysFeedbacks.length - 1].menuName : 'No Entry'
        };

        const responseData = {
            staffStats: {
                totalStaff,
                totalAdvance,
                staffWithAdvance: staffWithAdvanceCount,
                staffList: staffWithAdvances
            },
            inventoryStats: {
                critical: criticalStock,
                low: lowStock
            },
            cleaningStats,
            events: upcomingEvents.slice(0, 3).map(e => ({
                id: e._id,
                date: e.date,
                eventName: e.eventName || (e.recipeId ? e.recipeId.name : 'Unknown Event'),
                totalPersons: e.totalPersons,
                counts: e.counts
            })),
            shoppingList: shoppingList.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)).slice(0, 10),
            todaysSummaries: {
                lastStockIn,
                lastStockOut,
                lastVegFruitOut,
                lastMilkOut,
                feedback: feedbackSummary
            }
        };

        return NextResponse.json(responseData);

    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

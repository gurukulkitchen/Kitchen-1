import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import EventPlan from '@/models/EventPlan';
import Recipe from '@/models/Recipe';
import User from '@/models/User';
import { sendNotifications } from '@/lib/notificationService';
import dbConnect from '@/lib/db';

export async function GET(req) {
    try {
        // Simple security check (optional - can use a secret header)
        const authHeader = req.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Calculate date 2 days from now
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 2);
        targetDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Find event plans for the target date
        const eventPlans = await EventPlan.find({
            date: {
                $gte: targetDate,
                $lt: nextDay
            }
        }).populate('recipeId');

        if (eventPlans.length === 0) {
            return NextResponse.json({ message: 'No events found for 2 days from now' });
        }

        let sentCount = 0;

        for (const plan of eventPlans) {
            const recipe = plan.recipeId;
            if (!recipe) continue;

            // Get items needed
            const itemsNeeded = recipe.ingredients.map(ing => ing.name).join(', ');

            // Find users in the same company with FCM tokens
            const users = await User.find({
                companyId: plan.companyId,
                fcmToken: { $ne: '', $exists: true }
            });

            const tokens = users.map(u => u.fcmToken);

            if (tokens.length > 0) {
                const title = `Upcoming Event: ${recipe.name}`;
                const body = `You have an event in 2 days. Items needed: ${itemsNeeded}`;

                await sendNotifications(tokens, title, body, {
                    eventId: plan._id.toString(),
                    recipeId: recipe._id.toString()
                });
                sentCount += tokens.length;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${eventPlans.length} events, notifications sent to ${sentCount} users.`
        });

    } catch (error) {
        console.error('Error in cron/notifications:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

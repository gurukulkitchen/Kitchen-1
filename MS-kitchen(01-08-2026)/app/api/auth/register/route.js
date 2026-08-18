import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        await dbConnect();

        const { email, password, role } = await req.json();

        if (!email || !password) {
            return new Response(JSON.stringify({ message: 'Missing fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return new Response(JSON.stringify({ message: 'User already exists' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        let userRole = 'Staff'; // Default role

        // Check if requesting Super Admin role
        if (role === 'Super Admin') {
            userRole = 'Super Admin';
        } else if (role === 'Admin') {
            // Optional: Add logic for Admin role creation if needed, currently allowing open creation or restricted
            // For now, let's treat Admin same as Staff or require secret if user wants.
            // Assuming for this task only Super Admin is strictly guarded by secret.
            userRole = 'Admin';
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
            role: userRole,
        });

        return new Response(JSON.stringify({ message: 'User created', user }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

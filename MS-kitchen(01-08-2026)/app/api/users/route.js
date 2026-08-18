import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Role from '@/models/Role';
import bcrypt from 'bcryptjs';
import { getDataFromToken } from '@/helpers/getDataFromToken';

export async function GET(req) {
    try {
        await dbConnect();
        const currentUser = await getDataFromToken(req);

        if (!currentUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        let query = {};

        // If not Super Admin, filter by company
        if (currentUser.role !== 'Super Admin' && currentUser.companyId) {
            query.companyId = currentUser.companyId;
        }

        const rawUsers = await User.find(query)
            .select('_id name email phone role roleId companyId assignedCompanies status noLogin password')
            .sort({ name: 1 });

        const users = rawUsers.map(u => {
            const userObj = u.toObject();
            return {
                ...userObj,
                hasPassword: !!userObj.password,
                password: undefined
            };
        });

        return NextResponse.json(users);

    } catch (error) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const currentUser = await getDataFromToken(req);

        if (!currentUser || (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id, editingId, ...actualData } = await req.json();

        // Enforce company scoping and roles restriction for Admin
        if (currentUser.role === 'Admin') {
            actualData.companyId = currentUser.companyId;
            actualData.assignedCompanies = [currentUser.companyId];

            if (actualData.role === 'Super Admin' || actualData.role === 'Admin' || actualData.role === 'Developer') {
                return NextResponse.json({ message: 'Forbidden: Cannot create administrative/system users' }, { status: 403 });
            }
        }

        if (actualData.roleId) {
            const dbRole = await Role.findById(actualData.roleId);
            if (!dbRole) {
                return NextResponse.json({ message: 'Role not found' }, { status: 400 });
            }
            if (currentUser.role === 'Admin') {
                if (dbRole.companyId && String(dbRole.companyId) !== String(currentUser.companyId)) {
                    return NextResponse.json({ message: 'Forbidden: Role belongs to another company' }, { status: 403 });
                }
                actualData.role = dbRole.name;
            }
        }

        // Check if email exists
        const emailVal = actualData.email?.trim() || '';
        if (emailVal) {
            const existingUser = await User.findOne({ email: emailVal });
            if (existingUser) {
                return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(actualData.password, salt);

        const newUser = new User({
            ...actualData,
            email: emailVal || undefined,
            phone: actualData.phone || undefined,
            password: hashedPassword,
            role: actualData.role || 'Staff',
            roleId: (actualData.roleId && actualData.roleId !== "") ? actualData.roleId : null,
            companyId: actualData.companyId || currentUser.companyId,
            assignedCompanies: actualData.assignedCompanies || [actualData.companyId || currentUser.companyId],
            status: 'Active'
        });

        await newUser.save();

        return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 201 });

    } catch (error) {
        console.error('Failed to create user:', error);
        return NextResponse.json({ 
            message: error.name === 'MongoServerError' && error.code === 11000 
                ? `Duplicate value: ${Object.keys(error.keyValue).join(', ')} already exists`
                : error.message || 'Internal Server Error' 
        }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const currentUser = await getDataFromToken(req);

        if (!currentUser || (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id, ...updateData } = await req.json();

        const userToUpdate = await User.findById(id);
        if (!userToUpdate) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Enforce company scoping and roles restriction for Admin
        if (currentUser.role === 'Admin') {
            if (String(userToUpdate.companyId) !== String(currentUser.companyId)) {
                return NextResponse.json({ message: 'Forbidden: You cannot update a user from another company' }, { status: 403 });
            }
            if (updateData.companyId && String(updateData.companyId) !== String(currentUser.companyId)) {
                return NextResponse.json({ message: 'Forbidden: Cannot change user company' }, { status: 403 });
            }
            if (updateData.assignedCompanies) {
                updateData.assignedCompanies = [currentUser.companyId];
            }
            if (updateData.role === 'Super Admin' || updateData.role === 'Admin' || updateData.role === 'Developer') {
                return NextResponse.json({ message: 'Forbidden: Cannot assign administrative/system roles' }, { status: 403 });
            }
            if (updateData.roleId) {
                const dbRole = await Role.findById(updateData.roleId);
                if (dbRole) {
                    if (dbRole.companyId && String(dbRole.companyId) !== String(currentUser.companyId)) {
                        return NextResponse.json({ message: 'Forbidden: Role belongs to another company' }, { status: 403 });
                    }
                    updateData.role = dbRole.name;
                }
            }
        }

        // Safety Guard: Super Admins cannot be deactivated
        if (updateData.status === 'Inactive' || updateData.status === 'Suspended') {
            if (userToUpdate && userToUpdate.role === 'Super Admin') {
                return NextResponse.json({ message: 'Super Admin login status cannot be deactivated!' }, { status: 400 });
            }
        }

        if ('email' in updateData) {
            const emailVal = updateData.email?.trim() || '';
            if (!emailVal) {
                delete updateData.email;
                updateData.$unset = { ...updateData.$unset, email: "" };
            } else {
                updateData.email = emailVal;
                const existingUser = await User.findOne({ email: emailVal, _id: { $ne: id } });
                if (existingUser) {
                    return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
                }
            }
        }

        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        } else {
            delete updateData.password;
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User updated successfully', user: updatedUser }, { status: 200 });

    } catch (error) {
        console.error('Failed to update user:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const currentUser = await getDataFromToken(req);

        if (!currentUser || (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'ID required' }, { status: 400 });
        }

        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (currentUser.role === 'Admin') {
            if (String(userToDelete.companyId) !== String(currentUser.companyId)) {
                return NextResponse.json({ message: 'Forbidden: Cannot delete user from another company' }, { status: 403 });
            }
            const sensitiveRoles = ['Super Admin', 'Admin', 'Developer'];
            if (sensitiveRoles.includes(userToDelete.role)) {
                return NextResponse.json({ message: 'Forbidden: Cannot delete administrative/system users' }, { status: 403 });
            }
        }

        await User.findByIdAndDelete(id);

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Failed to delete user:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}



// import { NextResponse } from 'next/server';
// import dbConnect from '@/lib/db';
// import User from '@/models/User';
// import Role from '@/models/Role';
// import bcrypt from 'bcryptjs';
// import { getDataFromToken } from '@/helpers/getDataFromToken';

// export async function GET(req) {
//     try {
//         await dbConnect();
//         const currentUser = await getDataFromToken(req);

//         if (!currentUser) {
//             return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//         }

//         let query = {};

//         // If not Super Admin, filter by company
//         if (currentUser.role !== 'Super Admin' && currentUser.companyId) {
//             query.companyId = currentUser.companyId;
//         }

//         const rawUsers = await User.find(query)
//             .select('_id name email phone role roleId companyId assignedCompanies status noLogin password')
//             .sort({ name: 1 });

//         const users = rawUsers.map(u => {
//             const userObj = u.toObject();
//             return {
//                 ...userObj,
//                 hasPassword: !!userObj.password,
//                 password: undefined
//             };
//         });

//         return NextResponse.json(users);

//     } catch (error) {
//         console.error('Failed to fetch users:', error);
//         return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
//     }
// }

// export async function POST(req) {
//     try {
//         await dbConnect();
//         const currentUser = await getDataFromToken(req);

//         if (!currentUser || (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin')) {
//             return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//         }

//         const { id, editingId, ...actualData } = await req.json();

//         // Enforce company scoping and roles restriction for Admin
//         if (currentUser.role === 'Admin') {
//             actualData.companyId = currentUser.companyId;
//             actualData.assignedCompanies = [currentUser.companyId];

//             if (actualData.role === 'Super Admin' || actualData.role === 'Admin' || actualData.role === 'Developer') {
//                 return NextResponse.json({ message: 'Forbidden: Cannot create administrative/system users' }, { status: 403 });
//             }
//         }

//         if (actualData.roleId) {
//             const dbRole = await Role.findById(actualData.roleId);
//             if (!dbRole) {
//                 return NextResponse.json({ message: 'Role not found' }, { status: 400 });
//             }
//             if (currentUser.role === 'Admin') {
//                 if (dbRole.companyId && String(dbRole.companyId) !== String(currentUser.companyId)) {
//                     return NextResponse.json({ message: 'Forbidden: Role belongs to another company' }, { status: 403 });
//                 }
//                 actualData.role = dbRole.name;
//             }
//         }

//         // Check if email exists
//         if (actualData.email) {
//             const existingUser = await User.findOne({ email: actualData.email });
//             if (existingUser) {
//                 return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
//             }
//         }

//         // Hash password
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(actualData.password, salt);

//         const newUser = new User({
//             ...actualData,
//             email: actualData.email || undefined,
//             phone: actualData.phone || undefined,
//             password: hashedPassword,
//             role: actualData.role || 'Staff',
//             roleId: (actualData.roleId && actualData.roleId !== "") ? actualData.roleId : null,
//             companyId: actualData.companyId || currentUser.companyId,
//             assignedCompanies: actualData.assignedCompanies || [actualData.companyId || currentUser.companyId],
//             status: 'Active'
//         });

//         await newUser.save();

//         return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 201 });

//     } catch (error) {
//         console.error('Failed to create user:', error);
//         return NextResponse.json({ 
//             message: error.name === 'MongoServerError' && error.code === 11000 
//                 ? `Duplicate value: ${Object.keys(error.keyValue).join(', ')} already exists`
//                 : error.message || 'Internal Server Error' 
//         }, { status: 500 });
//     }
// }

// export async function PUT(req) {
//     try {
//         await dbConnect();
//         const currentUser = await getDataFromToken(req);

//         if (!currentUser || (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin')) {
//             return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//         }

//         const { id, ...updateData } = await req.json();

//         const userToUpdate = await User.findById(id);
//         if (!userToUpdate) {
//             return NextResponse.json({ message: 'User not found' }, { status: 404 });
//         }

//         // Enforce company scoping and roles restriction for Admin
//         if (currentUser.role === 'Admin') {
//             if (String(userToUpdate.companyId) !== String(currentUser.companyId)) {
//                 return NextResponse.json({ message: 'Forbidden: You cannot update a user from another company' }, { status: 403 });
//             }
//             if (updateData.companyId && String(updateData.companyId) !== String(currentUser.companyId)) {
//                 return NextResponse.json({ message: 'Forbidden: Cannot change user company' }, { status: 403 });
//             }
//             if (updateData.assignedCompanies) {
//                 updateData.assignedCompanies = [currentUser.companyId];
//             }
//             if (updateData.role === 'Super Admin' || updateData.role === 'Admin' || updateData.role === 'Developer') {
//                 return NextResponse.json({ message: 'Forbidden: Cannot assign administrative/system roles' }, { status: 403 });
//             }
//             if (updateData.roleId) {
//                 const dbRole = await Role.findById(updateData.roleId);
//                 if (dbRole) {
//                     if (dbRole.companyId && String(dbRole.companyId) !== String(currentUser.companyId)) {
//                         return NextResponse.json({ message: 'Forbidden: Role belongs to another company' }, { status: 403 });
//                     }
//                     updateData.role = dbRole.name;
//                 }
//             }
//         }

//         // Safety Guard: Super Admins cannot be deactivated
//         if (updateData.status === 'Inactive' || updateData.status === 'Suspended') {
//             if (userToUpdate && userToUpdate.role === 'Super Admin') {
//                 return NextResponse.json({ message: 'Super Admin login status cannot be deactivated!' }, { status: 400 });
//             }
//         }

//         if (updateData.password) {
//             const salt = await bcrypt.genSalt(10);
//             updateData.password = await bcrypt.hash(updateData.password, salt);
//         } else {
//             delete updateData.password;
//         }

//         const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

//         if (!updatedUser) {
//             return NextResponse.json({ message: 'User not found' }, { status: 404 });
//         }

//         return NextResponse.json({ message: 'User updated successfully', user: updatedUser }, { status: 200 });

//     } catch (error) {
//         console.error('Failed to update user:', error);
//         return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
//     }
// }

// export async function DELETE(req) {
//     try {
//         await dbConnect();
//         const currentUser = await getDataFromToken(req);

//         if (!currentUser || (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin')) {
//             return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//         }

//         const { searchParams } = new URL(req.url);
//         const id = searchParams.get('id');

//         if (!id) {
//             return NextResponse.json({ message: 'ID required' }, { status: 400 });
//         }

//         const userToDelete = await User.findById(id);
//         if (!userToDelete) {
//             return NextResponse.json({ message: 'User not found' }, { status: 404 });
//         }

//         if (currentUser.role === 'Admin') {
//             if (String(userToDelete.companyId) !== String(currentUser.companyId)) {
//                 return NextResponse.json({ message: 'Forbidden: Cannot delete user from another company' }, { status: 403 });
//             }
//             const sensitiveRoles = ['Super Admin', 'Admin', 'Developer'];
//             if (sensitiveRoles.includes(userToDelete.role)) {
//                 return NextResponse.json({ message: 'Forbidden: Cannot delete administrative/system users' }, { status: 403 });
//             }
//         }

//         await User.findByIdAndDelete(id);

//         return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });

//     } catch (error) {
//         console.error('Failed to delete user:', error);
//         return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
//     }
// }

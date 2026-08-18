import dbConnect from '../../../../lib/db';
import AppSetting from '../../../../models/AppSetting';
import { NextResponse } from 'next/server';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';

export async function GET(req) {
    await dbConnect();
    try {
        const setting = await AppSetting.findOne({});
        return NextResponse.json(setting || { loginImage: '' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user || user.role !== 'Super Admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { loginImage } = body;

        let setting = await AppSetting.findOne({});
        if (setting) {
            setting.loginImage = loginImage;
            setting.updatedBy = user.userId;
            await setting.save();
        } else {
            setting = await AppSetting.create({
                loginImage,
                updatedBy: user.userId
            });
        }

        return NextResponse.json(setting);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

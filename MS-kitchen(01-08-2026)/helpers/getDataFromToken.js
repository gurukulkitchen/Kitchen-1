import jwt from 'jsonwebtoken';

export const getDataFromToken = (req) => {
    try {
        const token = req.cookies.get('auth_token')?.value || '';
        if (!token) {
            return null;
        }

        const secret = process.env.JWT_SECRET || 'secret';
        const decodedToken = jwt.verify(token, secret);
        return decodedToken;
    } catch (error) {
        return null; // Or throw error if stricly needed
    }
};

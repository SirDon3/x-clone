import jwt from 'jsonwebtoken'; 

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '15d',
    });

    res.cookie('token', token, {
        httpOnly: true, // This cookie cannot be accessed by client-side scripts
        maxAge: 15 * 24 * 60 * 60 * 1000,
        sameSite: "strict", // This cookie will only be sent in a first-party context
        secure: process.env.NODE_ENV !== "development", // This cookie will only be sent over HTTPS
    });
}
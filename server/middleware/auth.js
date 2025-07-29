import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    console.log("Received token:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: 'Unauthorized - Token missing or malformed' });
    }

    const token = authHeader.split(" ")[1]; // Extract the token part
    console.log("Extracted token:", token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

export default auth;

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
    //const token = req.cookies.access_token;
    const token = req.headers['x-auth-token'];

    if (!token) {
        return res.status(401).json({ msg: 'Authorization denied: No token provided' });
    }

    try {
        const decoded = await jwt.verify(token, JWT_SECRET);

        if(decoded.type !== 'Admin'){
            return res.status(403).json({ msg: 'Does not have enough permissions' });
        }

        req.body.id = decoded.id;
        req.body.type = decoded.type;
        req.body.email = decoded.email;

        next();
    } catch (err) {
        return res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = {
    auth
}
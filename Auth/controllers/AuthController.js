const { Sequelize } = require('sequelize');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

const User = require('../models/User');
const UserType = require('../models/UserType');

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET;
const NODE_ENV = process.env.NODE_ENV;

const signup = async (req, res) => {
    try {
        const { email, password, username, type } = req.body;

        const isUserExist = await User.findOne({
            where: {
                email: email
            }
        });

        if(isUserExist){
            return res.status(400).json({ message: 'User with email already exists' });
        }

        const [userType, isUserTypeCreated] = await UserType.findOrCreate({
            where: {
                type: type
            }
        });

        const hashedPassword = await bcryptjs.hash(password, 12);

        const user = await User.create({
            email: email,
            password: hashedPassword,
            userName: username,
            userTypeId: userType.id
        });

        const payload = {
            id: user.id,
            type: type,
            email: email
        }

        const shortJwtToken = jwt.sign(payload, JWT_SECRET, {
            expiresIn: '8h'
        });

        const longJwtToken = jwt.sign(payload, REFRESH_JWT_SECRET, {
            expiresIn: '28d'
        });

        res.cookie('access_token', shortJwtToken, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 8 * 60 * 60 * 1000
        });

        res.cookie('refresh_token', longJwtToken, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 28 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            message: 'User successfully created',
            shortJwtToken: shortJwtToken,
            longJwtToken: longJwtToken,
            type: type
        });
    }catch(err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong during signup' });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const isUserExist = await User.findOne({
            where: {
                email: email
            },
            attributes: ['password', 'email', 'id'],
            include: [
                {
                    model: UserType,
                    attributes: ['type']
                }
            ]
        });

        if(!isUserExist){
            return res.status(401).json({ message: 'Authentication error' });
        }

        const isMatch = await bcryptjs.compare(password, isUserExist.password);

        if(!isMatch){
            return res.status(401).json({ message: 'Authentication error' });
        }

        const payload = {
            id: isUserExist.id,
            type: isUserExist.UserType.type,
            email: isUserExist.email
        };

        const longJwtToken = jwt.sign(payload, REFRESH_JWT_SECRET, {
            expiresIn: '28d'
        });

        const shortJwtToken = jwt.sign(payload, JWT_SECRET, {
            expiresIn: '8h'
        });

        res.cookie('access_token', shortJwtToken, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 8 * 60 * 60 * 1000
        });

        res.cookie('refresh_token', longJwtToken, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 28 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: 'User login successfully',
            shortJwtToken: shortJwtToken,
            longJwtToken: longJwtToken,
            type: isUserExist.UserType.type
        });
    }catch(err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong during login' });
    }
}

const resetPassword = async (req, res) => {
    try {
        const { id, password, oldPassword } = req.body;

        const isUserExist = await User.findByPk(id,{
            attributes: ['password', 'email', 'id']
        });

        if(!isUserExist){
            return res.status(401).json({ message: 'User does not exist' });
        }

        const isMatch = await bcryptjs.compare(oldPassword, isUserExist.password);

        if(!isMatch){
            return res.status(401).json({ message: 'Old password does not match' });
        }

        const hashedPassword = await bcryptjs.hash(password, 12);

        await User.update({
            password: hashedPassword
        },{
            where: {
                id: id
            }
        });

        return res.status(200).json({ message: 'User password reset successfully' });
    }catch(err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong during password reset' });
    }
}

const fetchAllUsers = async (req, res) => {
    try {
        const allUsers = await User.findAll({
            attributes: ['userName', 'id']
        });

        const transformedAllUsers = allUsers.map(user => ({
            id: user.id,
            username: user.userName
        }));

        return res.status(200).json({ users: transformedAllUsers, message: 'All user data fetched' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong during user fetching' });
    }
};

const reValidateToken = async (req, res) => {
    try {
        //const refreshToken = req.cookies.refresh_token;
        const refreshToken = req.headers['x-refresh-auth-token'];

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token is required' });
        }

        let decoded;

        try {
            decoded = await jwt.verify(refreshToken, REFRESH_JWT_SECRET);
        } catch (err) {
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }

        const user = await User.findByPk(decoded.id, {
            include: [
                {
                    model: UserType,
                    attributes: ['type']
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newPayload = {
            id: user.id,
            email: user.email,
            type: user.UserType.type
        };

        const shortJwtToken = jwt.sign(newPayload, JWT_SECRET, { expiresIn: '8h' });

        res.cookie('access_token', shortJwtToken, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 8 * 60 * 60 * 1000
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 28 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: 'New token generated',
            shortJwtToken: shortJwtToken,
            longJwtToken: refreshToken,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong during new token generation' });
    }
};

module.exports = {
    signup,
    login,
    resetPassword,
    fetchAllUsers,
    reValidateToken
}
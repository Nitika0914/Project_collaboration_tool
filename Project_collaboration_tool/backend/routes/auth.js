const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret"


//test api
router.get('/', (req, res)=>{
    return res.status(201).json({message: "Hello home"});
});

// register api
router.post('/register', async (req, res) => {
    try{
        const { name, email, password, mobile, role } = req.body;
        if (!name || !email || !password || !role || !mobile) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({where: {email}});
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashedPassword, mobile, role });
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login api
// router.post('/login', async (req, res) => {
//     try{
//         const { email, password } = req.body;
//         if (!email || !password) {
//             return res.status(400).json({ message: 'Email and password are required'});
//         }

//         const user = User.findOne({where: {email}});
//         if (!user) {
//             return res.status(401).json({ message: 'Email not registered or invalid'});
//         }

//         const isMatched = await bcrypt.compare(password, user.password);
//         if (!isMatched) {
//             return res.status(401).json({ message: 'Invalid credentials'});
//         }

//         res.status(200).json({ message: 'User logged in successfully'});
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });

router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {session:false}, (err, user, info)=>{
        if(err || !user){
            return res.status(400).json({message: info? info.message: 'login failed'});
        }
        req.login(user, {session:false}, (err)=>{
            if(err) return next(err);

            const token = jwt.sign(
                { id: user.id },
                JWT_SECRET,
                { expiresIn: '1h' }
            );
            // Return token and user data (excluding password)
            return res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    mobile: user.mobile
                }
            });
        });
    })(req, res, next);
})

module.exports = router;

const express = require('express');
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account');
//-- API Handlers
/***
 * Get user profile
 */
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

/**
 * Create a new user with provided email and password
 */
router.post('/users', async (req, res) => {
    //--create a user in DB
    const user = new User(req.body);
    try {
        const token = await user.generateAuthToken();
        sendWelcomeEmail(user.email, user.name);
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

/**
 * Login the user, needs email, password as input
 */
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        if (!user) {
            return res.status(400).send();
        }
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send({ error: 'Unable to login' });
    }
});

/**
 * Logout
 */
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(t => t.token !== req.token);
        await req.user.save();
        res.send('Logged out!')
    } catch (e) {
        res.status(500).send();
    }
});

/**
 * Logout from all sessions
 */
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send("Logged out from all sessions.")
    } catch (e) {
        res.status(500).send();
    }
});

/**
 * Update a user profile
 */
router.patch('/users/me', auth, async (req, res) => {
    const providedKeys = Object.keys(req.body);
    const allowedKeys = ['name', 'age', 'email', 'password'];
    const isValid = providedKeys.every(e => allowedKeys.includes(e));
    if (!isValid) {
        return res.status(400).send({ error: "Invalid updates!" })
    }
    try {
        providedKeys.forEach(e => req.user[e] = req.body[e]);
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancellationEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file || !/\.(jpg|jpeg|png)/.test(file.originalname)) {
            return cb(new Error('Please upload an image file.'))
        }
        cb(null, true);
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    // req.user.avatar = req.file.buffer;
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send("Uploaded!");
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

/**
 * Delete profile pic
 */
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

/**
 * Retrieve the avatar
 */
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error();
        }
        res.set('Content-Type', 'image/png'); //--setting type so browser can interpret it
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
});

module.exports = router;
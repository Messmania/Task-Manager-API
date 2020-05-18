const express = require('express');
const router = new express.Router();
const auth = require("../middleware/auth");
const Task = require('../models/task');

/**
 * Get all the tasks for the current user
 * Added filtering using query string : limit=10&skip=2
 * Added sorting: ?sortBy=completed:asc or sortBy=completed:desc
 */
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    if(req.query.completed){
        match.completed = req.query.completed === "true";
    }
    const sort = {}
    if(req.query.sortBy){
        const [field, order] = req.query.sortBy.split(":");
        sort[field] = order === "asc" ? 1 : -1;
    }
    try {
        // const tasks = await Task.find({ owner: req.user._id }).skip(parseInt(req.query.skip)).limit(parseInt(req.query.limit)); //---method 1
        // res.send(tasks);

        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate(); //--method 2
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send(e)
    }
});

/**
 * Fetch a task by id for the current logged in user
 */
router.get('/tasks/:id', auth, async (req, res) => {
    try {
        // const task = await Task.findById(req.params.id);
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
        if (!task) {
            return res.status(404).send('Task not found!')
        }
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

/**
 * Create a new task for current user
 */
router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body);
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

/**
 * Update a task by id (for current user)
 */
router.patch('/tasks/:id', auth, async (req, res) => {
    const providedKeys = Object.keys(req.body);
    const allowedKeys = ["completed", "description"];
    const isValid = providedKeys.every(e => allowedKeys.includes(e));
    if (!isValid) {
        return res.status(400).send({ error: "Invalid updates attempted" });
    }
    const id = req.params.id;
    try {
        // const t = await Task.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        const t = await Task.findOne({ _id: id, owner: req.user._id });
        if (!t) {
            return res.status(400).send("Task not found");
        }
        providedKeys.forEach(e => t[e] = req.body[e]);
        await t.save();
        res.send(t);
    } catch (e) {
        res.status(400).send({ e });
    }
});

/**
 * Delete a task by id
 */
router.delete('/tasks/:id', auth,  async (req, res) => {
    try {
        const t = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!t) {
            return res.status(404).send();
        }
        res.send(t);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require("openai");
const User = require('../models/User')

// Middleware to check if the user is logged in
const isLoggedIn = (req, res, next) => {
    if (res.locals.loggedIn) {
        next()
    } else {
        res.redirect('/login')
    }
}

// Configuration for OpenAI API
const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY
});

// Create instance of OpenAI API
const openai = new OpenAIApi(configuration);

// Route to ask a question and receive a response
router.post('/ask', async (req, res, next) => {
    console.log('----------')
    console.log(req.body)
    const { content, id } = req.body;
    await User.findByIdAndUpdate(id, {
        $addToSet: { chat: content }
    })
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: content,
    });
    console.log(completion.data.choices);
    res.json({ res: completion.data.choices[0].text });
})

// Route to display chat form for a user
router.get('/chatform/:id', isLoggedIn, async (req, res, next) => {
    const id = req.params.id;
    console.log(id);
    const user = await User.findById(id);
    console.log(user);
    res.render('chatform', { chat: user.chat });
});

module.exports = router;

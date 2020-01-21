const express = require('express');
const nanoid = require('nanoid/non-secure/generate');
const hbs = require('express-hbs');
const app = express();

const port = process.env.PORT || 3000;

const data = {};
const renderables = {
    title: 'Decision Countdown - bc you SUCK at choosing'
};
const colors = ['#2a2b2a','#337357','#ba7ea5','#2b4162','#235789'];

app.engine('hbs', hbs.express4({
    partialsDir: `${__dirname}/views/partials`,
    layoutsDir: `${__dirname}/views/layout`
}));
app.set('view engine', 'hbs');
app.set('views', `${__dirname}/views`);

app.use(express.json());

app.get('/', (req, res) => {
    // start a poll
    let result = Object.assign(renderables, {
        accent: colors[Math.floor(Math.random() * 5)],
        time: 0,
        question: JSON.stringify(''),
        options: JSON.stringify([]),
        url: ''
    });
    res.render('index', result);
});

app.post('/add', (req, res) => {
    // post JSON data here to add to data
    // validation
    if (req.body.time < 0 || req.body.time > 30) {
        return res.status(400).send('Must pick 0-30s');
    }
    if (req.body.question === '') {
        return res.status(400).send('Question cannot be empty');
    }
    if (req.body.options.length === 0 || req.body.options.length > 20) {
        return res.status(400).send('Number of options should be 1-20');
    }
    // add to data under nanoid()
    const id = nanoid('1234567890abcdef', 6);
    const optionContainer = {
        options: {}
    };
    req.body.options.forEach(option => {
        optionContainer['options'][option] = 0;
    });
    data[id] = Object.assign(req.body, optionContainer);
    return res.status(200).send(`${req.protocol}://${req.get('host')}/respond/${id}`);
});

const stringify = (obj) => {
    const returnable = {};
    for (const [k, v] of Object.entries(obj)) {
        returnable[k] = JSON.stringify(v);
    }
    return returnable;
};

app.get('/results/:code', (req, res) => {
    res.render('votes', Object.assign(Object.assign(renderables, stringify(data[req.params.code])), {url: `${req.protocol}://${req.get('host')}/respond/${req.params.code}`}));
});

app.get('/respond/:code', (req, res) => {
    // other people can respond (add votes to data)
    // what if code doesn't exist?
    if (!data[req.params.code]) {
        return res.sendStatus(404);
    }
    let result = Object.assign(Object.assign(renderables, stringify(data[req.params.code])), {url: `${req.protocol}://${req.get('host')}/respond/${req.params.code}`});
    res.render('respond', result);
});

app.post('/respond/:code', (req, res) => {
    // other people can respond (add votes to data)
    // what if code doesn't exist?
    if (!data[req.params.code]) {
        return res.status(404).send('Poll not found');
    }
    if (!(req.body.vote in data[req.params.code]['options'])) {
        return res.status(409).send('Option not found');
    }
    data[req.params.code]['options'][req.body.vote] += 1;
    return res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

const path = require('path')
const express = require('express')
const data = require('./data/puzzles')
const answers = require('./lib/answers')
const createGate = require('./middleware/gate')

const app = express()

const puzzles = data.concat('victory').map(question => Object.freeze({ slug:crypto.randomUUID(), question:question }))
const gate = createGate(puzzles)


app.set('view engine', 'ejs') // view engine refers to the type of templating, change based on used templating agent
app.set('views', path.join(__dirname, 'views')) // views folder as nav folder
app.use(express.static(path.join(__dirname, 'public'))) // public folder as home folder, this is why assets are stored/referenced from here

// Start page: title, story intro, and a Start link to puzzle 1's path
app.get('/', (req, res) => res.render('index'))

// Shows the puzzle at that secret path and its answer form
app.get('/play/:slug', gate, (req, res) => {

})
// Checks the submitted answer for that puzzle
app.post('/play/:slug', gate, (req, res) => {
    try {
        if (!req.body) throw new Error("Please enter an answer")

        let answer = String(req.body.answer).toLowerCase().replace(/\s+/g, " ").replace(/^(a|an|the)\s+/i, "").replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "").trim()
        if (!answer || typeof answer !== 'string') throw new Error("Please enter an answer")
        if (answer.length > 100) throw new Error('The answer is too long')

        let index = data.findIndex(q => q.question === req.question)
        if (answer === answers[index]) res.redirect(`/play/${data[index + 1].slug}`)
        else res.render('puzzle', { question:data[req.body.id] + '\n\nNot quite. Try again.' })
    } catch (err) {
        res.status(400).render('puzzle', { question:data[req.body.id] + `\n\n${err.message}` })
    }
})

// Final page, at its own secret path
app.get('/victory/:slug', gate, (req, res) => {
    
})

// 404
app.use(/.*/, (req, res) => res.status(404).render('not-found'))

app.listen(5000, () => {
    console.log(`Puz-Zoo listening on http://localhost:5000`)
})
const path = require('path')
const express = require('express')
const {ApiError, createGuard, validate} = require('./guard-kit')
const data = require('./data/puzzles')
const answers = require('./lib/answers')
const createGate = require('./middleware/gate')

const guard = createGuard()
const app = express()

const puzzles = data.concat('victory').map(question => Object.freeze({ slug:crypto.randomUUID(), question:question }))
const gate = createGate(puzzles)


app.set('view engine', 'ejs') // view engine refers to the type of templating, change based on used templating agent
app.set('views', path.join(__dirname, 'views')) // views folder as nav folder
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static(path.join(__dirname, 'public'))) // public folder as home folder, this is why assets are stored/referenced from here

// Start page: title, story intro, and a Start link to puzzle 1's path
app.get('/', (req, res) => res.render('index', { startPath:puzzles[0].slug }))

// Shows the puzzle at that secret path and its answer form
app.get('/play/:slug', gate, (req, res, next) => {
    if (res.locals.question === 'victory') return res.redirect(`/victory/${req.params.slug}`)
    res.render('puzzle', { ...res.locals.question, index:res.locals.index })
})
// Checks the submitted answer for that puzzle
app.post('/play/:slug', gate, (req, res) => {
    try {
        guard.assert(validate.object(req.body), "Enter an answer")

        let answer = String(req.body.answer).toLowerCase().replace(/\s+/g, " ").replace(/^(a|an|the)\s+/i, "").replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "").trim()
        guard.assert(validate.nonEmptyString(answer), "Enter an answer")
        guard.assert(answer.length <= 100, 'The answer is too long')

        if (answer === answers[res.locals.index]) {
            let next = puzzles[res.locals.index + 1]
            res.redirect(`/${next.question === 'victory' ? 'victory' : 'play'}/${next.slug}`)
        }
        else res.render('puzzle', { ...res.locals.question, index:res.locals.index, error:'Not quite. Try again.' })
    } catch (err) {
        res.render('puzzle', { ...res.locals.question, index:res.locals.index, error:err.message })
    }
})

// Final page, at its own secret path
app.get('/victory/:slug', gate, (req, res) => res.render('victory'))

// 404
app.use(/.*/, (req, res) => res.status(404).render('not-found'))

app.listen(5000, () => {
    console.log(`Puz-Zoo listening on http://localhost:5000`)
    console.log(puzzles)
})
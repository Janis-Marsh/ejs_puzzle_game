const path = require('path')
const express = require('express')
const data = require('./data/puzzles')
const answers = require('./lib/answers')

const app = express()

app.set('view engine', 'ejs') // view engine refers to the type of templating, change based on used templating agent
app.set('views', path.join(__dirname, 'views')) // views folder as nav folder
app.use(express.static(path.join(__dirname, 'public'))) // public folder as home folder, this is why assets are stored/referenced from here

// Start page: title, story intro, and a Start link to puzzle 1's path
app.get('/', (req, res) => {
    
})

// Shows the puzzle at that secret path and its answer form
app.get('/play/:slug', (req, res) => {

})
// Checks the submitted answer for that puzzle
app.post('/play/:slug', (req, res) => {
    
})

// Final page, at its own secret path
app.get('/victory/:slug', (req, res) => {

})

app.listen(5000, () => console.log(`Puz-Zoo listening on http://localhost:5000`))
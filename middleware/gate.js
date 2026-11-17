module.exports = (data) => {
    return (req, res, next) => {
        let puzzle = data.find(item => item.slug === req.params.slug)
        if (!puzzle) return next('route')
        req.question = puzzle.question
        req.index = data.findIndex(i => i.question === puzzle.question)
        next()
    }
}
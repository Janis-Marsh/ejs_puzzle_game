module.exports = (data) => {
    return (req, res, next) => {
        let q = data.find(item => item.slug === req.params.slug)
        if (!q) throw new Error('Question not found')
        req.question = q
        next()
    }
}
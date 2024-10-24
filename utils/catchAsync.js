// Wrapper function to wrap try-catch

module.exports = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
} 
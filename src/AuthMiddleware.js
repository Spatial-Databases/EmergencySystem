async function AuthMiddleware(req, res, next) {
    try {
        const user_api_key = await (`${req.headers.authorization}`);
        if (user_api_key == `Bearer ${process.env.API_KEY}`) {
            next();
        } else {
            res.status(401).json({
                error: 'Unauthorized'
            });
        }
    } catch (e) {
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
}

module.exports = AuthMiddleware;
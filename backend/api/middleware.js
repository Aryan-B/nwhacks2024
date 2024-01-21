const jwt = require('jsonwebtoken');

function middleware(req, res, next) {
    console.log("middleware");
    const token = req.cookies.token; 
    console.log(token);
    if (!token) return res.status(200).send({ authStatus: "failed", identifier: "none" });
    try {
        const decoded = jwt.verify(token, "helloworld");
        req.user = decoded;
        console.log(decoded);
        next();
    } catch (ex) {
        res.status(200).send({ authStatus: "failed", identifier: "none" });
    }
}

module.exports = middleware;

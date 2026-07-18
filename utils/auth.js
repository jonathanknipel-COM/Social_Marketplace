const jwt = require('jsonwebtoken');

/*
 * plain helper (not middleware) that tells us who is making the request.
 * the client sends its login token in the "Authorization" header (just the token itself).
 * returns the decoded user {id, isAdmin}, or null if there's no valid token.
 * we call this at the top of any controller that should be logged-in only.
 */
const getLoggedInUser = (req) => {
    const token = req.headers.authorization; //the token the client sent

    if (!token) {
        return null; //no token = guest
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET); //valid token -> {id, isAdmin}
    } catch (error) {
        return null; //bad or expired token = treat as guest
    }
};

module.exports = {getLoggedInUser};

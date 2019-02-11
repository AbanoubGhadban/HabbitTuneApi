const { verifyToken } = require('../utils/jwt');
const { isParent } = require('../utils/utils');
const AuthenticationError = require('../errors/AuthenticationError');
const ForbiddenError = require('../errors/ForbiddenError');
const User = require('../models/User');
const Child = require('../models/Child');

// Groups: Specify what groups of users are accepted (Pending, Normal, Admin)
// If no groups provided, all users are blocked
// Allow Children: allow children to access route
const checkAuth = (groups, allowChildren) => {
    return async (req, res, next) => {
        const authHeader = req.header('Authorization');
        if (!authHeader || authHeader.length < 8) {
            throw AuthenticationError.missingToken();
        }

        const token = authHeader.substr(7);
        const decoded = await verifyToken(token);
        if (decoded.role === 'father' || decoded.role === 'mother') {
            // Add user object to request, so any function can access it
            // To get user, use req.user()
            const user = await User.findById(decoded.id);
            req.user = async () => user;

            if (!groups || !groups.length) {
                throw new ForbiddenError();
            }

            const group = user.group;
            if (!groups.includes(group)) {
                throw new ForbiddenError();
            }
        } else {
            const child = await Child.findById(decoded.id);
            req.user = async () => child;

            if (!allowChildren) {
                throw new ForbiddenError();
            }
        }
        next();
    }
}

checkRefreshToken = async (req, res, next) => {
    if (!req.body || !req.body.refreshToken) {
        throw AuthenticationError.missingRefreshToken();
    }

    const refreshToken = req.body.refreshToken;
    let decoded = null;
    try {
        decoded = await verifyToken(refreshToken);
    } catch (err) {
        throw AuthenticationError.invalidRefreshToken();
    }

    if (isParent(decoded)) {
        const user = await User.findById(decoded.id);
        req.user = async () => user;
    } else {
        const child = await Child.findById(decoded.id);
        req.user = async () => child;
    }
    next();
}

module.exports = {
    onlyChildren: checkAuth(null, true),
    onlyPendings: checkAuth(['pending'], false),    
    onlyNormals: checkAuth(['normal'], false),    
    onlyAdmins: checkAuth(['admin'], false),
    normalOrAdmin: checkAuth(['admin', 'normal'], false),
    exceptPendings: checkAuth(['admin', 'normal'], true),
    allowAll: checkAuth(['admin', 'normal', 'pending'], true),
    checkRefreshToken
}

const { verifyToken } = require('../utils/jwt');
const { isParent } = require('../utils/utils');
const AuthenticationError = require('../errors/AuthenticationError');
const ForbiddenError = require('../errors/ForbiddenError');
const errors = require('../errors/types');
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

const checkRefreshToken = async (req, res, next) => {
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

    // Check if client is parent or child
    if (isParent(decoded)) {
        const user = await User.findById(decoded.id);
        req.user = async () => user;
    } else {
        const child = await Child.findById(decoded.id);
        req.user = async () => child;
    }
    next();
}

// Checks that userId (some parameter sent by client) is the same as the current login user
// payload => Specify how user sent (userId) value, may be (params, body or query)
const sameUserId = (allowAdmin = true, payload = 'params') => async (req, res, next) => {
    const user = await req.user();
    if (allowAdmin && user.group === 'admin') {
        next();
    }
    
    if (+req[payload].userId !== user.id) {
        console.log("A", req[payload], user.id);
        
        throw new ForbiddenError(
            errors.ACTION_OF_ANOTHER_USER,
            'You are trying to do action by the name of other user'
        );
    }
    next();
}

// Checks that current user is parent in family that sent as (familyId)
// payload => Specify how user sent (family) value, may be (params, body or query)
const parentInFamily = (allowAdmin = true, payload = 'params') => async (req, res, next) => {
    const user = await req.user();
    if (allowAdmin && user.group === 'admin') {
        next();
    }

    const familyId = req[payload].familyId;
    const matchedFamilies = await user.getFamilies({where: {id: familyId}});
    if (!(matchedFamilies.length > 0)) {
        throw new ForbiddenError(
            errors.NOT_PARENT_IN_FAMILY,
            'You are trying to modify other family'
        );
    }
    next();
}

const parentOfChild = (allowAdmin = true, payload = 'params') => async (req, res, next) => {
    const user = await req.user();
    if (allowAdmin && user.group === 'admin') {
        next();
    }

    const childId = req[payload].childId;
    const matchedFamilies = await user.getFamilies({
        attributes: ['id'],
        include: [{
            model: Child,
            where: {id: childId},
            attributes: ['id']
        }]
    });
    
    if (!(matchedFamilies.length > 0)) {
        throw new ForbiddenError(
            errors.NOT_PARENT_OF_CHILD,
            'You are trying to access child not of you'
        );
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
    eventBlocked: checkAuth(['admin', 'normal', 'pending', 'blocked'], true),
    checkRefreshToken,
    sameUserId,
    parentInFamily,
    parentOfChild
}

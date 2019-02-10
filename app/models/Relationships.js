const Family = require('./Family');
const User = require('./User');
const Child = require('./Child');
const RegistrationToken = require('./RegistrationToken');
const ActivationCode = require('./ActivationCode');
const JoinCode = require('./JoinCode');
const ChildLoginCode = require('./ChildLoginCode');

// Child Relationships
Child.belongsTo(Family);
Child.hasMany(ChildLoginCode);
Child.hasMany(RegistrationToken, {
    constraints: false,
    foreignKey: 'clientType',
    scope: {
        clientType: 'child'
    }
});


// Family Relationships
Family.hasMany(Child);
Family.hasMany(JoinCode);
Family.belongsToMany(User, {through: 'user_family'});


// RegistrationToken Relationships
RegistrationToken.belongsTo(User, {
    constraints: false,
    foreignKey: 'clientId',
    as: 'user'
});

RegistrationToken.belongsTo(Child, {
    constraints: false,
    foreignKey: 'clientId',
    as: 'child'
});


// User Relationships
User.belongsToMany(Family, {through: 'user_family'});
User.hasMany(ActivationCode);

User.hasMany(RegistrationToken, {
    constraints: false,
    foreignKey: 'clientId',
    scope: {
        clientType: 'user'
    }
});


// ActivationCode Relationships
ActivationCode.belongsTo(User);


// JoinCode Relationships
JoinCode.belongsTo(Family);


// ChildLoginCode Relationships
ChildLoginCode.belongsTo(Child);

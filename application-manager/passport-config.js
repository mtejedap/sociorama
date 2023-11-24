const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');
const User = require('./models/user');

function initializePassport(passport) {
    passport.use(new LocalStrategy(async (username, password, done) => {
        try {
            const user = await User.findOne({ username: username });
            if (!user) {
                return done(null, false, { message: "Username does not exist" });
            }
            const passwordMatches = await bcrypt.compare(password, user.password);
            if (!passwordMatches) {
                return done(null, false, { message: "Incorrect password" })
            }
            return done(null, user);
        } catch(err) {
            return done(err);
        }
    }));
    
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch(err) {
            done(err);
        }
    });
}

module.exports = initializePassport;
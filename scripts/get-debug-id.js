const { connectMongo } = require('../src/config/db');
const User = require('../src/features/users/models/user.model');
require('dotenv').config();

async function getFirstUserId() {
    try {
        await connectMongo();
        const user = await User.findOne({});
        if (user) {
            console.log('USER_ID:' + user._id);
        } else {
            console.log('NO_USERS_FOUND');
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

getFirstUserId();

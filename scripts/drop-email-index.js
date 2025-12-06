/**
 * Drop Email Index Script
 * Removes old email_1 unique index from users collection
 * Run once after changing email field to non-unique
 */

require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../src/config/env');

async function dropEmailIndex() {
    try {
        await mongoose.connect(config.mongodb.uri, {
            dbName: config.mongodb.dbName,
        });

        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        // Drop email_1 index
        try {
            await collection.dropIndex('email_1');
            console.log('✅ Dropped email_1 index successfully');
        } catch (error) {
            if (error.code === 27) {
                console.log('ℹ️  email_1 index does not exist (already dropped)');
            } else {
                throw error;
            }
        }

        console.log('✅ Done!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

dropEmailIndex();

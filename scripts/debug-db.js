
require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/school_equipment_management';

async function debugDb() {
    try {
        console.log('--- MONGODB DEBUG SCRIPT ---');
        console.log(`Connecting to URI: ${uri}`);

        await mongoose.connect(uri);
        console.log('✅ Connected successfully!');

        const admin = mongoose.connection.db.admin();

        // List all databases
        const result = await admin.listDatabases();
        console.log('\nAvailable Databases:');
        result.databases.forEach(db => {
            console.log(` - ${db.name} (${db.sizeOnDisk} bytes)`);
        });

        // List collections in CURRENT database
        const currentDbName = mongoose.connection.db.databaseName;
        console.log(`\nCollections in CURRENT database ('${currentDbName}'):`);
        const collections = await mongoose.connection.db.listCollections().toArray();

        if (collections.length === 0) {
            console.log('   (No collections found - Database might be empty)');
        } else {
            for (const col of collections) {
                const count = await mongoose.connection.db.collection(col.name).countDocuments();
                console.log(` - ${col.name}: ${count} documents`);

                // If this is a user collection, print first 3 docs
                if (col.name.toLowerCase().includes('user') || col.name.toLowerCase().includes('nhanvien')) {
                    const docs = await mongoose.connection.db.collection(col.name).find().limit(3).toArray();
                    console.log('   Sample docs:', docs.map(d => ({ _id: d._id, username: d.username, maNV: d.maNV })));
                }
            }
        }

        console.log('\n--- END DEBUG ---');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

debugDb();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './server/.env' });

console.log('Testing connection to:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('SUCCESS: Connected to MongoDB Atlas');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE: Could not connect to MongoDB Atlas');
        console.error(err);
        process.exit(1);
    });

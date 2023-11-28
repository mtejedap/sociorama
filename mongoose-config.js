require('dotenv').config();

function initializeMongoose(mongoose) {
    mongoose.set("strictQuery", false);
    const mongoDB = process.env.MONGODB_URI;
    main().catch((err) => console.log(err));
        async function main() {
        await mongoose.connect(mongoDB);
    }
}

module.exports = initializeMongoose;
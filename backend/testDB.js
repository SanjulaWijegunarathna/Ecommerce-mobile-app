const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/atelier', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');

const test = async () => {
    try {
        const user = await User.findOne({});
        console.log("DB User:", user);
    } catch(e) {
        console.log("Error:", e);
    }
    process.exit();
}
test();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const runTest = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/atelier', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // 1. Create a user
  await User.deleteMany({ email: 'test@example.com' });
  const user = await User.create({ name: 'Test User', email: 'test@example.com', password: 'password123' });
  console.log('Created user:', { name: user.name, phone: user.phone, dob: user.dob });

  // 2. Simulate PersonalInfoScreen updating phone/dob
  user.phone = '1234567890';
  user.dob = '01 JAN 2000';
  await user.save();

  // 3. Simulate Login fetching user
  const loggedInUser = await User.findOne({ email: 'test@example.com' });
  console.log('Logged in user:', { name: loggedInUser.name, phone: loggedInUser.phone, dob: loggedInUser.dob });

  process.exit();
};

runTest();

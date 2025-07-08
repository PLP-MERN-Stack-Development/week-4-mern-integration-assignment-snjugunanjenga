const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const categories = [
  'JavaScript',
  'Python',
  'DevOps',
  'Frontend',
  'Backend',
  'Testing',
  'Career',
  'Tools',
  'Databases',
  'Cloud',
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  for (const name of categories) {
    const exists = await Category.findOne({ name });
    if (!exists) {
      await Category.create({ name });
      console.log(`Created category: ${name}`);
    }
  }
  await mongoose.disconnect();
  console.log('Seeding complete.');
}

seed(); 
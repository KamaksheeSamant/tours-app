const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');

console.log('ARGUMENTS>>>', process.argv);

dotenv.config({ path: '../../config.env' });
const fileName =
  (process.argv && process.argv.length >= 4 && process.argv[3]) || null;

let data = {};

if (!fileName) {
  // process.exit();
} else {
  data = fs.readFileSync(`${__dirname}/${fileName}.json`, 'utf-8');
  data = JSON.parse(data);
}

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log(`DB connection successful!`);
  });

const pushJsonToMongoDB = async () => {
  try {
    await Tour.create(data);
    console.log('Data successfully loaded!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const DeleteDataFromMongoDB = async () => {
  try {
    const collectionToDelete =
      (process.argv && process.argv.length >= 4 && process.argv[3]) || null;
    switch (collectionToDelete) {
      case 'TOURS': {
        await Tour.deleteMany();
        console.log('Data successfully deleted!');
        break;
      }
      default: {
        console.log('No Collection specified to be deleted!');
      }
    }
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (
  process.argv &&
  process.argv.length >= 3 &&
  process.argv[2] === '--import'
) {
  pushJsonToMongoDB();
}

if (
  process.argv &&
  process.argv.length >= 3 &&
  process.argv[2] === '--delete'
) {
  DeleteDataFromMongoDB();
}

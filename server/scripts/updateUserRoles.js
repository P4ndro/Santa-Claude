import mongoose from 'mongoose';
import { User } from '../models/User.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

async function updateUserRoles() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
    if (!mongoUri) throw new Error('MONGODB_URI or MONGODB_URL not set');
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected!');

    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'candidate' } }
    );

    console.log(`Updated ${result.modifiedCount} users with default 'candidate' role`);
    console.log('\n✅ Update completed!');
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

updateUserRoles();


import connectDB from './server/config/db.js';
import mongoose from 'mongoose';
import BattleRoom from './server/models/BattleRoom.js';

await connectDB();
const latestRooms = await BattleRoom.find().sort({ createdAt: -1 }).limit(3);
console.log('Latest rooms:');
latestRooms.forEach(r => console.log(r.roomCode, r.status, r.guestReady, r.questions.length));
process.exit(0);

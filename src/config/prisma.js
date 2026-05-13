// src/config/prisma.js
import { PrismaClient } from '../generated/prisma/client.js';
import {PrismaPg} from '@prisma/adapter-pg';
// const prisma = new PrismaClient({
//   log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
// });

// export default prisma;


const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;
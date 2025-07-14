import { PrismaClient } from '@prisma/client';
import { DataProxyEngine } from '@prisma/adapter-data-proxy';

export const prisma = new PrismaClient({
  // @ts-ignore
  adapter: DataProxyEngine(),
}); 
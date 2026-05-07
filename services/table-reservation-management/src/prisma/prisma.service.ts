import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
<<<<<<< HEAD
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
=======
    const { connectionString, schema } = PrismaService.connectionSettings();
    const adapter = new PrismaPg({ connectionString }, { schema });
>>>>>>> 407dde90 (fix:: add latest features)

    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
<<<<<<< HEAD
=======

  private static connectionSettings(): {
    connectionString: string;
    schema?: string;
  } {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required');
    }

    const url = new URL(connectionString);
    const schema = url.searchParams.get('schema');

    return {
      connectionString: url.toString(),
      schema: schema ?? undefined,
    };
  }
>>>>>>> 407dde90 (fix:: add latest features)
}

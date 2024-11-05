import { Injectable } from '@nestjs/common';
import {
  Pool,
  createPool,
  PoolConnection,
  FieldPacket,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';

@Injectable()
export class DatabaseService {
  private pool: Pool;
  constructor() {
    this.pool = createPool({
      port: 3306,
      database: 'EquipoPapaFritaDB',
      password: 'root',
      host: 'localhost',
      user: 'root',
      connectionLimit: 10,
    });
  }

  executeQuery = async (
    sql: string,
    param: any[],
  ): Promise<ResultSetHeader> => {
    const connection: PoolConnection = await this.pool.getConnection();
    const [result]: [ResultSetHeader, FieldPacket[]] =
      await connection.query<ResultSetHeader>(sql, param);
    this.pool.releaseConnection(connection);
    return result;
  };

  executeSelect = async (
    sql: string,
    param: any[],
  ): Promise<RowDataPacket[]> => {
    const connection: PoolConnection = await this.pool.getConnection();
    const [result]: [RowDataPacket[], FieldPacket[]] = await connection.query<
      RowDataPacket[]
    >(sql, param);
    this.pool.releaseConnection(connection);
    return result;
  };
}

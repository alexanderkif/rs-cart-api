import { Pool } from 'pg';

const poolConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
}

export const dbQuery = async (query: string, values: any[]): Promise<any> => {
  console.log('dbQuery query', query);
  console.log('dbQuery values', values);

  const pool = new Pool(poolConfig);

  const res = await pool
    .query(query, values)
    .then((result) => {
      return result;
    })
    .catch((e) => console.error(e.stack))
    .finally(() => {
      pool.end();
    });
  console.log('dbQuery res', res.rows);
  return res;
}

/* eslint-disable no-undef */
import 'jest';
import supertest from 'supertest';
import app from '../src/app';
import connection from '../src/database';

beforeEach(async () => {
  const userId = await connection.query("SELECT id FROM users WHERE email = 'bootcamp@respondeai.com'");
  //   console.log(userId?.rows[0]?.id);
  await connection.query('DELETE FROM transactions WHERE "userId" = $1', [userId?.rows[0]?.id]);
  await connection.query('DELETE FROM sessions WHERE "userId" = $1', [userId?.rows[0]?.id]);
  await connection.query("DELETE FROM users WHERE email = 'bootcamp@respondeai.com'");
});

// CREATE TABLE "transactions" (
// 	"id" serial PRIMARY KEY,
// 	"value" integer NOT NULL,
// 	"description" TEXT NOT NULL,
// 	"date" DATE NOT NULL,
// 	"type" TEXT NOT NULL,
// 	"userId" integer NOT NULL
// );

describe('GET /home', () => {
  it('returns status 405 for empty token', async () => {
    const body = {
      token: '',
    };
    const result = await supertest(app).get('/home').send(body);
    expect(result.status).toEqual(405);
  });

  it('returns status 401 for invalid session', async () => {
    const body = {
      name: 'bootcamp', email: 'bootcamp@respondeai.com', password: 'banana', repeatPassword: 'banana',
    };
    await supertest(app).post('/register').send(body);
    await supertest(app).post('/login').send({ email: 'bootcamp@respondeai.com', password: 'banana' });
    const body2 = {
      token: 'akjhdkajhkjahf',
      userId: 405,
    };
    const session = await supertest(app).get('/home').send(body2);
    expect(session.status).toEqual(401);
  });

  //   it('returns status 409 for duplicated email', async () => {
  //     const body = {
  //       name: 'bootcamp', email: 'bootcamp@respondeai.com', password: 'banana', repeatPassword: 'banana',
  //     };
  //     await supertest(app).post('/register').send(body);
  //     const secondTry = await supertest(app).post('/register').send(body);
  //     expect(secondTry.status).toEqual(409);
  //   });

//   it('returns status 201 for valid params', async () => {
//     const body = {
//       name: 'bootcamp', email: 'bootcamp@respondeai.com', password: 'banana', repeatPassword: 'banana',
//     };
//     const result = await supertest(app).post('/register').send(body);
//     expect(result.status).toEqual(201);
//   });
});

// describe('POST /login', () => {
//   it('returns status 422 for invalid params', async () => {
//     const body = {
//       email: 'bootcamp@respondeai.com', password: '',
//     };
//     const result = await supertest(app).post('/login').send(body);
//     expect(result.status).toEqual(422);
//   });

//   it('returns status 401 for unauthorized params', async () => {
//     const body = { email: 'bootcamp@respondeai.com', password: 'melancia' };
//     const result = await supertest(app).post('/login').send(body);
//     expect(result.status).toEqual(401);
//   });

//   it('returns status 200 for valid params', async () => {
//     const body = {
//       name: 'bootcamp', email: 'bootcamp@respondeai.com', password: 'banana', repeatPassword: 'banana',
//     };
//     await supertest(app).post('/register').send(body);
//     const result = await supertest(app).post('/login').send({ email: 'bootcamp@respondeai.com', password: 'banana' });
//     expect(result.status).toEqual(200);
//     expect(result.body).toEqual(
//       expect.objectContaining({
//         token: expect.any(String),
//         id: expect.any(Number),
//         email: body.email,
//         name: body.name,
//       }),
//     );
//   });
// });

afterAll(() => {
  connection.end();
});
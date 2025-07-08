jest.setTimeout(120000);
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Category = require('../models/Category');

let mongoServer;
let token;

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret';
  mongoServer = await MongoMemoryServer.create({
    instance: {
      port: 27019,
      dbName: 'test',
      args: ['--quiet'],
    },
    binary: {
      downloadDir: 'C:/mongodb-binaries',
      version: '7.0.14',
    },
    autoStart: true,
    spawnTimeoutMS: 120000,
  });
  await mongoose.disconnect();
  await mongoose.connect(mongoServer.getUri());
  // Register and login a user for category tests
  await request(app)
    .post('/api/auth/register')
    .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'password123' });
  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

afterEach(async () => {
  await Category.deleteMany();
});

describe('Categories API', () => {
  it('should not allow unauthenticated category creation', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Tech' });
    expect(res.statusCode).toBe(401);
  });

  it('should create a category with valid data and auth', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Tech' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Tech');
  });

  it('should not create a category with missing name', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should not create a category with duplicate name', async () => {
    await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Tech' });
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Tech' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message || (res.body.errors && res.body.errors[0].msg)).toBeDefined();
  });

  it('should list all categories (public)', async () => {
    await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Tech' });
    const res = await request(app)
      .get('/api/categories');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].name).toBe('Tech');
  });
}); 
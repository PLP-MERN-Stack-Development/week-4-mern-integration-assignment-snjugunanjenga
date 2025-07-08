jest.setTimeout(120000);
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Post = require('../models/Post');

let mongoServer;
let token;

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret';
  mongoServer = await MongoMemoryServer.create({
    instance: {
      port: 27018,
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
  // Register and login a user for post tests
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
  await Post.deleteMany();
});

describe('Posts API', () => {
  it('should not allow unauthenticated post creation', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'Test Post', content: 'Test content' });
    expect(res.statusCode).toBe(401);
  });

  it('should create a post with valid data and auth', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Post', content: 'Test content' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Post');
    expect(res.body.content).toBe('Test content');
  });

  it('should not create a post with missing fields', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should list all posts (public)', async () => {
    // Create a post first
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Post', content: 'Test content' });
    const res = await request(app)
      .get('/api/posts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].title).toBe('Test Post');
  });
}); 
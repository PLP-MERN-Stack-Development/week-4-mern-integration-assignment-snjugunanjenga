jest.setTimeout(120000);
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Post = require('../models/Post');

let mongoServer;
let token;
let otherToken;
let postId;

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret';
  mongoServer = await MongoMemoryServer.create({
    instance: {
      port: 27020,
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
  // Register and login author
  await request(app)
    .post('/api/auth/register')
    .send({ username: 'author', email: 'author@example.com', password: 'password123' });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'author@example.com', password: 'password123' });
  token = res.body.token;
  // Register and login another user
  await request(app)
    .post('/api/auth/register')
    .send({ username: 'other', email: 'other@example.com', password: 'password123' });
  const res2 = await request(app)
    .post('/api/auth/login')
    .send({ email: 'other@example.com', password: 'password123' });
  otherToken = res2.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

afterEach(async () => {
  await Post.deleteMany();
});

describe('Post Edit/Delete API', () => {
  beforeEach(async () => {
    // Create a post as author
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Editable Post', content: 'Content' });
    postId = res.body._id;
  });

  it('should allow the author to edit their post', async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title', content: 'Updated Content' });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Title');
  });

  it('should not allow editing with invalid data', async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '', content: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should not allow a non-author to edit the post', async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Hacked', content: 'Hacked' });
    // Should be 403 Forbidden or 404 Not Found depending on implementation
    expect([403, 404]).toContain(res.statusCode);
  });

  it('should allow the author to delete their post', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Post deleted');
  });

  it('should not allow a non-author to delete the post', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    // Should be 403 Forbidden or 404 Not Found depending on implementation
    expect([403, 404]).toContain(res.statusCode);
  });

  it('should return 404 for editing/deleting non-existent post', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const editRes = await request(app)
      .put(`/api/posts/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Nope', content: 'Nope' });
    expect(editRes.statusCode).toBe(404);
    const delRes = await request(app)
      .delete(`/api/posts/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(delRes.statusCode).toBe(404);
  });
}); 
import axios from 'axios';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users } from '@incognidial/db';

describe('GET /api', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/api`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });
});

describe('POST /api/users/register', () => {
  beforeEach(async () => {
    // Delete all users from the database
    const db = drizzle(process.env.DATABASE_URL);
    await db.delete(users).execute();
  });

  it('should register a new user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      phoneNumber: '1234567890',
      password: 'securepassword12',
      name: 'Test User',
    };

    const res = await axios.post('/api/users/register', { ...userData });

    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty('id');
  });

  it('should reject registration with short password', async () => {
    const userData = {
      email: 'test@example.com',
      phoneNumber: '1234567890',
      password: 'short',
      name: 'Test User',
    };

    try {
      await axios.post('/api/users/register', { ...userData });
      fail('Should have thrown error');
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });

  it('should reject registration without phone number', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'securepassword12',
      name: 'Test User',
    };

    try {
      await axios.post('/api/users/register', { ...userData });
      fail('Should have thrown error');
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe('Phone number is required.');
    }
  });

  it('should reject duplicate phone number registration', async () => {
    const userData = {
      email: 'test@example.com',
      phoneNumber: '1234567890',
      password: 'securepassword12',
      name: 'Test User',
    };

    // First registration should succeed
    await axios.post('/api/users/register', { ...userData });

    // Second registration with same phone number should fail
    try {
      await axios.post('/api/users/register', { ...userData });
      fail('Should have thrown error');
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe('Phone number already exists.');
    }
  });
});

describe('POST /api/users/confirm', () => {
  beforeEach(async () => {
    // Delete all users from the database
    const db = drizzle(process.env.DATABASE_URL);
    await db.delete(users).execute();
  });

  it('should confirm a user with valid token', async () => {
    const newUser = await axios.post('/api/users/register', {
      phoneNumber: '1234567890',
      password: 'securepassword12',
      name: 'Test User',
    });

    const res = await axios.get(`/api/users/confirm/${newUser.data.id}`);

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(newUser.data.id);
  });
});

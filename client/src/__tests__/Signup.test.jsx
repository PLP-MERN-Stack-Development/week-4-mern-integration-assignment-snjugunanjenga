import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import Signup from '../pages/Signup';
import { BrowserRouter } from 'react-router-dom';

const server = setupServer(
  rest.post('/api/auth/register', (req, res, ctx) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res(ctx.status(400), ctx.json({ errors: [{ msg: 'All fields required' }] }));
    }
    if (email === 'exists@example.com') {
      return res(ctx.status(400), ctx.json({ message: 'User already exists' }));
    }
    return res(ctx.status(200), ctx.json({ token: 'mocktoken' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderSignup = () => render(
  <BrowserRouter>
    <Signup />
  </BrowserRouter>
);

describe('Signup Page', () => {
  it('shows validation errors for empty fields', async () => {
    renderSignup();
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it('shows backend error if user exists', async () => {
    renderSignup();
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'exists@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByText(/user already exists/i)).toBeInTheDocument();
  });

  it('redirects on successful signup', async () => {
    renderSignup();
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() => {
      // Should redirect, so the signup form is no longer visible
      expect(screen.queryByText(/sign up/i)).not.toBeInTheDocument();
    });
  });
}); 
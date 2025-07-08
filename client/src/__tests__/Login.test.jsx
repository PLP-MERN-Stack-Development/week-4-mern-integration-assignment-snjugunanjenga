import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import Login from '../pages/Login';
import { BrowserRouter } from 'react-router-dom';

const server = setupServer(
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res(ctx.status(400), ctx.json({ message: 'Email and password are required' }));
    }
    if (email === 'fail@example.com') {
      return res(ctx.status(400), ctx.json({ message: 'Invalid credentials' }));
    }
    return res(ctx.status(200), ctx.json({ token: 'mocktoken' }));
  }),
  rest.get('/api/posts/mine/count', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ count: 1 }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderLogin = () => render(
  <BrowserRouter>
    <Login />
  </BrowserRouter>
);

describe('Login Page', () => {
  it('shows validation errors for empty fields', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it('shows backend error for invalid credentials', async () => {
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'fail@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('redirects on successful login', async () => {
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'success@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      // Should redirect, so the login form is no longer visible
      expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
    });
  });
}); 
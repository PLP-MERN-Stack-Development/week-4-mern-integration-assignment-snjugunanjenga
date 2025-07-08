import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import CreatePost from '../pages/CreatePost';
import { BrowserRouter } from 'react-router-dom';

beforeAll(() => {
  // Mock token for auth
  window.localStorage.setItem('token', 'mocktoken');
});
afterAll(() => {
  window.localStorage.clear();
});

const server = setupServer(
  rest.get('/api/categories', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([{ _id: '1', name: 'Tech' }]));
  }),
  rest.post('/api/posts', (req, res, ctx) => {
    const { title, content } = req.body;
    if (!title || !content) {
      return res(ctx.status(400), ctx.json({ errors: [{ msg: 'Title and content are required' }] }));
    }
    return res(ctx.status(201), ctx.json({ _id: 'postid', title, content }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderCreatePost = () => render(
  <BrowserRouter>
    <CreatePost />
  </BrowserRouter>
);

describe('CreatePost Page', () => {
  it('shows validation errors for empty fields', async () => {
    renderCreatePost();
    fireEvent.click(screen.getByRole('button', { name: /create post/i }));
    expect(await screen.findByText(/title and content are required/i)).toBeInTheDocument();
  });

  it('shows backend error for missing fields', async () => {
    renderCreatePost();
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/content/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /create post/i }));
    expect(await screen.findByText(/title and content are required/i)).toBeInTheDocument();
  });

  it('redirects on successful post creation', async () => {
    renderCreatePost();
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'My Post' } });
    fireEvent.change(screen.getByLabelText(/content/i), { target: { value: 'Some content' } });
    fireEvent.click(screen.getByRole('button', { name: /create post/i }));
    await waitFor(() => {
      // Should redirect, so the create post form is no longer visible
      expect(screen.queryByText(/create new post/i)).not.toBeInTheDocument();
    });
  });
}); 
import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import PostList from '../pages/PostList';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const server = setupServer(
  rest.get('/api/posts', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([
      { _id: '1', title: 'First Post', content: 'Hello world', author: { username: 'user1' }, category: { name: 'Tech' } }
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderPostList = (user = null) => render(
  <BrowserRouter>
    <AuthContext.Provider value={{ user }}>
      <PostList />
    </AuthContext.Provider>
  </BrowserRouter>
);

describe('PostList Page', () => {
  it('shows loading state', async () => {
    renderPostList();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => screen.getByText(/latest posts/i));
  });

  it('shows no posts message', async () => {
    server.use(
      rest.get('/api/posts', (req, res, ctx) => res(ctx.status(200), ctx.json([])))
    );
    renderPostList();
    expect(await screen.findByText(/no posts yet/i)).toBeInTheDocument();
  });

  it('shows posts', async () => {
    renderPostList();
    expect(await screen.findByText(/first post/i)).toBeInTheDocument();
    expect(screen.getByText(/read more/i)).toBeInTheDocument();
  });

  it('shows create button if user is logged in', async () => {
    renderPostList({ username: 'user1' });
    expect(await screen.findByText(/create your first post/i)).toBeInTheDocument();
  });

  it('shows login button if not logged in', async () => {
    renderPostList(null);
    expect(await screen.findByText(/login to create a post/i)).toBeInTheDocument();
  });
}); 
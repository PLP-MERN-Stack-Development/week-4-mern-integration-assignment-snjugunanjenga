// src/pages/Login.jsx - Login form
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../services/api';
import { toast } from 'sonner';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/auth/login', {
        email: data.email,
        password: data.password,
      });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        toast.success('Login successful!');
        navigate('/create', { state: { firstTime: true } });
      } else {
        setError('Invalid response from server');
        toast.error('Invalid response from server');
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map(e => e.msg).join(', '));
        toast.error('Please fix the highlighted errors.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
        toast.error('Login failed: ' + err.response.data.message);
      } else {
        setError('Login failed');
        toast.error('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
            placeholder="Email"
            type="email"
          />
          {errors.email && <span className="text-red-500">{errors.email.message}</span>}
        </div>
        <div>
          <Input
            type="password"
            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
            placeholder="Password"
          />
          {errors.password && <span className="text-red-500">{errors.password.message}</span>}
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <Button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
      </form>
      <div className="mt-4 text-center">
        <span>Don't have an account? </span>
        <a href="/signup" className="text-blue-600 hover:underline">Sign up</a>
      </div>
    </div>
  );
};

export default Login;
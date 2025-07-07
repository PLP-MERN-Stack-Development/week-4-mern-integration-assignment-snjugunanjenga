// src/pages/Signup.jsx - Signup form
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const Signup = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password,
      });
      if (res.data.token) {
        // Optionally, store token and redirect
        localStorage.setItem('token', res.data.token);
      navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            {...register('username', { required: 'Username is required' })}
            placeholder="Username"
          />
          {errors.username && <span className="text-red-500">{errors.username.message}</span>}
        </div>
        <div>
          <Input
            {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
            placeholder="Email"
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
        <Button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</Button>
      </form>
      <div className="mt-4 text-center">
        <span>Don't have an account? </span>
        <a href="/signup" className="text-blue-600 hover:underline">Sign up</a>
      </div>
    </div>
  );
};

export default Signup;
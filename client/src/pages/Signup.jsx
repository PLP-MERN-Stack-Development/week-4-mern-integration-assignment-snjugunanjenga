import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useContext(AuthContext);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setValidationErrors([]);
    try {
      await registerUser(data.username, data.email, data.password);
      toast.success('Registration successful!');
      navigate('/');
    } catch (err) {
      if (err.response?.data?.errors) {
        // Backend validation errors (array)
        setValidationErrors(err.response.data.errors.map(e => e.msg));
        toast.error('Please fix the highlighted errors.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
        toast.error('Registration failed: ' + err.response.data.message);
      } else {
        setError('Registration failed');
        toast.error('Registration failed');
      }
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
        {validationErrors.length > 0 && (
          <ul className="text-red-500 list-disc list-inside">
            {validationErrors.map((msg, idx) => <li key={idx}>{msg}</li>)}
          </ul>
        )}
        <Button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</Button>
      </form>
      <div className="mt-4 text-center">
        <span>Already have an account? </span>
        <a href="/login" className="text-blue-600 hover:underline">Log in</a>
      </div>
    </div>
  );
};

export default Signup;
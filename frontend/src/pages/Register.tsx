import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import React from 'react';
const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await api.post('/auth/register', { email, password });
      navigate('/login');
    } catch (err) {
      console.error('Register error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-2xl font-bold">Register</h2>
      <input
        type="email"
        placeholder="Email"
        className="border p-2 w-80"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 w-80"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        type="button"
        onClick={handleRegister}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Register
      </button>
      <p className="text-sm mt-2">
        Already have an account?{' '}
        <Link to="/login" className="text-green-600 underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { signup } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const mutation = useMutation({
    mutationFn: () => signup(form),
    onSuccess: (res) => {
      setUser(res.data.user);
      toast.success(`Welcome to Avoa, ${res.data.user.username}! 🎉`);
      navigate('/');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Signup failed'),
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="auth-page">
      {/* Visual side */}
      <motion.div
        className="auth-page__visual"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div style={{ position: 'absolute', width: 400, height: 400, background: '#6c63ff', top: -100, right: -80, borderRadius: '50%', filter: 'blur(80px)', opacity: 0.18 }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 24 }}>✈️</div>
          <h2>Join Avoa</h2>
          <p>Create an account to discover unique stays, host your own space, and connect with travellers worldwide.</p>
        </div>
      </motion.div>

      {/* Form side */}
      <motion.div
        className="auth-page__form"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="auth-form-box">
          <Link to="/" className="logo">Avoa</Link>
          <h2>Create account</h2>
          <p className="subtitle">It's free and takes less than a minute</p>

          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
            <div className="form-group">
              <label>Username</label>
              <input className="form-control" name="username" placeholder="choose_a_username" value={form.username} onChange={handleChange} autoFocus required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" name="password" type="password" placeholder="min. 6 characters" value={form.password} onChange={handleChange} minLength={6} required />
            </div>
            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={mutation.isPending} style={{ marginTop: 8 }}>
              {mutation.isPending ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

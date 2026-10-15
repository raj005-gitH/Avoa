import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });

  const mutation = useMutation({
    mutationFn: () => login(form),
    onSuccess: (res) => {
      setUser(res.data.user);
      toast.success(`Welcome back, ${res.data.user.username}!`);
      navigate('/');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Invalid credentials'),
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
        <div className="hero__blob" style={{ width: 400, height: 400, background: 'var(--brand)', top: -100, left: -100, position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.2 }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 24 }}>🏡</div>
          <h2>Welcome back</h2>
          <p>Log in to manage your listings and discover new stays around the world.</p>
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
          <h2>Sign in</h2>
          <p className="subtitle">Enter your credentials to continue</p>

          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
            <div className="form-group">
              <label>Username</label>
              <input className="form-control" name="username" placeholder="your_username" value={form.username} onChange={handleChange} autoFocus required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
            </div>
            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={mutation.isPending} style={{ marginTop: 8 }}>
              {mutation.isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

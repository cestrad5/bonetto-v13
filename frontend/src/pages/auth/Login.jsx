import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { loginWithGoogle, loginWithEmail } from '../../services/authService';
import { SET_LOGIN, SET_USER, SET_TOKEN, SET_LOADING, selectIsLoading } from '../../redux/features/authSlice';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector(selectIsLoading);

  const handleGoogleLogin = async () => {
    dispatch(SET_LOADING(true));
    try {
      const userData = await loginWithGoogle();
      dispatch(SET_USER(userData));
      dispatch(SET_TOKEN(userData.token));
      dispatch(SET_LOGIN(true));
      toast.success(`Bienvenido, ${userData.name}`);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Error al iniciar sesión con Google');
    } finally {
      dispatch(SET_LOADING(false));
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.warn('Completa todos los campos');
    
    dispatch(SET_LOADING(true));
    try {
      const userData = await loginWithEmail(email, password);
      dispatch(SET_USER(userData));
      dispatch(SET_TOKEN(userData.token));
      dispatch(SET_LOGIN(true));
      toast.success(`Bienvenido, ${userData.name}`);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Credenciales incorrectas');
    } finally {
      dispatch(SET_LOADING(false));
    }
  };

  return (
    <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '400px', textAlign: 'center', background: 'white', boxShadow: 'var(--shadow-lg)' }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.2rem', display: 'flex', justifyContent: 'center' }}>
            <img 
              src="/logo.png" 
              alt="Bonetto" 
              style={{ height: '54px', width: 'auto', objectFit: 'contain' }}
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
          <h2 style={{ marginTop: '0.5rem', fontWeight: '600', fontSize: '1rem', color: 'var(--text-main)' }}>Ventas v13 — Portal de Pedidos</h2>
          <p style={{ marginTop: '0.25rem', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>build: pine-wood-theme · v9</p>
        </div>

        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
          <button type="submit" disabled={isLoading} className="btn-primary" style={{ height: '48px' }}>
            <LogIn size={19} /> {isLoading ? 'Cargando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} /> o <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
        </div>

        <button 
          onClick={handleGoogleLogin} 
          disabled={isLoading} 
          className="btn-ghost" 
          style={{ width: '100%', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="Google" />
          Continuar con Google
        </button>
      </motion.div>
    </div>
  );
};

export default Login;

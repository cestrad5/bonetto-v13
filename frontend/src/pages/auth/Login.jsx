import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { loginWithGoogle, loginWithEmail } from '../../services/authService';
import { SET_LOGIN, SET_USER, SET_TOKEN, SET_LOADING, selectIsLoading } from '../../redux/features/authSlice';
import { LogIn, Mail } from 'lucide-react';

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
    <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            fontSize: '1.8rem', 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1px'
          }}>
            🎀 Bonetto
          </div>
          <h2 style={{ marginTop: '0.5rem', fontWeight: '300', fontSize: '1rem', color: '#94a3b8' }}>Ventas v13 — Portal de Pedidos</h2>
          <p style={{ marginTop: '0.25rem', fontSize: '0.65rem', color: '#334155', fontFamily: 'monospace' }}>build: pdf-proxy-images · PDF v7</p>
        </div>

        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
          />
          <button type="submit" disabled={isLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', fontWeight: '600' }}>
            <LogIn size={20} /> {isLoading ? 'Cargando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
          <hr style={{ flex: 1, border: '0.5px solid #334155' }} /> o <hr style={{ flex: 1, border: '0.5px solid #334155' }} />
        </div>

        <button onClick={handleGoogleLogin} disabled={isLoading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: '1px solid #334155', background: 'transparent' }}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="Google" />
          Continuar con Google
        </button>
      </motion.div>
    </div>
  );
};

export default Login;

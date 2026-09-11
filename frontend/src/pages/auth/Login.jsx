import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('expired') === '1') {
      toast.info('Tu sesión expiró. Volvé a iniciar sesión.');
    }
  }, []);

  // Antes cualquier error (red caída, popup cerrado, usuario inactivo en
  // nuestro backend) mostraba el mismo "Credenciales incorrectas" — el
  // usuario reintentaba la contraseña sin parar cuando el problema real era
  // otro (sin internet, cuenta deshabilitada, demasiados intentos).
  const describeAuthError = (error) => {
    const code = error?.code || '';
    if (code === 'auth/network-request-failed') return 'Sin conexión a internet. Revisa tu red e intenta de nuevo.';
    if (code === 'auth/too-many-requests') return 'Demasiados intentos fallidos. Espera unos minutos e intenta de nuevo.';
    if (code === 'auth/user-disabled') return 'Tu cuenta está deshabilitada. Contacta al administrador.';
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return null; // el usuario canceló, no es un error real
    if (code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-credential') return 'Credenciales incorrectas.';
    if (error?.response?.status === 401) return 'Tu usuario no está autorizado o está inactivo.';
    return 'No se pudo iniciar sesión. Intenta de nuevo.';
  };

  const handleGoogleLogin = async () => {
    dispatch(SET_LOADING(true));
    try {
      const userData = await loginWithGoogle();
      dispatch(SET_USER(userData));
      dispatch(SET_TOKEN(userData.token));
      dispatch(SET_LOGIN(true));
      toast.success(`Bienvenido, ${userData.name}`);
      const target = userData.role?.trim().toLowerCase() === 'cliente' ? '/catalog' : '/dashboard';
      navigate(target);
    } catch (error) {
      const message = describeAuthError(error);
      if (message) toast.error(message);
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
      const target = userData.role === 'Cliente' ? '/catalog' : '/dashboard';
      navigate(target);
    } catch (error) {
      toast.error(describeAuthError(error));
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
        </div>

        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label htmlFor="login-email" className="sr-only">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
          <label htmlFor="login-password" className="sr-only">Contraseña</label>
          <input
            id="login-password"
            type="password"
            placeholder="Contraseña"
            autoComplete="current-password"
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

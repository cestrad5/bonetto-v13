import { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { auth } from './services/firebase'
import { onIdTokenChanged } from 'firebase/auth'
import { getProfile } from './services/api'
import { syncPendingOrders } from './services/offlineOrders'
import {
  SET_LOGIN,
  SET_USER,
  SET_TOKEN,
  SET_LOADING,
  selectIsLoggedIn,
  selectIsLoading
} from './redux/features/authSlice'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { WifiOff } from 'lucide-react'

// Layout & Pages
import Layout   from './components/layout/Layout'
import Login    from './pages/auth/Login'
import Catalog  from './pages/catalog/Catalog'
import Cart     from './pages/catalog/Cart'
import Orders   from './pages/orders/Orders'
// Dashboard y Admin quedan fuera del chunk principal: Dashboard no lo ve el
// rol Cliente y Admin solo lo ve el rol Admin, así que no vale la pena que
// todos los descarguen en el arranque.
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const Admin     = lazy(() => import('./pages/admin/Admin'))

const PageFallback = () => (
  <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
    <p style={{ fontSize: '1.5rem' }}>⏳</p>
    <p>Cargando...</p>
  </div>
)

function App() {
  const dispatch    = useDispatch()
  const isLoggedIn  = useSelector(selectIsLoggedIn)
  const isLoading   = useSelector(selectIsLoading)
  const user        = useSelector(state => state.auth.user)
  const isOnline    = useOnlineStatus()

  // registerType 'prompt': el SW nuevo queda esperando en vez de tomar
  // control solo (skipWaiting/clientsClaim a mitad de sesión rompía la
  // pantalla si el HTML viejo pedía chunks que ya no existen). Acá se avisa
  // y el usuario decide cuándo recargar.
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('SW registration error:', error)
    },
  })

  useEffect(() => {
    if (needRefresh) {
      toast.info(
        ({ closeToast }) => (
          <div>
            <p style={{ margin: '0 0 8px' }}>Hay una nueva versión disponible.</p>
            <button
              onClick={() => { updateServiceWorker(true); closeToast() }}
              className="btn-primary"
              style={{ width: 'auto', padding: '6px 14px', height: 'auto', fontSize: '0.82rem' }}
            >
              Actualizar ahora
            </button>
          </div>
        ),
        { autoClose: false, closeOnClick: false }
      )
    }
  }, [needRefresh, updateServiceWorker])

  useEffect(() => {
    if (offlineReady) {
      toast.success('App lista para funcionar sin conexión 📴')
      setOfflineReady(false)
    }
  }, [offlineReady, setOfflineReady])

  useEffect(() => {
    dispatch(SET_LOADING(true))
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token   = await firebaseUser.getIdToken()
          localStorage.setItem('token', token)
          const profile = await getProfile()
          dispatch(SET_USER({ ...profile, uid: firebaseUser.uid }))
          dispatch(SET_TOKEN(token))
          dispatch(SET_LOGIN(true))
        } catch (error) {
          console.error('Session persistence error:', error)
        }
      } else {
        dispatch(SET_LOGIN(false))
        dispatch(SET_USER(null))
        localStorage.removeItem('token')
      }
      dispatch(SET_LOADING(false))
    })
    return () => unsubscribe()
  }, [dispatch])

  useEffect(() => {
    syncPendingOrders()
    window.addEventListener('online', syncPendingOrders)
    return () => window.removeEventListener('online', syncPendingOrders)
  }, [])

  const isAdmin = user?.role === 'Admin'

  // Mientras no sepamos si hay sesión (primer chequeo de Firebase), no
  // evaluamos rutas: antes esto mandaba a /login por una fracción de
  // segundo aunque la sesión fuera válida.
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '10px', color: 'var(--text-muted, #6e6e73)' }}>
        <p style={{ fontSize: '1.8rem', margin: 0 }}>⏳</p>
        <p style={{ margin: 0 }}>Cargando...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
        toastStyle={{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}
      />

      {/* Indicador de conexión: antes un fetch fallido por falta de red y un
          fallo real del servidor mostraban el mismo toast genérico. */}
      {!isOnline && (
        <div
          role="status"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000,
            background: 'var(--amber, #f59e0b)', color: '#fff',
            fontSize: '0.8rem', fontWeight: '600',
            padding: '6px 12px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px',
          }}
        >
          <WifiOff size={14} aria-hidden="true" /> Sin conexión — trabajando offline
        </div>
      )}

      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={!isLoggedIn ? <div style={{ padding: '2rem' }}><Login /></div> : <Navigate to="/dashboard" />}
        />

        {/* Protected */}
        <Route path="/dashboard" element={isLoggedIn ? <Layout><Suspense fallback={<PageFallback />}><Dashboard /></Suspense></Layout> : <Navigate to="/login" />} />
        <Route path="/catalog"   element={isLoggedIn ? <Layout><Catalog /></Layout>   : <Navigate to="/login" />} />
        <Route path="/cart"      element={isLoggedIn ? <Layout><Cart /></Layout>      : <Navigate to="/login" />} />
        <Route path="/orders"    element={isLoggedIn ? <Layout><Orders /></Layout>    : <Navigate to="/login" />} />

        {/* Admin only */}
        <Route
          path="/admin"
          element={
            !isLoggedIn ? <Navigate to="/login" /> :
            isAdmin     ? <Layout><Suspense fallback={<PageFallback />}><Admin /></Suspense></Layout> :
            <Navigate to="/dashboard" />
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

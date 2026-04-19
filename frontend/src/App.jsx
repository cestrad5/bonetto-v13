import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { auth } from './services/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { getProfile } from './services/api'
import { 
  SET_LOGIN, 
  SET_USER, 
  SET_TOKEN, 
  SET_LOADING, 
  selectIsLoggedIn 
} from './redux/features/authSlice'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Layout & Pages
import Layout from './components/layout/Layout'
import Login from './pages/auth/Login'
import Catalog from './pages/catalog/Catalog'
import Cart from './pages/catalog/Cart'

const Dashboard = () => <div className="glass-card"><h1>Panel de Control</h1><p>Bienvenido al sistema v13.</p></div>
const Orders = () => <div className="glass-card"><h1>Mis Pedidos</h1><p>Aquí aparecerá el historial.</p></div>

function App() {
  const dispatch = useDispatch()
  const isLoggedIn = useSelector(selectIsLoggedIn)

  useEffect(() => {
    dispatch(SET_LOADING(true))
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken()
          localStorage.setItem('token', token)
          
          const profile = await getProfile()
          dispatch(SET_USER({ ...profile, uid: user.uid }))
          dispatch(SET_TOKEN(token))
          dispatch(SET_LOGIN(true))
        } catch (error) {
          console.error("Session persistence error:", error)
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

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      
      <Routes>
        <Route 
          path="/login" 
          element={!isLoggedIn ? <div style={{ padding: '2rem' }}><Login /></div> : <Navigate to="/dashboard" />} 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={isLoggedIn ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/catalog" 
          element={isLoggedIn ? <Layout><Catalog /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/cart" 
          element={isLoggedIn ? <Layout><Cart /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/orders" 
          element={isLoggedIn ? <Layout><Orders /></Layout> : <Navigate to="/login" />} 
        />
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

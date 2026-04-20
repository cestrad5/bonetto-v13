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
import Layout   from './components/layout/Layout'
import Login    from './pages/auth/Login'
import Catalog  from './pages/catalog/Catalog'
import Cart     from './pages/catalog/Cart'
import Dashboard from './pages/dashboard/Dashboard'
import Orders   from './pages/orders/Orders'
import Admin    from './pages/admin/Admin'

function App() {
  const dispatch    = useDispatch()
  const isLoggedIn  = useSelector(selectIsLoggedIn)
  const user        = useSelector(state => state.auth.user)

  useEffect(() => {
    dispatch(SET_LOADING(true))
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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

  const isAdmin = user?.role === 'Admin'

  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
        toastStyle={{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}
      />

      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={!isLoggedIn ? <div style={{ padding: '2rem' }}><Login /></div> : <Navigate to="/dashboard" />}
        />

        {/* Protected */}
        <Route path="/dashboard" element={isLoggedIn ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
        <Route path="/catalog"   element={isLoggedIn ? <Layout><Catalog /></Layout>   : <Navigate to="/login" />} />
        <Route path="/cart"      element={isLoggedIn ? <Layout><Cart /></Layout>      : <Navigate to="/login" />} />
        <Route path="/orders"    element={isLoggedIn ? <Layout><Orders /></Layout>    : <Navigate to="/login" />} />

        {/* Admin only */}
        <Route
          path="/admin"
          element={
            !isLoggedIn ? <Navigate to="/login" /> :
            isAdmin     ? <Layout><Admin /></Layout> :
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

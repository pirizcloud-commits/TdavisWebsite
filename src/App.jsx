import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import Policy from './pages/Policy'
import { CartProvider } from './lib/CartContext'
import CartDrawer from './components/CartDrawer'

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="site-wrapper">
          <Header />
          <CartDrawer />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:handle" element={<ProductDetails />} />
            <Route path="/policies/:type" element={<Policy />} />
          </Routes>
          <Footer />
        </div>
      </CartProvider>
    </Router>
  )
}

export default App


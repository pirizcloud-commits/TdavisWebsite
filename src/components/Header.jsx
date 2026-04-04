import { useState } from 'react';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../lib/CartContext';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { toggleCart, totalQuantity } = useCart();

    return (
        <header className="site-header">
            {/* Main Nav */}
            <nav className="container main-nav">
                <div className="nav-actions">
                    <Link to="/" className="logo-container" style={{ textDecoration: 'none' }}>
                        <img src="/dazzling_designz_logo_lettering_cropped.png" alt="Dazzling Designs Logo" className="logo-img" />
                    </Link>
                </div>

                <div className="nav-actions">
                    <div className="nav-links desktop-only">
                        <Link to="/" className="nav-link">Shop All</Link>
                        <Link to="/" className="nav-link">New Arrivals</Link>
                        <Link to="/about" className="nav-link">About</Link>
                        <Link to="/" className="nav-link">Customs</Link>
                    </div>

                    <div className="search-bar">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search designs..."
                            className="search-input"
                            onChange={(e) => navigate(`/?search=${e.target.value}`)}
                        />
                    </div>

                    <button className="icon-btn" onClick={toggleCart}>
                        <ShoppingBag size={24} />
                        {totalQuantity > 0 && <span className="badge">{totalQuantity}</span>}
                    </button>

                    <button
                        className="icon-btn mobile-only"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Navigation Overlay */}
            {isMobileMenuOpen && (
                <div className="mobile-menu-overlay animate-fade">
                    <nav className="mobile-nav-links">
                        <Link to="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Shop All</Link>
                        <Link to="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>New Arrivals</Link>
                        <Link to="/about" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                        <Link to="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Customs</Link>
                    </nav>
                </div>
            )}
        </header>
    );
}

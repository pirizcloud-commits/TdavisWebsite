import { useState } from 'react';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="site-header">
            {/* Main Nav */}
            <nav className="container main-nav">
                <div className="nav-actions">
                    <div className="logo-container">
                        <div className="logo-text">
                            <span className="logo-script">Dazzling</span>
                            <span className="logo-caps">DESIGNS</span>
                        </div>
                    </div>
                </div>

                <div className="nav-actions">
                    <div className="nav-links desktop-only">
                        <a href="#" className="nav-link">Shop All</a>
                        <a href="#" className="nav-link">New Arrivals</a>
                        <a href="#" className="nav-link">Customs</a>
                    </div>

                    <div className="search-bar">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search designs..."
                            className="search-input"
                        />
                    </div>

                    <button className="icon-btn">
                        <ShoppingBag size={24} />
                        <span className="badge">0</span>
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
                        <a href="#" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Shop All</a>
                        <a href="#" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>New Arrivals</a>
                        <a href="#" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Customs</a>
                    </nav>
                </div>
            )}
        </header>
    );
}

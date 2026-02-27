import { useState } from 'react';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="site-header">
            {/* Main Nav */}
            <nav className="container main-nav">
                <div className="nav-actions" style={{ gap: '48px' }}>
                    <div className="logo-container">
                        <img src="/logo_no_bg.png" alt="Elegant Designs Logo" className="logo-img" />
                    </div>

                    <div className="nav-links" style={{ display: 'none' }}>
                        {/* hidden for brevity or mobile */}
                    </div>
                    <div className="nav-links desktop-only" style={{ display: 'flex' }}>
                        <a href="#" className="nav-link">Shop All</a>
                        <a href="#" className="nav-link">New Arrivals</a>
                        <a href="#" className="nav-link">Customs</a>
                    </div>
                </div>

                <div className="nav-actions">
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
        </header>
    );
}

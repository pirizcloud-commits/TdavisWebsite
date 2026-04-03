import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <Link to="/" className="footer-logo-container" style={{ textDecoration: 'none', display: 'block', overflow: 'hidden', width: '140px', height: '160px', borderRadius: '8px' }}>
                            <img src="/dazzling_designz_logo_full.jpeg" alt="Dazzling Designs Logo" className="footer-logo-img" style={{ objectFit: 'cover', objectPosition: 'top', width: '100%', height: '115%', display: 'block', margin: 0 }} />
                        </Link>
                        <p className="footer-desc">
                            Premium custom jewelry and luxury timepieces. Handcrafted for those who demand the finest quality.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-heading">CUSTOMER CARE</h4>
                        <div className="footer-links">
                            <Link to="/policies/shipping" className="footer-link">Shipping Policy</Link>
                            <Link to="/policies/returns" className="footer-link">Return Policy</Link>
                            <Link to="/policies/terms" className="footer-link">Terms of Service</Link>
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-heading">STAY CONNECTED</h4>
                        <div className="footer-links">
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-link">Instagram</a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-link">Facebook</a>
                            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="footer-link">TikTok</a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    © {new Date().getFullYear()} DAZZLING DESIGNS. ALL RIGHTS RESERVED. POWERED BY HEADLESS SHOPIFY.
                </div>
            </div>
        </footer>
    );
}

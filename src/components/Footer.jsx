import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <Link to="/" className="footer-logo-container" style={{ textDecoration: 'none', display: 'block', overflow: 'hidden', width: '180px', height: '210px', borderRadius: '8px', margin: '0 auto 20px auto' }}>
                            <img src="/dazzling_designz_logo_full.jpeg" alt="Dazzling Designs Logo" className="footer-logo-img" style={{ objectFit: 'cover', objectPosition: 'top', width: '100%', height: '108%', display: 'block', margin: 0 }} />
                        </Link>
                        <p className="footer-desc" style={{ textAlign: 'center', margin: '0 auto' }}>
                            Premium custom jewelry and luxury timepieces. Handcrafted for those who demand the finest quality.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-heading">CUSTOMER CARE</h4>
                        <div className="footer-links">
                            <Link to="/jewelry-care" className="footer-link">Jewelry Care & Instructions</Link>
                            <Link to="/policies/sales-and-shipping" className="footer-link">Sales & Shipping Policy</Link>
                            <Link to="/policies/terms" className="footer-link">Terms of Service</Link>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>Phone: 910-236-9362</p>
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-heading">STAY CONNECTED</h4>
                        <div className="footer-links">
                            <a href="https://www.instagram.com/dazzlingdesignz_bytd/" target="_blank" rel="noopener noreferrer" className="footer-link">Instagram</a>
                            <a href="https://www.tiktok.com/@dazzlingdesignz_bytd?_r=1&_t=ZP-95K9ULrg0Ni" target="_blank" rel="noopener noreferrer" className="footer-link">TikTok</a>
                            <a href="https://www.facebook.com/share/18iZBCT77N/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="footer-link">Facebook</a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    © {new Date().getFullYear()} DAZZLING DESIGNZ. ALL RIGHTS RESERVED. POWERED BY GOCLEARWEB.
                </div>
            </div>
        </footer>
    );
}

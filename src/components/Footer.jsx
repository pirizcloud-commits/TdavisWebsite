export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <div className="footer-logo-container">
                            <img src="/logo_no_bg.png" alt="Dazzling Designs Logo" className="footer-logo-img" />
                        </div>
                        <p className="footer-desc">
                            Premium custom jewelry and luxury timepieces. Handcrafted for those who demand the finest quality.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-heading">CUSTOMER CARE</h4>
                        <div className="footer-links">
                            <a href="#" className="footer-link">Shipping Policy</a>
                            <a href="#" className="footer-link">Return Policy</a>
                            <a href="#" className="footer-link">Terms of Service</a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-heading">STAY CONNECTED</h4>
                        <div className="footer-links">
                            <a href="#" className="footer-link">Instagram</a>
                            <a href="#" className="footer-link">Facebook</a>
                            <a href="#" className="footer-link">TikTok</a>
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

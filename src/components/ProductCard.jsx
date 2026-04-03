import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
    return (
        <Link to={`/product/${product.handle}`} className="product-card animate-fade" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="product-image-wrap">
                <img
                    src={product.image}
                    alt={product.title}
                    className="product-image"
                />
                {product.onSale && (
                    <div className="sale-badge">SALE</div>
                )}
            </div>

            <div className="product-info">
                <h3 className="product-title">{product.title}</h3>
                <p className="product-price">${product.price}</p>
            </div>
        </Link>
    );
}

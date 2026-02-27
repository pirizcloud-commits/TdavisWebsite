export default function ProductCard({ product }) {
    return (
        <div className="product-card animate-fade">
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
        </div>
    );
}

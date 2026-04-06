import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductCard({ product }) {
    const scrollContainerRef = useRef(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const images = product.images || (product.image ? [product.image] : []);

    const handleScroll = (e) => {
        const scrollLeft = e.target.scrollLeft;
        const width = e.target.offsetWidth;
        const index = Math.round(scrollLeft / width);
        setCurrentImageIndex(index);
    };

    const scrollToPrev = (e) => {
        e.preventDefault();
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -scrollContainerRef.current.offsetWidth, behavior: 'smooth' });
        }
    };

    const scrollToNext = (e) => {
        e.preventDefault();
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: scrollContainerRef.current.offsetWidth, behavior: 'smooth' });
        }
    };

    return (
        <div className="product-card animate-fade" style={{ display: 'block' }}>
            <div 
                className="product-image-wrap" 
                style={{ position: 'relative' }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    style={{ 
                        display: 'flex', 
                        overflowX: 'auto', 
                        scrollSnapType: 'x mandatory', 
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none' 
                    }} 
                >
                    <style>{`
                        .product-image-wrap > div::-webkit-scrollbar { display: none; }
                    `}</style>
                    {images.map((img, idx) => (
                        <Link to={`/product/${product.handle}`} key={idx} style={{ flex: '0 0 100%', scrollSnapAlign: 'start', textDecoration: 'none', display: 'block', position: 'relative' }}>
                            <img src={img} alt={`${product.title} view ${idx + 1}`} className="product-image" style={{ width: '100%', display: 'block' }} />
                        </Link>
                    ))}
                </div>
                
                {product.onSale && (
                    <div className="sale-badge">SALE</div>
                )}

                {images.length > 1 && (
                    <>
                        <button 
                            onClick={scrollToPrev}
                            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', border: 'none', color: 'white', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease', zIndex: 2, pointerEvents: isHovered ? 'auto' : 'none' }}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button 
                            onClick={scrollToNext}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', border: 'none', color: 'white', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s ease', zIndex: 2, pointerEvents: isHovered ? 'auto' : 'none' }}
                        >
                            <ChevronRight size={18} />
                        </button>

                        <div style={{ position: 'absolute', bottom: '15px', left: '0', width: '100%', display: 'flex', justifyContent: 'center', gap: '6px', pointerEvents: 'none', zIndex: 2 }}>
                            {images.map((_, i) => (
                                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === currentImageIndex ? 'white' : 'rgba(255,255,255,0.4)', transition: 'background 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <Link to={`/product/${product.handle}`} className="product-info" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <h3 className="product-title">{product.title}</h3>
                <p className="product-price">${product.price}</p>
            </Link>
        </div>
    );
}

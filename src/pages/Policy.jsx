import { useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { getBreadcrumbSchema } from '../lib/jsonld';

export default function Policy() {
    const { type } = useParams();

    const policyContent = {
        'sales-and-shipping': {
            title: "Sales & Shipping Policy",
            content: (
                <>
                    <p style={{ marginBottom: '16px' }}><strong>Please read carefully before placing an order.</strong></p>
                    
                    <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--text-primary)' }}>All Sales Final</h3>
                    <p style={{ marginBottom: '16px' }}>All purchases are final. We do not offer refunds, returns, or exchanges under any circumstances.</p>
                    
                    <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--text-primary)' }}>Shipping & Delivery</h3>
                    <p style={{ marginBottom: '16px' }}>Once your order has shipped and a shipping confirmation has been provided, any delivery delays are the responsibility of the postal carrier. We are not responsible for delays, lost packages, or stolen items after shipment has been confirmed.</p>
                    
                    <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--text-primary)' }}>Address Responsibility</h3>
                    <p style={{ marginBottom: '16px' }}>It is the buyer’s responsibility to ensure that the shipping address is correct at the time of purchase. Any address updates after shipment must be handled directly with the postal service. We are not responsible for orders shipped to an incorrect address provided by the buyer.</p>
                    
                    <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--text-primary)' }}>Payment & Chargebacks</h3>
                    <p style={{ marginBottom: '16px' }}>Any unauthorized charge disputes or chargebacks on fulfilled orders may result in permanent loss of purchasing privileges. Order records, shipping confirmations, and proof of fulfillment will be provided to payment processors when applicable.</p>
                    
                    <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--text-primary)' }}>Accepted Payment Methods</h3>
                    <p style={{ marginBottom: '16px' }}>We are only responsible for payments made through official payment methods provided directly by our business. Payments sent through unapproved or third-party methods are made at the buyer’s own risk.</p>
                    
                    <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--text-primary)' }}>Right to Refuse Service</h3>
                    <p style={{ marginBottom: '16px' }}>We reserve the right to refuse service to anyone at any time, for any reason, without notice.</p>
                    
                    <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--text-primary)' }}>Repairs</h3>
                    <p style={{ marginBottom: '8px' }}>Repairs are assessed on an individual basis.</p>
                    <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
                        <li style={{ marginBottom: '8px' }}>The buyer is responsible for shipping the item to our facility.</li>
                        <li>We will cover the cost of shipping the repaired item back to the buyer.</li>
                    </ul>
                </>
            )
        },
        terms: {
            title: "Terms of Service",
            content: "By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement. Welcome to Dazzling Designz."
        }
    };

    const currentPolicy = policyContent[type] || {
        title: "Policy Not Found",
        content: "The requested policy page does not exist."
    };

    const isPolicyFound = !!policyContent[type];
    const jsonLd = isPolicyFound ? [
        getBreadcrumbSchema([
            { name: "Home", url: "https://dazzlingdesignzllc.com/" },
            { name: currentPolicy.title, url: `https://dazzlingdesignzllc.com/policies/${type}` }
        ])
    ] : [];

    return (
        <main className="page-container" style={{ padding: '80px 0' }}>
            <SEO 
                title={currentPolicy.title} 
                description={`Read our ${currentPolicy.title.toLowerCase()} to understand our guidelines and procedures at Dazzling Designz.`}
                canonicalUrl={`https://dazzlingdesignzllc.com/policies/${type}`}
                jsonLd={jsonLd}
            />
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '900', fontStyle: 'italic', marginBottom: '32px' }}>
                {currentPolicy.title}
            </h1>
            <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)', fontSize: '16px' }}>
                {currentPolicy.content}
            </div>
            </div>
        </main>
    )
}

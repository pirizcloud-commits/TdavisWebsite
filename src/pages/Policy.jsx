import { useParams } from 'react-router-dom';

export default function Policy() {
    const { type } = useParams();

    const policyContent = {
        shipping: {
            title: "Shipping Policy",
            content: "We process all orders within 2-3 business days. You will receive a shipment confirmation email once your order has shipped containing your tracking number(s). Thank you for shopping with Dazzling Designs!"
        },
        returns: {
            title: "Return Policy",
            content: "We accept returns within 30 days of receipt. Items must be unused and in original condition. Please contact our support team to initiate a return or exchange."
        },
        terms: {
            title: "Terms of Service",
            content: "By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement. Welcome to Dazzling Designs."
        }
    };

    const currentPolicy = policyContent[type] || {
        title: "Policy Not Found",
        content: "The requested policy page does not exist."
    };

    return (
        <main className="container" style={{ padding: '100px 40px', minHeight: '60vh', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '900', fontStyle: 'italic', marginBottom: '32px' }}>
                {currentPolicy.title}
            </h1>
            <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)', fontSize: '16px' }}>
                {currentPolicy.content}
            </div>
        </main>
    )
}

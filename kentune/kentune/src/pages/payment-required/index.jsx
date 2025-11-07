
import { useLocation } from 'react-router-dom';
import MpesaPaymentForm from '../../components/MpesaPaymentForm';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PaymentRequired = () => {
  const query = useQuery();
  const amount = query.get('amount') || '';
  const isAmountReadOnly = !!amount;

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(120deg, #fff 60%, #e6ffe6 100%)',
      animation: 'gradientMove 6s ease-in-out infinite alternate'
    }}>
      {/* Geometric shapes for creativity */}
      <svg style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none'
      }} viewBox="0 0 1440 900" fill="none">
        <circle cx="1320" cy="80" r="60" fill="#00b14f22" />
        <rect x="60" y="800" width="120" height="36" rx="18" fill="#009e3a22" />
        <circle cx="120" cy="120" r="36" fill="#009e3a11" />
      </svg>
      <div id="payment-form-container" style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '64px' }}>
        <MpesaPaymentForm selectedAmount={amount} isAmountReadOnly={isAmountReadOnly} />
      </div>
      <img
        src="/assets/partners/footer_image"
        alt="Footer"
        style={{
          position: 'fixed',
          left: 0,
          bottom: 0,
          width: '100vw',
          height: '48px',
          maxHeight: '8vw',
          objectFit: 'contain',
          zIndex: 2,
          pointerEvents: 'none',
          opacity: 0.85
        }}
      />
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        @media (max-width: 600px) {
          #payment-form-container {
            margin-bottom: 80px !important;
          }
          img[alt='Footer'] {
            height: 32px !important;
            max-height: 12vw !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentRequired;

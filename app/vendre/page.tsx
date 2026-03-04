export default function VentaPage() {
  return (
    <div style={{
      backgroundColor: '#000',
      color: '#fff',
      height: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      margin: 0,
      padding: 0
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .container-anim { animation: fadeInScale 1s ease-out forwards; }
        .price-highlight { 
          color: #00ff88; 
          font-size: 3.5rem; 
          font-weight: bold; 
          margin: 20px 0;
          text-shadow: 0 0 15px rgba(0, 255, 136, 0.4);
        }
      `}} />
      
      <div className="container-anim" style={{ textAlign: 'center', padding: '20px' }}>
        <h1 style={{ fontSize: '2.2rem', letterSpacing: '2px', fontWeight: '800' }}>
          TEMPLATE E-COMMERCE À VENDRE
        </h1>
        
        <div style={{ marginTop: '15px', color: '#ccc', lineHeight: '1.8' }}>
          <p style={{ margin: '5px 0' }}>• Système Professionnel Node.js</p>
          <p style={{ margin: '5px 0' }}>• Base de Données intégrée</p>
          <p style={{ margin: '5px 0', color: '#00ff88' }}>• Panel d'administration personnalisé</p>
        </div>
        
        <div className="price-highlight">500 USD</div>
        
        <p style={{ marginBottom: '35px', fontSize: '1rem', color: '#888' }}>
          Contact: <span style={{ color: '#fff' }}>asia.hoceima@gmail.com</span>
        </p>
        
        <a href="mailto:asia.hoceima@gmail.com" style={{
          border: 'none',
          padding: '18px 40px',
          color: '#000',
          backgroundColor: '#fff',
          textDecoration: 'none',
          borderRadius: '50px',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          letterSpacing: '1px',
          transition: 'transform 0.2s ease'
        }}>
          CONTACTER POUR ACHETER
        </a>
      </div>
    </div>
  );
}
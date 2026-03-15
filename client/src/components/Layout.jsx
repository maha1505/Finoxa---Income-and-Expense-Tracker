import TopNavbar from './TopNavbar';


const Layout = ({ children }) => {
    return (
        <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <TopNavbar />
            <main style={{
                flex: 1,
                padding: window.innerWidth < 768 ? '15px' : '20px',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                overflowX: 'hidden' // Prevent horizontal scroll on mobile
            }}>
                {children}
            </main>

        </div>
    );
};

export default Layout;

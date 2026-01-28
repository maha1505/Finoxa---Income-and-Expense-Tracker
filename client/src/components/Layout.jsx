import TopNavbar from './TopNavbar';


const Layout = ({ children }) => {
    return (
        <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <TopNavbar />
            <main style={{
                flex: 1,
                padding: '20px',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%'
            }}>
                {children}
            </main>

        </div>
    );
};

export default Layout;

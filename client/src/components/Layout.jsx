import TopNavbar from './TopNavbar';
import Chatbot from './Chatbot';

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
            <Chatbot />
        </div>
    );
};

export default Layout;

import { Link, useLocation } from 'react-router-dom';
import { FaChartPie, FaExchangeAlt, FaChartBar, FaSignOutAlt } from 'react-icons/fa';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { logout } = useContext(AuthContext);

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: <FaChartPie /> },
        { path: '/transactions', label: 'Transactions', icon: <FaExchangeAlt /> },
        { path: '/reports', label: 'Reports', icon: <FaChartBar /> },
    ];

    return (
        <aside style={{
            width: '250px',
            height: '100vh',
            backgroundColor: '#f9fafb', // Light gray background like image
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #e5e7eb',
            position: 'fixed',
            left: 0,
            top: 0
        }}>
            <div style={{ marginBottom: '40px', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--primary-color)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>F</div>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Finoxa</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '10px', paddingLeft: '10px' }}>Navigation</div>
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            padding: '12px 15px',
                            borderRadius: '8px',
                            color: location.pathname === item.path ? 'var(--text-primary)' : '#9ca3af',
                            fontWeight: location.pathname === item.path ? '600' : '500',
                            backgroundColor: location.pathname === item.path ? '#ffffff' : 'transparent',
                            boxShadow: location.pathname === item.path ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s',
                            textDecoration: 'none'
                        }}
                    >
                        <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </div>

            <button
                onClick={logout}
                style={{
                    marginTop: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '12px 15px',
                    borderRadius: '8px',
                    color: '#ef4444',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500
                }}
            >
                <FaSignOutAlt style={{ fontSize: '1.2rem' }} />
                Logout
            </button>
        </aside>
    );
};

export default Sidebar;

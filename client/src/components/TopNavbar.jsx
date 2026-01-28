import { Link, useLocation } from 'react-router-dom';
import { FaChartPie, FaPlusCircle, FaBars, FaChartBar, FaSignOutAlt, FaUserCircle, FaWallet, FaHome } from 'react-icons/fa';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

const TopNavbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    useEffect(() => {
        // Ensure the theme is set to light on load and persist it
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }, []);

    return (
        <nav style={{
            height: '70px',
            background: 'var(--card-bg)', // Updated to use variable
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 30px',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: '35px',
                    height: '35px',
                    background: 'var(--primary-color)', // Uses new Dark Teal
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.2rem'
                }}>F</div>
                <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>Finoxa</span>
            </div>

            {/* Navigation Icons (Centered or Right) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                <Link to="/" style={{ color: location.pathname === '/' ? 'var(--primary-color)' : 'var(--text-secondary)', fontSize: '1.2rem' }}>
                    <FaHome />
                </Link>
                <Link to="/transactions" style={{ color: location.pathname === '/transactions' ? 'var(--primary-color)' : 'var(--text-secondary)', fontSize: '1.2rem' }}>
                    {/* Simulating the "Timeline" or "List" view */}
                    <FaBars />
                </Link>
                <Link to="/reports" style={{ color: location.pathname === '/reports' ? 'var(--primary-color)' : 'var(--text-secondary)', fontSize: '1.2rem' }}>
                    <FaChartBar />
                </Link>
                <Link to="/budgets" style={{ color: location.pathname === '/budgets' ? 'var(--primary-color)' : 'var(--text-secondary)', fontSize: '1.2rem' }}>
                    <FaWallet />
                </Link>
                <Link to="/analytics" style={{ color: location.pathname === '/analytics' ? 'var(--primary-color)' : 'var(--text-secondary)', fontSize: '1.2rem' }}>
                    <FaChartPie />
                </Link>
            </div>

            {/* Right Side: Add Expense & Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Placeholder for Add Modal Trigger if we move it here, though Dashboard has button too */}
                {/* Profile / Logout */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?.name || 'User'}</span>
                    <FaUserCircle style={{ fontSize: '1.8rem', color: 'var(--text-secondary)' }} />
                    <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <FaSignOutAlt />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default TopNavbar;

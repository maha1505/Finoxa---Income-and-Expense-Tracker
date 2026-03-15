import { Link, useLocation } from 'react-router-dom';
import { FaChartPie, FaPlusCircle, FaBars, FaChartBar, FaSignOutAlt, FaUserCircle, FaWallet, FaHome, FaTimes } from 'react-icons/fa';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const TopNavbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        // Ensure the theme is set to light on load and persist it
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }, []);

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    return (
        <nav style={{
            height: '70px',
            background: 'var(--card-bg)',
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
                    background: 'var(--primary-color)',
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

            {/* Mobile Toggle */}
            <button
                className="nav-mobile-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle navigation"
            >
                {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Collapsible Actions (Nav Links + Profile) */}
            <div className={`navbar-actions ${isMenuOpen ? 'open' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexDirection: 'inherit', width: 'inherit' }}>
                    <Link to="/" style={{ color: location.pathname === '/' ? 'var(--primary-color)' : 'var(--text-secondary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <FaHome /> <span className="nav-label">Dashboard</span>
                    </Link>
                    <Link to="/transactions" style={{ color: location.pathname === '/transactions' ? 'var(--primary-color)' : 'var(--text-secondary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <FaBars /> <span className="nav-label">Transactions</span>
                    </Link>
                    <Link to="/reports" style={{ color: location.pathname === '/reports' ? 'var(--primary-color)' : 'var(--text-secondary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <FaChartBar /> <span className="nav-label">Reports</span>
                    </Link>
                    <Link to="/budgets" style={{ color: location.pathname === '/budgets' ? 'var(--primary-color)' : 'var(--text-secondary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <FaWallet /> <span className="nav-label">Budgets</span>
                    </Link>
                    <Link to="/analytics" style={{ color: location.pathname === '/analytics' ? 'var(--primary-color)' : 'var(--text-secondary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <FaChartPie /> <span className="nav-label">Analytics</span>
                    </Link>
                </div>

                {/* Profile / Logout */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: 'inherit' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?.name || 'User'}</span>
                    <FaUserCircle style={{ fontSize: '1.8rem', color: 'var(--text-secondary)' }} />
                    <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaSignOutAlt /> <span className="nav-label">Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default TopNavbar;

import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{ background: 'white', padding: '15px 0', borderBottom: '1px solid #e5e7eb' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    ExpenseTracker
                </Link>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <Link to="/" style={{ fontWeight: 500 }}>Dashboard</Link>
                            <Link to="/transactions" style={{ fontWeight: 500 }}>Transactions</Link>
                            <Link to="/reports" style={{ fontWeight: 500 }}>Reports</Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Hello, {user.name}</span>
                                <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '5px 15px', fontSize: '0.9rem' }}>
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <Link to="/login" className="btn btn-primary">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

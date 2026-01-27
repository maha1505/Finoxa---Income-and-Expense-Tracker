import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const { login, register, googleLogin } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const { name, email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(name, email, password);
            }
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            await googleLogin(credentialResponse.credential);
            navigate('/');
        } catch (err) {
            setError('Google Login Failed');
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'row' }}>
            {/* Left Side - Illustration/Branding */}
            <div style={{
                flex: 1,
                backgroundColor: '#f3f4f6',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px',
                borderRight: '1px solid #e5e7eb'
            }}>
                <div style={{ marginBottom: '30px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'var(--primary-color)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '3rem'
                    }}>F</div>
                </div>
                <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '10px' }}>Finoxa</h1>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', textAlign: 'center' }}>Start Tracking Smarter.</h2>
                <p style={{ color: '#6b7280', textAlign: 'center', maxWidth: '400px', lineHeight: '1.6' }}>
                    Take control of your money with AI-powered insights. Track expenses, set budgets, and get real-time financial advice — all in one place.
                </p>

                {/* Visual Placeholder for Illustration */}
                <div style={{
                    marginTop: '40px',
                    width: '300px',
                    height: '200px',
                    background: '#e0e7ff',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818cf8'
                }}>
                    <span style={{ fontSize: '5rem' }}>📊</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px',
                backgroundColor: 'white'
            }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'var(--primary-color)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.5rem',
                            margin: '0 auto 10px auto'
                        }}>F</div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                            {isLogin ? 'Welcome back to Finoxa' : 'Join Finoxa Today'}
                        </h2>
                    </div>

                    {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

                    <form onSubmit={onSubmit}>
                        {!isLogin && (
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input type="text" name="name" value={name} onChange={onChange} className="form-input" required={!isLogin} placeholder="John Doe" />
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input type="email" name="email" value={email} onChange={onChange} className="form-input" required placeholder="user@example.com" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input type="password" name="password" value={password} onChange={onChange} className="form-input" required placeholder="••••••••" />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', padding: '12px' }}>
                            {isLogin ? 'LOGIN' : 'CREATE ACCOUNT'}
                        </button>
                    </form>

                    <div style={{ margin: '20px 0', textAlign: 'center', color: '#9ca3af', position: 'relative' }}>
                        <span style={{ background: 'white', padding: '0 10px', position: 'relative', zIndex: 1 }}>OR</span>
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#e5e7eb', zIndex: 0 }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Login Failed')}
                            width="400"
                        />
                    </div>

                    <p style={{ marginTop: '30px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span
                            style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 600 }}
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        >
                            {isLogin ? 'Sign up' : 'Login'}
                        </span>
                    </p>

                    <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>
                        Your data is encrypted and never shared without your consent.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

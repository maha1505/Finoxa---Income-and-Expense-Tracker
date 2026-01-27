import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaTimes } from 'react-icons/fa';
import api from '../api/axios';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm Finoxa AI. Ask me about your spending.", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        const question = input.toLowerCase();
        setInput('');

        // Simulate AI Logic (Simple Rule Engine for now, usually backend or LLM)
        setTimeout(async () => {
            let botText = "I'm still learning. Try asking 'How much did I spend on food?' or 'What is my balance?'";

            try {
                // Fetch latest data context (In real app, backend would process this)
                const res = await api.get('/transactions');
                const transactions = res.data;

                if (question.includes('spent') || question.includes('expense')) {
                    // Extract category?
                    const categories = ['groceries', 'food', 'rent', 'travel', 'shopping'];
                    const foundCat = categories.find(c => question.includes(c));

                    if (foundCat) {
                        const total = transactions
                            .filter(t => t.type === 'expense' && (t.category.toLowerCase().includes(foundCat) || (foundCat === 'food' && (t.category === 'dining' || t.category === 'groceries'))))
                            .reduce((acc, t) => acc + t.amount, 0);
                        botText = `You have spent ₹${total} on ${foundCat} total.`;
                    } else if (question.includes('month')) {
                        const currentMonth = new Date().getMonth();
                        const total = transactions
                            .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth)
                            .reduce((acc, t) => acc + t.amount, 0);
                        botText = `You spent ₹${total} this month.`;
                    }
                } else if (question.includes('balance')) {
                    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
                    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
                    botText = `Your current balance is ₹${income - expense}.`;
                }
            } catch (err) {
                console.error(err);
                botText = "Sorry, I couldn't check your data right now.";
            }

            setMessages(prev => [...prev, { text: botText, sender: 'bot' }]);
        }, 1000);
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed', bottom: '30px', right: '30px',
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: 'var(--primary-color)', color: 'white',
                    border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}
            >
                {isOpen ? <FaTimes size={24} /> : <FaRobot size={30} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: 'fixed', bottom: '100px', right: '30px',
                    width: '350px', height: '500px', background: 'white',
                    borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1000,
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{ padding: '15px', background: 'var(--primary-color)', color: 'white', fontWeight: 'bold' }}>
                        Finoxa AI
                    </div>

                    <div style={{ flex: 1, padding: '15px', overflowY: 'auto', background: '#f9fafb' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                marginBottom: '10px'
                            }}>
                                <div style={{
                                    maxWidth: '80%', padding: '10px 15px', borderRadius: '15px',
                                    background: msg.sender === 'user' ? '#3b82f6' : 'white',
                                    color: msg.sender === 'user' ? 'white' : 'black',
                                    border: msg.sender === 'user' ? 'none' : '1px solid #e5e7eb',
                                    borderBottomRightRadius: msg.sender === 'user' ? '2px' : '15px',
                                    borderBottomLeftRadius: msg.sender === 'bot' ? '2px' : '15px',
                                    fontSize: '0.9rem'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{ padding: '10px', borderTop: '1px solid #e5e7eb', display: 'flex' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #d1d5db', outline: 'none' }}
                        />
                        <button
                            onClick={handleSend}
                            style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}
                        >
                            <FaPaperPlane size={20} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Save, Mail } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { user, userProfile, updateUserProfile } = useAuth();
    const navigate = useNavigate();
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        if (userProfile) {
            setMobile(userProfile.mobile || '');
            setAddress(userProfile.address || '');
        }
    }, [user, userProfile, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!mobile || !address) {
            setMessage('Please fill in both mobile number and address.');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        setSaving(true);
        setMessage('');

        try {
            await updateUserProfile({ mobile, address });
            setMessage('Profile saved successfully! Redirecting to shop...');

            // Redirect to shop after 1 second
            setTimeout(() => {
                navigate('/shop');
            }, 1000);
        } catch (error) {
            setMessage('Failed to update profile. Please try again.');
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="profile-page">
            <div className="container profile-container">
                <h1 className="section-title">Complete Your Profile</h1>
                <p className="section-subtitle">
                    Add your contact details to place enquiries for 3D printed products
                </p>

                <div className="profile-grid">
                    {/* User Info Card */}
                    <div className="profile-card user-info-card">
                        <div className="user-icon-display">
                            <User size={48} />
                        </div>
                        <h2>{user.displayName}</h2>
                        <div className="user-detail">
                            <Mail size={16} />
                            <span>{user.email}</span>
                        </div>
                        <div className="account-badge">Google Account</div>
                    </div>

                    {/* Contact Info Form */}
                    <div className="profile-card">
                        <h3 className="card-title">Contact Information</h3>
                        <p className="card-description">
                            This information will be included in your enquiry messages on WhatsApp.
                        </p>

                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-group">
                                <label htmlFor="mobile">
                                    <Phone size={18} />
                                    Mobile Number *
                                </label>
                                <input
                                    type="tel"
                                    id="mobile"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="Enter your 10-digit mobile number"
                                    pattern="[0-9]{10}"
                                    title="Please enter a valid 10-digit mobile number"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="address">
                                    <MapPin size={18} />
                                    Delivery Address *
                                </label>
                                <textarea
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Enter your complete delivery address (House No, Street, City, State, PIN)"
                                    rows="4"
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                <Save size={18} />
                                {saving ? 'Saving...' : 'Save & Continue'}
                            </button>

                            {message && (
                                <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                                    {message}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

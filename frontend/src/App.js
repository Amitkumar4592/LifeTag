import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'patient' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/signup`, { ...formData, role: 'patient' });
      alert('Signup successful! Please login.');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <div style={styles.logoBadge}>
            <div style={styles.logoIcon}></div>
          </div>
        </div>
        <h2 style={styles.title}>Create an account</h2>
        <p style={styles.subtitle}>Join LifeTag as a Patient.</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <input 
              style={styles.input} 
              type="text" 
              placeholder="Enter your name" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>
          <div style={styles.inputGroup}>
            <input 
              style={styles.input} 
              type="email" 
              placeholder="Enter your email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              required 
            />
          </div>
          <div style={styles.inputGroup}>
            <input 
              style={styles.input} 
              type="password" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              required 
            />
          </div>
          
          <button style={styles.primaryButton} type="submit">Sign up</button>
          
          <button type="button" style={styles.googleButton} onClick={() => alert('Google Sign-in is a prototype placeholder')}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={styles.googleIcon} />
            Sign up with Google
          </button>
        </form>
        
        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

const Login = ({ setAuth }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('name', res.data.name);
      setAuth({ token: res.data.token, role: res.data.role, name: res.data.name });
      navigate('/home');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <div style={styles.logoBadge}>
            <div style={styles.logoIcon}></div>
          </div>
        </div>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>Please enter your details.</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <input 
              style={styles.input} 
              type="email" 
              placeholder="Enter your email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              required 
            />
          </div>
          <div style={styles.inputGroup}>
            <input 
              style={styles.input} 
              type="password" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              required 
            />
          </div>
          
          <div style={styles.optionsRow}>
            <label style={styles.rememberMe}>
              <input type="checkbox" style={styles.checkbox} />
              Remember for 30 days
            </label>
            <span style={styles.forgotPassword}>Forgot password</span>
          </div>
          
          <button style={styles.primaryButton} type="submit">Sign in</button>
          
          <button type="button" style={styles.googleButton} onClick={() => alert('Google Sign-in is a prototype placeholder')}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={styles.googleIcon} />
            Sign in with Google
          </button>
        </form>
        
        <p style={styles.footerText}>
          Don't have an account? <Link to="/signup" style={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

const Home = ({ auth }) => {
  if (!auth.token) return <Navigate to="/login" />;

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.dashboardCard}>
        <div style={styles.headerRow}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{auth.name[0]}</div>
            <div>
              <h2 style={styles.welcomeTitle}>Welcome, {auth.name}</h2>
              <p style={styles.roleBadge}>{auth.role.toUpperCase()}</p>
            </div>
          </div>
          <button style={styles.logoutButton} onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>Logout</button>
        </div>

        {auth.role === 'admin' ? (
          <div style={styles.adminSection}>
            <h3 style={styles.sectionTitle}>System Overview</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Total Users</span>
                <span style={styles.statValue}>128</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Records on Chain</span>
                <span style={styles.statValue}>45</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>IPFS Storage</span>
                <span style={styles.statValue}>1.2 GB</span>
              </div>
            </div>
            <div style={styles.actionGrid}>
              <Link to="/scan-nfc" style={styles.actionCard}>
                <div style={styles.actionIcon}>📡</div>
                <h3 style={styles.actionTitle}>NFC Emergency Scan</h3>
                <p style={styles.actionDescription}>Scan a LifeTag to retrieve data</p>
              </Link>
              <div style={{...styles.actionCard, cursor: 'default', opacity: 0.7}}>
                <div style={styles.actionIcon}>👥</div>
                <h3 style={styles.actionTitle}>User Management</h3>
                <p style={styles.actionDescription}>Manage doctors and patient access</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.actionGrid}>
            {auth.role === 'patient' ? (
              <Link to="/manage-record" style={styles.actionCard}>
                <div style={styles.actionIcon}>🏥</div>
                <h3 style={styles.actionTitle}>Manage My Health Record</h3>
                <p style={styles.actionDescription}>Update your medical info and health reports</p>
              </Link>
            ) : (
              <Link to="/scan-nfc" style={styles.actionCard}>
                <div style={styles.actionIcon}>📡</div>
                <h3 style={styles.actionTitle}>NFC Emergency Scan</h3>
                <p style={styles.actionDescription}>Scan a LifeTag to retrieve life-saving data</p>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ManageRecord = ({ auth }) => {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ bloodGroup: '', medicalDetails: '' });
  const [file, setFile] = useState(null);

  const fetchMyRecord = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/patient/my-record`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setRecord(res.data);
    } catch (err) {
      console.log("No record found yet");
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    fetchMyRecord();
  }, [fetchMyRecord]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('bloodGroup', formData.bloodGroup);
    data.append('medicalDetails', formData.medicalDetails);
    if (file) data.append('pdf', file);

    try {
      const res = await axios.post(`${API_URL}/patient/record`, data, {
        headers: { 
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert(`Record updated! Unique ID: ${res.data.uniqueId}`);
      setFile(null); 
      if (res.data.record) {
        setRecord(res.data.record);
      } else {
        fetchMyRecord();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Update failed');
    }
  };

  if (loading) return <div style={styles.dashboardContainer}>Loading...</div>;

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.dashboardCard}>
        <div style={styles.backNav}>
          <Link to="/home" style={styles.link}>← Back to Home</Link>
        </div>
        <h2 style={styles.title}>Manage Health Record</h2>
        
        {record && (
          <div style={styles.infoBox}>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <label style={styles.label}>Unique NFC ID</label>
                <div style={styles.idValue}>{record.uniqueId}</div>
              </div>
              <div style={styles.infoItem}>
                <label style={styles.label}>Blood Group</label>
                <div style={styles.value}><span style={styles.bloodBadgeSmall}>{record.bloodGroup}</span></div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.label}>Medical Details</label>
              <div style={styles.value}>{record.medicalDetails}</div>
            </div>
            {record.pdfPath && (
              <a href={`https://gateway.pinata.cloud/ipfs/${record.pdfPath}`} target="_blank" rel="noreferrer" style={styles.pdfLink}>
                📄 View Uploaded PDF (IPFS)
              </a>
            )}
            <p style={styles.timestamp}>Last Updated: {new Date(record.uploadedAt).toLocaleString()}</p>
          </div>
        )}

        <div style={styles.formSection}>
          <h3 style={styles.sectionTitle}>{record ? 'Update Information' : 'Create Record'}</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Blood Group</label>
              <input 
                style={styles.input} 
                type="text" 
                placeholder="e.g. O+" 
                value={formData.bloodGroup} 
                onChange={e => setFormData({...formData, bloodGroup: e.target.value})} 
                required 
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Critical Medical Details</label>
              <textarea 
                style={{...styles.input, minHeight: '100px', resize: 'vertical'}} 
                placeholder="Allergies, chronic conditions, etc." 
                value={formData.medicalDetails} 
                onChange={e => setFormData({...formData, medicalDetails: e.target.value})} 
                required 
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Upload Medical Report (PDF)</label>
              <div style={styles.fileUploadContainer}>
                <input 
                  style={styles.fileInput} 
                  type="file" 
                  accept=".pdf" 
                  onChange={e => setFile(e.target.files[0])} 
                />
              </div>
            </div>
            <button style={styles.primaryButton} type="submit">Save Health Record</button>
          </form>
        </div>
      </div>
    </div>
  );
};

const ScanNFC = ({ auth }) => {
  const [uniqueId, setUniqueId] = useState('');
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/health/${uniqueId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setData(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'No record found for this ID');
      setData(null);
    }
  };

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.dashboardCard}>
        <div style={styles.backNav}>
          <Link to="/home" style={styles.link}>← Back to Home</Link>
        </div>
        <h2 style={styles.title}>NFC Emergency Scan</h2>
        <p style={styles.subtitle}>Enter the ID manually to simulate an NFC tag scan.</p>
        
        <div style={styles.searchBox}>
          <input 
            style={styles.input}
            type="text" 
            placeholder="Enter Unique ID" 
            value={uniqueId} 
            onChange={e => setUniqueId(e.target.value)} 
          />
          <button style={styles.scanButton} onClick={fetchData}>Scan Tag</button>
        </div>
        
        {data && (
          <div style={styles.emergencyCard}>
            <div style={styles.emergencyHeader}>
              <span style={styles.emergencyIcon}>⚠️</span>
              <h3 style={styles.emergencyTitle}>EMERGENCY INFO</h3>
            </div>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <label style={styles.label}>Patient Name</label>
                <div style={styles.value}>{data.patientName}</div>
              </div>
              <div style={styles.infoItem}>
                <label style={styles.label}>Blood Group</label>
                <div style={styles.value}><span style={styles.bloodBadge}>{data.bloodGroup}</span></div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.label}>Critical Medical Details</label>
              <div style={{...styles.value, color: '#B42318', fontWeight: '600'}}>{data.medicalDetails}</div>
            </div>
            {data.pdfUrl && (
              <a href={data.pdfUrl} target="_blank" rel="noreferrer" style={styles.emergencyPdfLink}>
                📄 VIEW FULL MEDICAL REPORT (PDF)
              </a>
            )}
            <p style={styles.timestamp}>Record as of: {new Date(data.lastUpdate).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    name: localStorage.getItem('name')
  });

  return (
    <Router>
      <div className="App" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
        <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #EAECF0', padding: '16px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={styles.logoBadgeSmall}>
               <div style={styles.logoIconSmall}></div>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#101828', margin: 0 }}>LifeTag</h1>
          </div>
        </header>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login setAuth={setAuth} />} />
          <Route path="/home" element={<Home auth={auth} />} />
          <Route path="/manage-record" element={<ManageRecord auth={auth} />} />
          <Route path="/scan-nfc" element={<ScanNFC auth={auth} />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;

const styles = {
  // Authentication Styles
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    backgroundColor: 'transparent',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    padding: '40px',
    borderRadius: '12px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
    textAlign: 'center',
    border: '1px solid #f0f0f0',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  logoBadge: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #eee',
  },
  logoIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#7F56D9',
    boxShadow: '0 0 10px #7F56D9',
  },
  logoBadgeSmall: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
    border: '1px solid #eee',
  },
  logoIconSmall: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#7F56D9',
  },
  title: {
    fontSize: '30px',
    fontWeight: '600',
    color: '#101828',
    marginBottom: '12px',
    marginTop: '0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#667085',
    marginBottom: '32px',
  },
  form: {
    textAlign: 'left',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #D0D5DD',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    fontSize: '14px',
  },
  rememberMe: {
    display: 'flex',
    alignItems: 'center',
    color: '#344054',
    cursor: 'pointer',
  },
  checkbox: {
    marginRight: '8px',
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  forgotPassword: {
    color: '#6941C6',
    fontWeight: '600',
    cursor: 'pointer',
  },
  primaryButton: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#7F56D9',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '16px',
    transition: 'background-color 0.2s',
  },
  googleButton: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#344054',
    backgroundColor: '#fff',
    border: '1px solid #D0D5DD',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
  },
  googleIcon: {
    width: '20px',
    height: '20px',
  },
  footerText: {
    fontSize: '14px',
    color: '#667085',
  },
  link: {
    color: '#6941C6',
    textDecoration: 'none',
    fontWeight: '600',
  },

  // Dashboard Styles
  dashboardContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '80vh',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  dashboardCard: {
    width: '100%',
    maxWidth: '800px',
    padding: '32px',
    borderRadius: '16px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    border: '1px solid #EAECF0',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    paddingBottom: '20px',
    borderBottom: '1px solid #EAECF0',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    textAlign: 'left',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#F4EBFF',
    color: '#7F56D9',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '20px',
    fontWeight: '600',
  },
  welcomeTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#101828',
    margin: '0',
  },
  roleBadge: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6941C6',
    backgroundColor: '#F9F5FF',
    padding: '2px 8px',
    borderRadius: '12px',
    margin: '4px 0 0 0',
    display: 'inline-block',
  },
  logoutButton: {
    padding: '8px 14px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#344054',
    backgroundColor: '#fff',
    border: '1px solid #D0D5DD',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  adminSection: {
    textAlign: 'left',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    padding: '20px',
    backgroundColor: '#F9FAFB',
    borderRadius: '12px',
    border: '1px solid #EAECF0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#667085',
    fontWeight: '500',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#101828',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  actionCard: {
    display: 'block',
    padding: '32px',
    borderRadius: '16px',
    border: '1px solid #EAECF0',
    textDecoration: 'none',
    textAlign: 'left',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    backgroundColor: '#fff',
  },
  actionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#101828',
    margin: '0 0 8px 0',
  },
  actionDescription: {
    fontSize: '14px',
    color: '#667085',
    margin: 0,
  },
  actionIcon: {
    fontSize: '32px',
    marginBottom: '20px',
  },
  backNav: {
    textAlign: 'left',
    marginBottom: '24px',
  },
  infoBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '32px',
    textAlign: 'left',
    border: '1px solid #EAECF0',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '20px',
  },
  infoItem: {
    marginBottom: '16px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#667085',
    marginBottom: '8px',
  },
  idValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#7F56D9',
    fontFamily: 'monospace',
    letterSpacing: '1px',
  },
  value: {
    fontSize: '16px',
    color: '#101828',
    fontWeight: '500',
  },
  pdfLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#6941C6',
    fontWeight: '600',
    textDecoration: 'none',
    marginTop: '12px',
    fontSize: '14px',
  },
  timestamp: {
    fontSize: '12px',
    color: '#98A2B3',
    margin: '20px 0 0 0',
  },
  formSection: {
    textAlign: 'left',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#101828',
    marginBottom: '24px',
  },
  fileUploadContainer: {
    border: '1px dashed #D0D5DD',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: '#F9FAFB',
  },
  fileInput: {
    width: '100%',
    cursor: 'pointer',
  },
  searchBox: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
  },
  scanButton: {
    padding: '12px 28px',
    backgroundColor: '#7F56D9',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  emergencyCard: {
    border: '2px solid #FDA29B',
    borderRadius: '20px',
    backgroundColor: '#FEF3F2',
    padding: '32px',
    textAlign: 'left',
    boxShadow: '0 4px 12px rgba(217, 45, 32, 0.05)',
  },
  emergencyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '28px',
  },
  emergencyIcon: {
    fontSize: '32px',
  },
  emergencyTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#B42318',
    margin: '0',
    letterSpacing: '0.5px',
  },
  bloodBadge: {
    backgroundColor: '#FEE4E2',
    color: '#B42318',
    padding: '6px 16px',
    borderRadius: '20px',
    fontWeight: '800',
    fontSize: '18px',
  },
  bloodBadgeSmall: {
    backgroundColor: '#FEE4E2',
    color: '#B42318',
    padding: '4px 12px',
    borderRadius: '12px',
    fontWeight: '700',
  },
  emergencyPdfLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    backgroundColor: '#D92D20',
    color: '#fff',
    padding: '16px',
    borderRadius: '12px',
    textAlign: 'center',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '16px',
    marginTop: '28px',
    transition: 'background-color 0.2s',
  }
};

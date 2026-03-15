const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { ethers } = require('ethers');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const User = require('./models/User');
const HealthRecord = require('./models/HealthRecord');
const { encrypt, decrypt } = require('./utils/crypto');
const { signupSchema, loginSchema, recordSchema } = require('./utils/validators');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDFs are allowed'));
  }
});

// Middleware for Auth
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};

// Blockchain Setup
const abi = [
    "function issueCertificate(string studentName, string course, string issuedDate, string ipfsHash, address receiver, string verificationCode) public returns (uint256)",
    "function getCertificate(uint256 certificateId) public view returns (string studentName, string course, string issuedDate, string ipfsHash, address issuer, address receiver, string verificationCode)",
    "function getCertificateIdByCode(string verificationCode) public view returns (uint256)"
];

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

// --- Auth APIs ---

app.post('/api/signup', async (req, res) => {
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, email, password, role } = value;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = value;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET);
    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Health Data APIs ---

app.post('/api/patient/record', authenticate, upload.single('pdf'), async (req, res) => {
  let localFilePath = req.file?.path;
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ error: 'Forbidden' });
    
    const { error, value } = recordSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { bloodGroup, medicalDetails } = value;
    const existingRecord = await HealthRecord.findOne({ user: req.user.id });
    let ipfsHash = existingRecord ? existingRecord.pdfPath : null;

    if (req.file) {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(req.file.path));

      const pinataResponse = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        maxBodyLength: 'Infinity',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY
        }
      });
      ipfsHash = pinataResponse.data.IpfsHash;
    }

    const uniqueId = existingRecord ? existingRecord.uniqueId : uuidv4().slice(0, 8).toUpperCase();
    
    // Encrypt sensitive data before saving
    const encryptedDetails = encrypt(medicalDetails);
    const encryptedBloodGroup = encrypt(bloodGroup);

    const record = await HealthRecord.findOneAndUpdate(
      { user: req.user.id },
      {
        uniqueId,
        patientName: req.user.name,
        bloodGroup: encryptedBloodGroup,
        medicalDetails: encryptedDetails,
        pdfPath: ipfsHash,
        uploadedAt: new Date()
      },
      { new: true, upsert: true }
    );

    // Background blockchain sync (don't wait for response)
    const syncBlockchain = async () => {
      try {
        const tx = await contract.issueCertificate(
          encrypt(req.user.name), // Encrypt name on chain
          encryptedBloodGroup,
          new Date().toLocaleDateString(),
          encrypt(ipfsHash || "N/A"), // Encrypt IPFS link on chain
          wallet.address,
          uniqueId
        );
        await tx.wait();
        console.log(`Blockchain sync successful for ${uniqueId}`);
      } catch (bcErr) {
        console.error("Blockchain sync failed:", bcErr.message);
      }
    };
    syncBlockchain();

    res.json({ message: 'Record updated successfully', uniqueId, record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }
});

app.get('/api/patient/my-record', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ error: 'Forbidden' });
    const record = await HealthRecord.findOne({ user: req.user.id });
    if (!record) return res.status(404).json({ error: 'No record found' });
    
    // Decrypt data for the user
    res.json({
      ...record._doc,
      bloodGroup: decrypt(record.bloodGroup),
      medicalDetails: decrypt(record.medicalDetails)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health/:uniqueId', authenticate, authorize(['doctor', 'admin']), async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const record = await HealthRecord.findOne({ uniqueId });
    if (!record) return res.status(404).json({ error: 'No health data found' });

    const getIpfsUrl = (path) => {
      if (!path) return null;
      const cid = path.includes('/') ? path.split('/').pop() : path;
      return `https://gateway.pinata.cloud/ipfs/${cid}`;
    };

    res.json({
      patientName: record.patientName,
      bloodGroup: decrypt(record.bloodGroup),
      medicalDetails: decrypt(record.medicalDetails),
      pdfUrl: getIpfsUrl(record.pdfPath),
      lastUpdate: record.uploadedAt,
      uniqueId: record.uniqueId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

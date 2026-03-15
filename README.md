# LifeTag Prototype

A minimal working prototype for an NFC-based emergency health information system using Node.js, Express, React, and Blockchain.

## Project Structure
- `backend/`: Node.js/Express server (API)
- `frontend/`: React application (UI)
- `blockchain/`: Existing smart contracts (Hardhat)

## Prerequisites
- Node.js & npm installed
- MongoDB running locally (`mongodb://localhost:27017/lifetag_minimal`)
- A local blockchain running (e.g., `npx hardhat node` inside `blockchain/`)

## Setup Instructions

### 1. Blockchain Setup
1. Navigate to the `blockchain/` folder.
2. If not already done, install dependencies: `npm install`.
3. Start a local node: `npx hardhat node`.
4. In a new terminal, deploy the contract: `npx hardhat run scripts/deploy.js --network localhost`.
5. **Note the deployed contract address** and update it in `backend/.env` if it differs from the default.

### 2. Backend Setup
1. Navigate to the `backend/` folder.
2. Create/verify `.env` file (already provided in the root of `backend/`).
3. Start the server: `node index.js`.
   - The server runs on `http://localhost:5000`.

### 3. Frontend Setup
1. Navigate to the `frontend/` folder.
2. Start the React app: `npm start`.
   - The app runs on `http://localhost:3000`.

## How to Test
1. **Signup/Login**: Create an account (Patient, Doctor, or Admin).
2. **Update Health Data (Doctor/Admin)**:
   - Log in as a Doctor or Admin.
   - Go to "Update Health Data".
   - Enter details and a "Unique ID" (simulating the NFC tag UID).
   - This transaction will be recorded on the local blockchain.
3. **Retrieve Health Data**:
   - Go to "Health Data Lookup".
   - Enter the same "Unique ID".
   - The system fetches the record directly from the blockchain via the backend.

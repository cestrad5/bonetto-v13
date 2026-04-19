import admin from 'firebase-admin';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let serviceAccount;
try {
  const filePath = process.env.GOOGLE_SERVICE_ACCOUNT_FILE;
  if (!filePath) throw new Error('GOOGLE_SERVICE_ACCOUNT_FILE environment variable is not set');
  
  serviceAccount = JSON.parse(
    fs.readFileSync(filePath, 'utf8')
  );
  console.log('✅ Firebase Service Account loaded successfully');
} catch (error) {
  console.error('❌ FATAL: Could not load Firebase Service Account:', error.message);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const verifyToken = async (token) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    throw error;
  }
};

export default admin;

import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_FILE,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * Fetches data from a specific sheet/tab.
 * @param {string} range - The range in 'SheetName!A:Z' format.
 */
export const getSheetData = async (range) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });
    return response.data.values;
  } catch (error) {
    console.error(`Error fetching sheet data (${range}):`, error);
    throw error;
  }
};

/**
 * Maps sheet rows to an array of objects based on headers.
 * @param {Array} rows - Rows from Google Sheets (first row is header).
 */
export const mapRowsToObjects = (rows) => {
  if (!rows || rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
};

/**
 * Appends a row to a sheet.
 * @param {string} range - Sheet name or range.
 * @param {Array} values - Array of values to append.
 */
export const appendSheetData = async (range, values) => {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });
  } catch (error) {
    console.error(`Error appending sheet data (${range}):`, error);
    throw error;
  }
};

export default {
  getSheetData,
  mapRowsToObjects,
  appendSheetData,
};

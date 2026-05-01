import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1yTp-53mSv89l3LALHDlYevqeYk2AqhwUc8CiCBEN7ss';

const getAuthClient = () => {
  const clientEmail = (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').trim();
  let privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').trim();
  if (!clientEmail || !privateKey) return null;
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.slice(1, -1);
  privateKey = privateKey.replace(/\\n/g, '\n');
  return new google.auth.JWT({ email: clientEmail, key: privateKey, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
};

const parseSheetNumber = (val: any) => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  return parseFloat(val.toString().trim().replace(/[$\s]/g, '').replace(/,/g, '').replace(/\((.*)\)/, '-$1')) || 0;
};

export async function GET() {
  try {
    const auth = getAuthClient();
    if (!auth) return Response.json({ error: 'Auth failed' }, { status: 500 });
    const sheets = google.sheets('v4');
    const response = await sheets.spreadsheets.values.get({ auth, spreadsheetId: SHEET_ID, range: "'MASTER_DATA'!A2:AN" });
    const rows = response.data.values || [];
    const products = rows.map((row: any[], index: number) => ({
      id: `${row[0] || `r${index}`}-${index}`, originalId: row[0] || '', name: row[9] || '', category: row[10] || '', sellPriceMxn: parseSheetNumber(row[17])
    }));
    return Response.json(products);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
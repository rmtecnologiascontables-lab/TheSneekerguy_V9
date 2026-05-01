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

export async function GET() {
  try {
    const auth = getAuthClient();
    if (!auth) return Response.json({ error: 'Auth failed' }, { status: 500 });
    const sheets = google.sheets('v4');
    const response = await sheets.spreadsheets.values.get({ auth, spreadsheetId: SHEET_ID, range: "'CLIENTES'!A2:L" });
    const rows = response.data.values || [];
    const customers = rows.map((row: any[], index: number) => ({ id: row[0] || `c-${index}`, name: row[1] || '', email: row[2] || '', phone: row[3] || '' }));
    return Response.json(customers);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
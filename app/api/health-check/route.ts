import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1yTp-53mSv89l3LALHDlYevqeYk2AqhwUc8CiCBEN7ss';

const getAuthClient = () => {
  const clientEmail = (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').trim();
  let privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').trim();
  if (!clientEmail || !privateKey) return null;
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.slice(1, -1);
  privateKey = privateKey.replace(/\\n/g, '\n');
  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

export async function GET() {
  try {
    const clientEmail = (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').trim();
    const auth = getAuthClient();
    if (!auth) return Response.json({ status: 'error', message: 'Faltan credenciales' }, { status: 401 });
    const sheets = google.sheets('v4');
    const doc = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID, auth });
    return Response.json({ status: 'ok', title: doc.data.properties?.title || 'Sheets' });
  } catch (error: any) {
    return Response.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
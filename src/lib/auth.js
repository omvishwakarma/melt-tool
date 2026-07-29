import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export function requireAdmin(request) {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return { error: NextResponse.json({ error: 'Admin login required' }, { status: 401 }) };
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'melt-poc-secret');
    if (payload.role !== 'admin') {
      return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
    }
    return { payload };
  } catch {
    return { error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) };
  }
}

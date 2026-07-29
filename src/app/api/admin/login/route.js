import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { password } = await request.json();
    if (password !== (process.env.ADMIN_PASSWORD || 'melt-admin-2026')) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'melt-poc-secret', {
      expiresIn: '12h',
    });

    return NextResponse.json({ token });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

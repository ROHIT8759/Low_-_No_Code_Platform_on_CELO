import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFResponse, refreshCSRFToken } from '@/lib/middleware/csrf';

export async function GET(request: NextRequest) {
  return generateCSRFResponse();
}

export async function POST(request: NextRequest) {
  return refreshCSRFToken(request);
}

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'EVM deployment is not supported. Use /api/deploy/stellar instead.',
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      endpoint: '/api/deploy/evm',
      status: 'deprecated',
      message: 'EVM deployment has been removed. Use /api/deploy/stellar instead.',
    },
    { status: 200 }
  );
}

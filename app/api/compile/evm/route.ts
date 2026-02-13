import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'EVM compilation is no longer supported. This platform is now Stellar-only.',
      code: 'DEPRECATED',
      migrationGuide: 'Use /api/compile with rustCode for Stellar/Soroban contracts',
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      endpoint: '/api/compile/evm',
      status: 'deprecated',
      message: 'EVM compilation has been removed. Use /api/compile for Stellar contracts.',
    },
    { status: 200 }
  );
}

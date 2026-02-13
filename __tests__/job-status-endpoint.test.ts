import { GET } from '@/app/api/jobs/[jobId]/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/queue', () => ({
  getJobStatus: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { getJobStatus } from '@/lib/queue';
import { supabase } from '@/lib/supabase';

describe('Job Status Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 400 if job ID is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/jobs/');
    const params = { params: { jobId: '' } };

    const response = await GET(request, params);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Job ID is required');
    expect(data.code).toBe('MISSING_JOB_ID');
  });

  it('should return 404 if job not found in database or queue', async () => {
    const jobId = 'non-existent-job';
    const request = new NextRequest(`http://localhost:3000/api/jobs/${jobId}`);
    const params = { params: { jobId } };

    
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }, 
          }),
        }),
      }),
    });

    
    (getJobStatus as jest.Mock).mockResolvedValue({
      status: 'unknown',
    });

    const response = await GET(request, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Job not found');
    expect(data.code).toBe('JOB_NOT_FOUND');
  });

  it('should return job status from database for pending job', async () => {
    const jobId = 'test-job-123';
    const request = new NextRequest(`http://localhost:3000/api/jobs/${jobId}`);
    const params = { params: { jobId } };

    const mockJobRecord = {
      id: 'uuid-123',
      job_id: jobId,
      contract_type: 'evm',
      status: 'pending',
      source_code_hash: 'hash123',
      artifact_id: null,
      error_message: null,
      created_at: '2024-01-01T00:00:00Z',
      completed_at: null,
    };

    
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockJobRecord,
            error: null,
          }),
        }),
      }),
    });

    
    (getJobStatus as jest.Mock).mockResolvedValue({
      status: 'waiting',
      progress: 0,
    });

    const response = await GET(request, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.jobId).toBe(jobId);
    expect(data.status).toBe('pending');
    expect(data.contractType).toBe('evm');
    expect(data.progress).toBe(0);
  });

  it('should return job status with progress for processing job', async () => {
    const jobId = 'test-job-456';
    const request = new NextRequest(`http://localhost:3000/api/jobs/${jobId}`);
    const params = { params: { jobId } };

    const mockJobRecord = {
      id: 'uuid-456',
      job_id: jobId,
      contract_type: 'stellar',
      status: 'processing',
      source_code_hash: 'hash456',
      artifact_id: null,
      error_message: null,
      created_at: '2024-01-01T00:00:00Z',
      completed_at: null,
    };

    
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockJobRecord,
            error: null,
          }),
        }),
      }),
    });

    
    (getJobStatus as jest.Mock).mockResolvedValue({
      status: 'active',
      progress: 75,
    });

    const response = await GET(request, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.jobId).toBe(jobId);
    expect(data.status).toBe('processing');
    expect(data.contractType).toBe('stellar');
    expect(data.progress).toBe(75);
  });

  it('should return job status with artifact ID for completed job', async () => {
    const jobId = 'test-job-789';
    const artifactId = 'artifact-abc123';
    const request = new NextRequest(`http://localhost:3000/api/jobs/${jobId}`);
    const params = { params: { jobId } };

    const mockJobRecord = {
      id: 'uuid-789',
      job_id: jobId,
      contract_type: 'evm',
      status: 'completed',
      source_code_hash: 'hash789',
      artifact_id: artifactId,
      error_message: null,
      created_at: '2024-01-01T00:00:00Z',
      completed_at: '2024-01-01T00:05:00Z',
    };

    const mockResult = {
      success: true,
      abi: [{ type: 'function', name: 'test' }],
      bytecode: '0x123456',
      artifactId,
    };

    
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockJobRecord,
            error: null,
          }),
        }),
      }),
    });

    
    (getJobStatus as jest.Mock).mockResolvedValue({
      status: 'completed',
      progress: 100,
      result: mockResult,
    });

    const response = await GET(request, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.jobId).toBe(jobId);
    expect(data.status).toBe('completed');
    expect(data.progress).toBe(100);
    expect(data.artifactId).toBe(artifactId);
    expect(data.result).toEqual(mockResult);
  });

  it('should return job status with error for failed job', async () => {
    const jobId = 'test-job-fail';
    const errorMessage = 'Compilation failed: syntax error';
    const request = new NextRequest(`http://localhost:3000/api/jobs/${jobId}`);
    const params = { params: { jobId } };

    const mockJobRecord = {
      id: 'uuid-fail',
      job_id: jobId,
      contract_type: 'evm',
      status: 'failed',
      source_code_hash: 'hash-fail',
      artifact_id: null,
      error_message: errorMessage,
      created_at: '2024-01-01T00:00:00Z',
      completed_at: '2024-01-01T00:01:00Z',
    };

    
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockJobRecord,
            error: null,
          }),
        }),
      }),
    });

    
    (getJobStatus as jest.Mock).mockResolvedValue({
      status: 'failed',
      error: 'Additional error details from queue',
    });

    const response = await GET(request, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.jobId).toBe(jobId);
    expect(data.status).toBe('failed');
    expect(data.error).toBe(errorMessage);
    expect(data.errorDetails).toBe('Additional error details from queue');
  });

  it('should return job from queue if not in database', async () => {
    const jobId = 'queue-only-job';
    const request = new NextRequest(`http://localhost:3000/api/jobs/${jobId}`);
    const params = { params: { jobId } };

    
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          }),
        }),
      }),
    });

    
    (getJobStatus as jest.Mock).mockResolvedValueOnce({
      status: 'active',
      progress: 50,
    });

    const response = await GET(request, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.jobId).toBe(jobId);
    expect(data.status).toBe('processing');
    expect(data.progress).toBe(50);
    expect(data.source).toBe('queue');
  });

  it('should handle database errors gracefully', async () => {
    const jobId = 'test-job-error';
    const request = new NextRequest(`http://localhost:3000/api/jobs/${jobId}`);
    const params = { params: { jobId } };

    
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'DB_ERROR', message: 'Database connection failed' },
          }),
        }),
      }),
    });

    const response = await GET(request, params);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to query job status');
    expect(data.code).toBe('DATABASE_ERROR');
  });
});

import { getDashboardMetrics } from '@/lib/evaluation';

export async function GET() {
  try {
    const metrics = await getDashboardMetrics();
    return Response.json(metrics);
  } catch (error) {
    console.error('[Admin Evaluation API] Error:', error);
    return Response.json(
      { error: 'Failed to fetch evaluation metrics' },
      { status: 500 }
    );
  }
}

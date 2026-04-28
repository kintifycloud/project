import { recordUserFeedback } from '@/lib/evaluation';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recordId, feedback } = body;

    if (!recordId || typeof feedback !== 'boolean') {
      return Response.json({
        error: 'Invalid request: recordId and feedback (boolean) are required',
      }, { status: 400 });
    }

    await recordUserFeedback(recordId, feedback);

    return Response.json({
      success: true,
      message: feedback ? 'Thanks for the positive feedback!' : 'Thanks for the feedback, we\'ll improve.',
    }, { status: 200 });
  } catch (error) {
    console.error('[Evaluation Feedback] Error:', error);
    return Response.json({
      error: 'Failed to record feedback',
    }, { status: 500 });
  }
}

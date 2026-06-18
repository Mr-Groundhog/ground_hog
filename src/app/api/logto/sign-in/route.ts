import { signIn } from '@logto/next/server-actions';
import { logtoConfig } from '@/lib/logto';

const redirectUri = `${logtoConfig.baseUrl}/api/logto/callback`;

export async function GET() {
  await signIn(logtoConfig, { redirectUri });
}

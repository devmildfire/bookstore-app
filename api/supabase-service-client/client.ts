import { createClient } from '@supabase/supabase-js';

// Use a custom domain as the supabase URL
// export const supabase = createClient(
//   'https://api.chtivo.duckdns.org',
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNjk4Nzg2MDAwLAogICJleHAiOiAxODU2NjM4ODAwCn0.rrxgKjiq755gpOZNLxGbY5dmG8HsayZ2O9KXd5viI4E'
// );

export const supabaseService = createClient(
  // process.env.NEXT_PUBLIC_SUPABASE_URL!,
  'test',
  // process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY! // Убрать эти переменные окружения перед стартом работы на реальном окружении
  'test'
);

import { NextResponse } from 'next/server';
import {
  getSupabaseConfigStatus,
  maybeCreateServerSupabaseClient,
} from '@/lib/supabase/server';

function statusUrlFrom(url, fallbackPath = '/status') {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    parsed.pathname = fallbackPath;
    parsed.search = '';
    return parsed.toString();
  } catch {
    return '';
  }
}

async function checkHardwareStatus(url) {
  if (!url) {
    return { configured: false, ok: false, url: '' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
    });
    const text = await response.text();

    return {
      configured: true,
      ok: response.ok,
      url,
      status: response.status,
      body: text.slice(0, 300),
    };
  } catch (error) {
    return {
      configured: true,
      ok: false,
      url,
      error: error.name === 'AbortError' ? 'Timed out' : error.message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const config = getSupabaseConfigStatus();
  const supabase = maybeCreateServerSupabaseClient();
  const [cameraStatus, devkitStatus] = await Promise.all([
    checkHardwareStatus(statusUrlFrom(process.env.ESP32_CAM_CAPTURE_URL)),
    checkHardwareStatus(statusUrlFrom(process.env.ESP32_DEVKIT_COMMAND_URL)),
  ]);

  if (!supabase) {
    return NextResponse.json({
      ok: false,
      status: 'not_configured',
      config,
      next_step: config.hasUrl && config.hasPublishableKey
        ? 'Add SUPABASE_SECRET_KEY to .env.local for database writes from the server.'
        : 'Create .env.local from .env.example and add your Supabase URL plus keys.',
      hardware: {
        camera: cameraStatus,
        devkit: devkitStatus,
      },
    });
  }

  const { count, error } = await supabase
    .from('smart_bins')
    .select('id', { count: 'exact', head: true });

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        status: 'supabase_error',
        config,
        error: error.message,
      },
      { status: 500 },
    );
  }

  const { data: proofRoot, error: proofRootError } = await supabase.storage
    .from(config.proofBucket)
    .list('', { limit: 20 });
  const { data: proofUserFiles, error: proofUserError } = await supabase.storage
    .from(config.proofBucket)
    .list('USR-0042', { limit: 20, sortBy: { column: 'created_at', order: 'desc' } });

  return NextResponse.json({
    ok: true,
    status: 'connected',
    config,
    smart_bin_count: count ?? 0,
    storage: {
      bucket: config.proofBucket,
      root_error: proofRootError?.message ?? null,
      user_folder_error: proofUserError?.message ?? null,
      root_items: (proofRoot ?? []).map((item) => item.name),
      user_folder: 'USR-0042',
      user_file_count: proofUserFiles?.length ?? 0,
      latest_user_files: (proofUserFiles ?? [])
        .filter((item) => item.name !== '.emptyFolderPlaceholder')
        .slice(0, 5)
        .map((item) => ({
          name: item.name,
          created_at: item.created_at ?? null,
          size: item.metadata?.size ?? null,
        })),
    },
    hardware: {
      camera: cameraStatus,
      devkit: devkitStatus,
    },
  });
}

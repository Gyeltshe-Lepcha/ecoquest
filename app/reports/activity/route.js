import { NextResponse } from 'next/server';
import { activityCsv } from '@/lib/ecoquest-data';

export async function GET() {
  return new NextResponse(activityCsv(), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ecoquest-activity.csv"',
    },
  });
}

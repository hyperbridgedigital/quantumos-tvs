import { NextResponse } from 'next/server';
import { getKynetraTemplates, setKynetraTemplates } from '@/data/kynetraTemplatesStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const templates = getKynetraTemplates();
    return NextResponse.json({ templates });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load templates' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const list = body.templates;
    if (!Array.isArray(list)) return NextResponse.json({ error: 'templates array required' }, { status: 400 });
    const templates = setKynetraTemplates(list);
    return NextResponse.json({ ok: true, templates });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update templates' }, { status: 500 });
  }
}

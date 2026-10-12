import { NextResponse } from 'next/server';

export interface LeadWidgetData {
  id: string;
  name: string;
  type: 'Button' | 'Pop-up' | 'Push notification' | 'Webform' | 'Modal window';
  targetDomain: string;
  created: string;
  leadsCount: number;
  status: 'Active' | 'Paused';
  color?: string;
  text?: string;
  position?: string;
}

// In-memory store for server lifetime
let savedWidgets: LeadWidgetData[] = [];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      widgets: savedWidgets,
      count: savedWidgets.length,
      limit: 3,
      trialDaysLeft: 5,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.type) {
      return NextResponse.json(
        { success: false, error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const newWidget: LeadWidgetData = {
      id: body.id || `widget_${Date.now()}`,
      name: body.name,
      type: body.type,
      targetDomain: body.targetDomain || 'https://mywebsite.com',
      created: body.created || new Date().toISOString().split('T')[0],
      leadsCount: body.leadsCount || 0,
      status: body.status || 'Active',
      color: body.color || '#0B69FF',
      text: body.text || 'Get Free Audit',
      position: body.position || 'Bottom Right',
    };

    const existingIndex = savedWidgets.findIndex((w) => w.id === newWidget.id);
    if (existingIndex >= 0) {
      savedWidgets[existingIndex] = { ...savedWidgets[existingIndex], ...newWidget };
    } else {
      savedWidgets.push(newWidget);
    }

    return NextResponse.json({
      success: true,
      message: 'Widget saved successfully!',
      data: newWidget,
      allWidgets: savedWidgets,
    });
  } catch (error: any) {
    console.error('Error saving widget:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save widget' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Widget ID is required' },
        { status: 400 }
      );
    }

    savedWidgets = savedWidgets.filter((w) => w.id !== id);

    return NextResponse.json({
      success: true,
      message: 'Widget removed successfully!',
      allWidgets: savedWidgets,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete widget' },
      { status: 500 }
    );
  }
}

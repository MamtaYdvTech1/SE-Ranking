import { NextRequest, NextResponse } from 'next/server';

interface WalletTransaction {
  id: string;
  date: string;
  credits: number;
  amount: string;
  status: 'Completed' | 'Pending';
  invoiceId: string;
}

let walletState = {
  balance: 0,
  dailyConsumption: 0,
  daysOfRunway: '—',
  transactions: [] as WalletTransaction[],
};

export async function GET() {
  return NextResponse.json({
    success: true,
    walletBalance: walletState.balance,
    avgDailyConsumption: walletState.dailyConsumption,
    daysOfRunway: walletState.daysOfRunway,
    transactions: walletState.transactions,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const credits = Number(body.credits) || 250000;
    const amount = body.amount || (credits * 0.0002).toFixed(2);

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      credits,
      amount: `$${amount}`,
      status: 'Completed',
      invoiceId: `INV-${Date.now().toString().slice(-6)}`,
    };

    walletState.balance += credits;
    walletState.transactions.unshift(newTx);

    return NextResponse.json({
      success: true,
      walletBalance: walletState.balance,
      transaction: newTx,
      message: `Successfully purchased ${credits.toLocaleString()} API credits!`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Purchase failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

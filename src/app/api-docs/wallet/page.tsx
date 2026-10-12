'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Transaction {
  id: string;
  date: string;
  credits: number;
  amount: string;
  status: 'Completed' | 'Pending';
  invoiceId: string;
}

export default function ApiWalletPage() {
  const [creditsAmount, setCreditsAmount] = useState<number>(250000);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'INR' | 'USD'>('INR');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [emailInput, setEmailInput] = useState('suraj.vishwakarma@gvilab.com');
  const [isPaying, setIsPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Calculations
  const pricePerCredit = 0.0002; // $0.20 per 1,000 credits
  const totalCostUsd = creditsAmount * pricePerCredit;
  const inrConversionRate = 99.9578; // 1 USD = 99.9578 INR (includes 4% conversion fee) matching screenshot
  const totalCostInr = (totalCostUsd * inrConversionRate).toFixed(2);
  const formattedUsd = totalCostUsd.toFixed(2);

  // Fetch initial wallet state from real backend API
  const fetchWalletData = async () => {
    try {
      const res = await fetch('/api/api-wallet').then((r) => r.json());
      if (res.success) {
        setWalletBalance(res.walletBalance ?? 0);
        setTransactions(res.transactions ?? []);
      }
    } catch (err) {
      console.error('Failed to fetch wallet data:', err);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleDecrement = () => {
    setCreditsAmount((prev) => Math.max(250000, prev - 50000));
  };

  const handleIncrement = () => {
    setCreditsAmount((prev) => prev + 50000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(rawVal, 10);
    if (!isNaN(num)) {
      setCreditsAmount(num);
    } else if (rawVal === '') {
      setCreditsAmount(0);
    }
  };

  // Open Stripe Checkout Modal
  const handleOpenStripeCheckout = () => {
    if (creditsAmount < 250000) {
      alert('Minimum purchase is 250,000 credits.');
      return;
    }
    setPaySuccess(false);
    setIsPaying(false);
    setIsStripeModalOpen(true);
  };

  // Real payment submission simulating Stripe confirmation & crediting wallet
  const handleExecutePayment = async () => {
    setIsPaying(true);
    try {
      const res = await fetch('/api/api-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credits: creditsAmount,
          amount: selectedCurrency === 'INR' ? `₹${Number(totalCostInr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : `$${formattedUsd}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setWalletBalance(data.walletBalance);
        if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev]);
        }
        setPaySuccess(true);
        setTimeout(() => {
          setIsStripeModalOpen(false);
          setIsPaying(false);
          setFeedbackToast(`Payment successful! ${creditsAmount.toLocaleString()} credits added to your wallet.`);
          setTimeout(() => setFeedbackToast(null), 4000);
        }, 1600);
      }
    } catch (e) {
      console.error('Payment error:', e);
      setIsPaying(false);
      alert('Payment processing failed. Please try again.');
    }
  };

  // Create API Key handler via real backend
  const handleCreateKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackToast(`API key "${data.key.name}" created successfully!`);
        setTimeout(() => setFeedbackToast(null), 3000);
        setIsCreateKeyModalOpen(false);
        setNewKeyName('');
      }
    } catch (e) {
      console.error('Failed to create key:', e);
    }
  };

  return (
    <div className="wallet-page w-full min-h-screen bg-[#F4F6F9] py-5 px-4 sm:px-6 font-sans text-[#171A1F]">
      <div className="max-w-6xl mx-auto w-full space-y-4">

        {/* ===================== TOP BAR: BREADCRUMB & FEEDBACK ===================== */}
        <div className="flex items-center justify-between text-xs py-1">
          <Link
            href="/admin.api.html#/"
            className="flex items-center gap-1.5 text-[#5B6370] hover:text-[#171A1F] transition-colors font-medium cursor-pointer"
          >
            <span className="text-sm font-bold">‹</span>
            <span>API Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Feedback submitted! Thank you.')}
              className="text-[#2870ED] hover:underline font-semibold text-xs cursor-pointer"
            >
              Feedback
            </button>
            <div className="flex items-center gap-1.5 bg-[#FEF3C7] text-[#92400E] px-3 py-1 rounded-full text-xs font-bold border border-[#FDE68A] shadow-2xs select-none">
              <span>🪙</span>
              <span>Credits 100K / 100K ▾</span>
            </div>
          </div>
        </div>

        {/* Toast Alert */}
        {feedbackToast && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between animate-in fade-in duration-200">
            <span>✓ {feedbackToast}</span>
            <button onClick={() => setFeedbackToast(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* ===================== HEADER ===================== */}
        <div className="api-header flex items-center justify-between pb-1">
          <div className="api-header__title-wrapper flex items-center gap-2">
            <h1 className="api-header__title text-2xl font-bold text-[#171A1F] tracking-tight">
              Wallet
            </h1>
            <div
              className="se-hint-title-2 w-4 h-4 rounded-full bg-[#E5E7EB] text-[#4B5563] text-[11px] font-bold flex items-center justify-center cursor-help"
              title="Top up credits and monitor your API wallet usage."
            >
              i
            </div>
          </div>

          <div className="api-header__button-wrapper">
            <button
              onClick={() => setIsCreateKeyModalOpen(true)}
              className="se-button-2 se-button-2_primary flex items-center gap-1.5 px-4 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white text-xs font-bold rounded-[6px] shadow-xs transition-colors cursor-pointer"
            >
              <span className="text-base font-bold leading-none">+</span>
              <span className="uppercase tracking-wider">Create api key</span>
              <span className="text-[10px]">▼</span>
            </button>
          </div>
        </div>

        {/* ===================== MAIN GRID (3 COLUMNS: LEFT 1, RIGHT 2) ===================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* ===================== LEFT COLUMN (SPAN 1) ===================== */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* 1. Wallet Balance Card */}
            <div className="ui-card wallet-balance bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs space-y-4">
              <div className="ui-card__header pb-1">
                <h4 className="ui-heading text-sm font-bold text-[#171A1F]">
                  Wallet balance
                </h4>
              </div>

              <div className="ui-card__body space-y-4">
                {/* Balance Dual Circle Coin Icon + Amount */}
                <div className="flex items-center gap-3">
                  <div className="wallet-balance__icon shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="2.4rem"
                      height="2.4rem"
                      viewBox="0 0 24 24"
                      className="iconify iconify--ic ui-icon"
                      style={{ color: '#376AFD' }}
                    >
                      <path
                        fill="currentColor"
                        d="M15 4c-4.42 0-8 3.58-8 8s3.58 8 8 8s8-3.58 8-8s-3.58-8-8-8m0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6s6 2.69 6 6s-2.69 6-6 6M3 12a5.99 5.99 0 0 1 4-5.65V4.26C3.55 5.15 1 8.27 1 12s2.55 6.85 6 7.74v-2.09A5.99 5.99 0 0 1 3 12"
                      />
                    </svg>
                  </div>
                  <div className="ui-number">
                    <div className="text-3xl font-bold text-[#171A1F]">
                      {walletBalance.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Avg daily consumption */}
                <div className="ui-flex-item space-y-0.5 pt-1">
                  <div className="ui-text text-xs text-[#7A8391]">
                    Avg. daily consumption
                  </div>
                  <div className="text-base font-bold text-[#171A1F]">
                    0
                  </div>
                </div>

                {/* Days of runway */}
                <div className="ui-flex-item space-y-0.5">
                  <div className="ui-text text-xs text-[#7A8391]">
                    Days of runway
                  </div>
                  <div className="text-base font-bold text-[#171A1F]">
                    —
                  </div>
                </div>

                {/* Set up auto recharge */}
                <div className="wallet-message pt-2">
                  <div className="bg-[#FFF9EC] border border-[#FFE7B3] rounded-[10px] p-3 flex items-center gap-2 text-xs text-[#7A5A00] cursor-pointer hover:bg-[#FFF4D9] transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16px"
                      height="16px"
                      viewBox="0 0 24 24"
                      className="shrink-0"
                    >
                      <path
                        fill="currentColor"
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m1 15h-2v-6h2zm0-8h-2V7h2z"
                      />
                    </svg>
                    <span className="font-medium">Set up auto recharge</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Auto Recharge Card */}
            <div className="ui-card wallet-balance bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs space-y-3">
              <div className="ui-card__header">
                <h4 className="ui-heading text-sm font-bold text-[#171A1F]">
                  Auto recharge
                </h4>
              </div>
              <div className="ui-card__body">
                <div className="bg-[#FFF9EC] border border-[#FFE7B3] rounded-[10px] p-3 flex items-center gap-2 text-xs text-[#7A5A00]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16px"
                    height="16px"
                    viewBox="0 0 24 24"
                    className="shrink-0"
                  >
                    <path
                      fill="currentColor"
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m1 15h-2v-6h2zm0-8h-2V7h2z"
                    />
                  </svg>
                  <span className="font-medium">Coming soon</span>
                </div>
              </div>
            </div>

            {/* 3. Low Balance Alert Card */}
            <div className="ui-card wallet-balance bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs space-y-3">
              <div className="ui-card__header">
                <h4 className="ui-heading text-sm font-bold text-[#171A1F]">
                  Low balance alert
                </h4>
              </div>
              <div className="ui-card__body">
                <div className="bg-[#FFF9EC] border border-[#FFE7B3] rounded-[10px] p-3 flex items-center gap-2 text-xs text-[#7A5A00]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16px"
                    height="16px"
                    viewBox="0 0 24 24"
                    className="shrink-0"
                  >
                    <path
                      fill="currentColor"
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m1 15h-2v-6h2zm0-8h-2V7h2z"
                    />
                  </svg>
                  <span className="font-medium">Coming soon</span>
                </div>
              </div>
            </div>

          </div>

          {/* ===================== RIGHT COLUMN (SPAN 2) ===================== */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 4. Credits Amount & Calculator Card */}
            <div className="ui-card wallet-purchase bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs space-y-5">
              
              {/* Top Row: Credits Amount Title + Connected Stepper */}
              <div className="wallet-purchase__input flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="ui-flex-item">
                  <h4 className="ui-heading text-sm font-bold text-[#171A1F]">
                    Credits amount
                  </h4>
                  <div className="ui-text text-xs text-[#7A8391]">
                    Min. purchase 250,000 credits
                  </div>
                </div>

                {/* Connected Stepper Input */}
                <div className="ui-input-group flex items-stretch border border-[#CBD5E1] rounded-[8px] overflow-hidden bg-white shadow-2xs">
                  <div className="ui-input-group-item">
                    <input
                      type="text"
                      value={creditsAmount.toLocaleString()}
                      onChange={handleInputChange}
                      className="w-28 sm:w-32 py-2 px-3 text-center text-xs font-bold text-[#171A1F] focus:outline-hidden"
                      title={creditsAmount.toLocaleString()}
                    />
                  </div>
                  <div className="ui-input-group-item border-l border-[#CBD5E1]">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={creditsAmount <= 250000}
                      className={`h-full px-3.5 flex items-center justify-center transition-colors cursor-pointer ${
                        creditsAmount <= 250000
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                          : 'bg-white hover:bg-gray-50 text-gray-700 active:bg-gray-100'
                      }`}
                      title="Decrease by 50,000"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 12.998H5v-2h14z" />
                      </svg>
                    </button>
                  </div>
                  <div className="ui-input-group-item border-l border-[#CBD5E1]">
                    <button
                      type="button"
                      onClick={handleIncrement}
                      className="h-full px-3.5 bg-white hover:bg-gray-50 text-gray-700 active:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
                      title="Increase by 50,000"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Pricing breakdown rows */}
              <div className="space-y-2.5 text-xs text-[#5B6370] pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span>Bonus credits</span>
                    <span
                      className="w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold flex items-center justify-center cursor-help"
                      title="Bonus credits are extra credits added on top of your purchase when a promotion applies."
                    >
                      i
                    </span>
                  </div>
                  <div className="font-semibold text-[#171A1F]">0</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span>Cost for 1,000 credits</span>
                  </div>
                  <div className="font-semibold text-[#171A1F]">$0.20</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span>Total credits</span>
                  </div>
                  <div className="font-semibold text-[#171A1F]">{creditsAmount.toLocaleString()}</div>
                </div>
              </div>

              {/* Separator Divider */}
              <div className="wallet-purchase__separator border-t border-[#F0F2F5] pt-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#171A1F]">Total cost</h3>
                  <div className="text-xl font-bold text-[#171A1F]">${formattedUsd}</div>
                </div>
              </div>

              {/* Actions Footer: Secure payments + Confirm purchase */}
              <div className="wallet-purchase__actions pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-[#7A8391]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16px"
                    height="16px"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="shrink-0 text-gray-500"
                  >
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2m-6 9c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2m3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1z" />
                  </svg>
                  <span>Payments are processed securely</span>
                </div>

                <button
                  type="button"
                  onClick={handleOpenStripeCheckout}
                  className="px-6 py-2.5 bg-[#2870ED] hover:bg-[#1C60DB] active:bg-[#1553C4] text-white font-bold text-xs sm:text-sm rounded-[8px] shadow-sm transition-all cursor-pointer select-none"
                >
                  Confirm purchase
                </button>
              </div>

            </div>

            {/* 5. Transactions History Card */}
            <div className="ui-card wallet-transactions bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs space-y-4">
              <div className="ui-card__header flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="ui-heading text-sm font-bold text-[#171A1F]">
                    {transactions.length} transactions
                  </h4>
                  <span
                    className="w-4 h-4 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold flex items-center justify-center cursor-help"
                    title="This list only includes wallet transactions and their invoices."
                  >
                    i
                  </span>
                </div>
              </div>

              <div className="ui-card__body">
                {transactions.length === 0 ? (
                  /* No Data empty state matching provided HTML */
                  <div className="wallet-transactions__no-data-box text-center py-10 space-y-2">
                    <h3 className="ui-heading text-base font-bold text-[#171A1F]">
                      No data
                    </h3>
                    <div className="ui-text text-xs text-[#7A8391]">
                      We have not found any transactions linked to your account
                    </div>
                  </div>
                ) : (
                  /* Real Transactions List */
                  <div className="divide-y divide-[#F0F2F5]">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="py-3 flex items-center justify-between text-xs hover:bg-[#F8FAFC] px-2 rounded-lg transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-[#171A1F]">
                            +{tx.credits.toLocaleString()} API credits top-up
                          </div>
                          <div className="text-[11px] text-[#7A8391]">
                            {tx.date} • Invoice #{tx.invoiceId}
                          </div>
                        </div>

                        <div className="text-right space-y-0.5">
                          <div className="font-bold text-[#171A1F]">{tx.amount}</div>
                          <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ===================== STRIPE CHECKOUT MODAL (MATCHING USER SCREENSHOT 100%) ===================== */}
      {isStripeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-gray-200 relative my-auto animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button
              onClick={() => setIsStripeModalOpen(false)}
              className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer transition-colors"
              title="Close checkout"
            >
              ✕
            </button>

            {/* Stripe Modal Two-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
              
              {/* Left Column: Order Summary & Currency Choice (5 Cols) */}
              <div className="md:col-span-6 bg-[#FAFAFA] p-6 sm:p-8 border-b md:border-b-0 md:border-r border-[#E5E7EB] flex flex-col justify-between space-y-6">
                
                <div className="space-y-6">
                  {/* SE Ranking Brand Header */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsStripeModalOpen(false)}
                      className="text-gray-500 hover:text-gray-800 text-sm font-semibold cursor-pointer"
                    >
                      ←
                    </button>
                    <div className="flex items-center gap-1.5 font-bold text-[#171A1F] text-base">
                      {/* SE Ranking Blue Logo Icon */}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" fill="#2870ED" />
                        <path d="M12 6L7 9V15L12 18L17 15V9L12 6Z" fill="#FFFFFF" />
                      </svg>
                      <span>SE Ranking</span>
                    </div>
                  </div>

                  {/* Merchant Title */}
                  <div>
                    <div className="text-xs text-gray-500">Pay SER Acquisition</div>
                  </div>

                  {/* Choose Currency Tabs */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-700">Choose currency</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCurrency('INR')}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          selectedCurrency === 'INR'
                            ? 'border-gray-900 bg-white text-gray-900 shadow-2xs'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-sm">🇮🇳</span>
                        <span>₹{Number(totalCostInr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedCurrency('USD')}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          selectedCurrency === 'USD'
                            ? 'border-gray-900 bg-white text-gray-900 shadow-2xs'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-sm">🇺🇸</span>
                        <span>US${formattedUsd}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      1 USD = 99.9578 INR (includes 4% conversion fee)
                    </p>
                  </div>

                  {/* API Wallet credits description */}
                  <div className="space-y-1 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-900">
                      <span>API Wallet credits</span>
                      <span>
                        {selectedCurrency === 'INR' ? `₹${Number(totalCostInr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : `US$${formattedUsd}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Top-up credits for your SE Ranking API Wallet. Credits never expire. Minimum 250K credits ($50). Standard rate: $200 per 1M credits.
                    </p>
                  </div>

                  {/* Subtotal, Promo, Tax */}
                  <div className="space-y-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-900">
                        {selectedCurrency === 'INR' ? `₹${Number(totalCostInr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : `US$${formattedUsd}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert('No active promo codes right now.')}
                      className="text-xs text-gray-700 hover:text-gray-900 font-medium py-1 px-2 -ml-2 rounded-md hover:bg-gray-200/50 inline-block cursor-pointer transition-colors"
                    >
                      Add promotion code
                    </button>

                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <span>Tax</span>
                        <span className="text-gray-400">ⓘ</span>
                      </span>
                      <span>Enter address to calculate</span>
                    </div>
                  </div>
                </div>

                {/* Total Due */}
                <div className="pt-4 border-t border-gray-300 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">Total due</span>
                  <span className="text-lg font-bold text-gray-900">
                    {selectedCurrency === 'INR' ? `₹${Number(totalCostInr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : `US$${formattedUsd}`}
                  </span>
                </div>

              </div>

              {/* Right Column: Stripe Payment Form (6 Cols) */}
              <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-5 bg-white">
                
                <div className="space-y-5">
                  {/* Apple Pay Big Black Button */}
                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    disabled={isPaying || paySuccess}
                    className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <span className="text-base font-bold"></span>
                    <span className="font-semibold">Pay</span>
                  </button>

                  {/* OR Divider */}
                  <div className="relative flex items-center justify-center">
                    <div className="w-full border-t border-gray-200" />
                    <span className="bg-white px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest absolute">
                      OR
                    </span>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">Contact information</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full text-xs py-2.5 px-3 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2870ED] focus:border-transparent text-gray-900"
                        placeholder="your-email@domain.com"
                      />
                    </div>
                  </div>

                  {/* Payment Method Radio Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">Payment method</label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden divide-y divide-gray-200">
                      
                      {/* Option 1: Card */}
                      <label className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="stripePaymentMethod"
                            checked={paymentMethod === 'card'}
                            onChange={() => setPaymentMethod('card')}
                            className="text-[#2870ED] focus:ring-0 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                            💳 Card
                          </span>
                        </div>
                        {/* Card brand badges */}
                        <div className="flex items-center gap-1 opacity-80">
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-bold border border-blue-200">VISA</span>
                          <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 text-[9px] font-bold border border-orange-200">MC</span>
                          <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[9px] font-bold border border-sky-200">AMEX</span>
                          <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[9px] font-bold border border-green-200">JCB</span>
                        </div>
                      </label>

                      {/* Card Details Sub-panel (if Card selected) */}
                      {paymentMethod === 'card' && (
                        <div className="p-3 bg-[#FAFAFA] space-y-2.5 animate-in fade-in duration-150">
                          <div>
                            <input
                              type="text"
                              defaultValue="4242 •••• •••• 4242"
                              className="w-full text-xs py-2 px-3 bg-white border border-gray-300 rounded-md focus:outline-hidden focus:border-[#2870ED]"
                              placeholder="Card number"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              defaultValue="12 / 28"
                              className="text-xs py-2 px-3 bg-white border border-gray-300 rounded-md focus:outline-hidden focus:border-[#2870ED]"
                              placeholder="MM / YY"
                            />
                            <input
                              type="text"
                              defaultValue="•••"
                              className="text-xs py-2 px-3 bg-white border border-gray-300 rounded-md focus:outline-hidden focus:border-[#2870ED]"
                              placeholder="CVC"
                            />
                          </div>
                        </div>
                      )}

                      {/* Option 2: UPI */}
                      <label className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="stripePaymentMethod"
                            checked={paymentMethod === 'upi'}
                            onChange={() => setPaymentMethod('upi')}
                            className="text-[#2870ED] focus:ring-0 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                            ⚡ UPI
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">
                          GPay / PhonePe / Paytm
                        </span>
                      </label>

                      {/* UPI Details Sub-panel */}
                      {paymentMethod === 'upi' && (
                        <div className="p-3 bg-[#FAFAFA] space-y-2 animate-in fade-in duration-150">
                          <input
                            type="text"
                            defaultValue="suraj@okhdfcbank"
                            className="w-full text-xs py-2 px-3 bg-white border border-gray-300 rounded-md focus:outline-hidden focus:border-[#2870ED]"
                            placeholder="Enter your UPI ID (e.g. username@okhdfcbank)"
                          />
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Pay Button */}
                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    disabled={isPaying || paySuccess}
                    className={`w-full py-3 rounded-lg text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      paySuccess
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : isPaying
                        ? 'bg-[#1C60DB] cursor-wait'
                        : 'bg-[#2870ED] hover:bg-[#1C60DB] active:scale-[0.99]'
                    }`}
                  >
                    {paySuccess ? (
                      <>
                        <span className="text-base font-bold">✓</span>
                        <span>Payment Completed!</span>
                      </>
                    ) : isPaying ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span>Processing payment...</span>
                      </>
                    ) : (
                      <span>
                        Pay {selectedCurrency === 'INR' ? `₹${Number(totalCostInr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : `US$${formattedUsd}`}
                      </span>
                    )}
                  </button>
                </div>

                {/* Footer Stripe Branding */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <div className="flex items-center gap-1">
                    <span>Powered by</span>
                    <span className="font-bold text-gray-600 tracking-tight">stripe</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <a href="https://stripe.com/terms" target="_blank" rel="noreferrer" className="hover:underline">Terms</a>
                    <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer" className="hover:underline">Privacy</a>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* ===================== CREATE API KEY MODAL ===================== */}
      {isCreateKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsCreateKeyModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              ✕
            </button>

            <form onSubmit={handleCreateKeySubmit} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#171A1F]">Create API Key</h3>
                <p className="text-xs text-[#7A8391]">Enter a descriptive name for your new API key.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Key Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Data Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#2870ED]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateKeyModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Create Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

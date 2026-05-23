import React, { useEffect, useMemo, useState } from 'react';
import { DollarSign } from 'lucide-react';
import MerchantPageHeader from '../components/MerchantPageHeader';
import MerchantPill from '../components/MerchantPill';
import {
  createMyMerchantConnectAccount,
  getMyMerchantEarnings,
  getMyMerchantPayoutHistory,
  getMyMerchantStore,
  requestMyMerchantPayout,
} from '../../../services/merchantService';
import { handlePaymentError } from '../../../utils/paymentErrorHandler';

const Pill = ({ children, c }) => (
  <MerchantPill className={c}>{children}</MerchantPill>
);

const MerchantPayouts = () => {
  const [store, setStore] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [amount, setAmount] = useState('50');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [storePayload, earningsPayload] = await Promise.all([
        getMyMerchantStore(),
        getMyMerchantEarnings('month'),
      ]);
      setStore(storePayload || null);
      setEarnings(earningsPayload || null);

      try {
        const historyPayload = await getMyMerchantPayoutHistory(20);
        setPayoutHistory(Array.isArray(historyPayload) ? historyPayload : []);
      } catch {
        setPayoutHistory([]);
      }
    } catch (err) {
      setError(handlePaymentError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const onboardingState = params.get('stripe_onboarding');

    if (onboardingState === 'success') {
      setMessage('Stripe onboarding completed. Connection status refreshed.');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (onboardingState === 'refresh') {
      setMessage('Stripe onboarding was refreshed. Please complete the remaining steps.');
      window.history.replaceState({}, '', window.location.pathname);
    }

    load();
  }, []);

  const submitPayout = async () => {
    try {
      setError('');
      setMessage('');
      if (!store?.stripeAccountId) {
        setError('Please connect your bank account before requesting a payout.');
        return;
      }
      const numeric = Number(amount);
      if (!numeric || numeric < 20) {
        setError('Minimum payout amount is $20. Please enter a higher amount.');
        return;
      }
      // if (numeric > effectivePayoutableBalance) {
      //   setError(`You can withdraw up to $${effectivePayoutableBalance.toFixed(2)} right now based on Stripe transferable balance.`);
      //   return;
      // }

      const payload = await requestMyMerchantPayout(numeric);
      setMessage(`Payout requested: $${Number(payload?.amount || numeric).toFixed(2)}.`);
      await load();
    } catch (err) {
      setError(handlePaymentError(err));
    }
  };

  const connectStripe = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const origin = window.location.origin;
      const response = await createMyMerchantConnectAccount({
        refreshUrl: `${origin}/merchant/payouts?stripe_onboarding=refresh`,
        returnUrl: `${origin}/merchant/payouts?stripe_onboarding=success`,
      });

      if (!response?.onboardingUrl) {
        setError('Unable to start Stripe onboarding. Please try again.');
        return;
      }

      window.location.assign(response.onboardingUrl);
    } catch (err) {
      setError(handlePaymentError(err));
      setLoading(false);
    }
  };

  const availableBalance = Number(earnings?.summary?.availableBalance || 0);
  // const stripeTransferableBalance = Number(earnings?.summary?.stripePlatformAvailable || 0);
  // const effectivePayoutableBalance = Math.min(availableBalance, stripeTransferableBalance || 0);
  const isStripeConnected = Boolean(store?.stripeAccountId);
  const history = useMemo(() => (
    (Array.isArray(payoutHistory) ? payoutHistory : []).map((item) => ({
      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-',
      ref: item.id,
      amount: Number(item.amount || 0),
      method: 'Stripe Transfer',
      status: item.status === 'reversed' ? 'Reversed' : 'Completed',
      sc: item.status === 'reversed' ? 'text-yellow bg-yellow/10' : 'text-green-500 bg-green-500/10',
    }))
  ), [payoutHistory]);

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <MerchantPageHeader
          title={
            <>
              Payout <span className="text-teal">History</span>
            </>
          }
          subtitle="Track your settlements and request withdrawals"
        />
      </div>

      {message ? <div className="mb-4 rounded border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-300">{message}</div> : null}
      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}

      <div className="mb-8 grid grid-cols-1 gap-4">
        <div className="bg-card hover:border-teal/20 transition-colors rounded-lg border border-white/[0.07] p-6 flex flex-col items-start gap-2">
          <div className="mb-2">
            <div className="bg-teal/10 flex h-10 w-10 items-center justify-center rounded-md">
              <DollarSign size={20} className="text-teal" />
            </div>
          </div>
          <div className="font-syne text-[1.8rem] leading-none font-extrabold text-white">${availableBalance.toFixed(2)}</div>
          <div className="text-gray mt-1 text-[0.7rem] font-bold tracking-widest uppercase">Available for Payout</div>
          {/* <div className="mt-1 text-gray text-[0.82rem]">Stripe transferable now: ${stripeTransferableBalance.toFixed(2)}</div>
          {stripeTransferableBalance < availableBalance && (
            <div className="mt-1 rounded border border-yellow/30 bg-yellow/10 px-3 py-2 text-[0.78rem] text-yellow">
              Your app balance is higher than Stripe transferable balance right now. Withdraw limit: ${effectivePayoutableBalance.toFixed(2)}.
            </div>
          )} */}
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-widest ${
                isStripeConnected
                  ? 'border-green-500/40 bg-green-500/10 text-green-400'
                  : 'border-yellow/30 bg-yellow/10 text-yellow'
              }`}
            >
              {isStripeConnected ? 'Stripe connected' : 'Stripe not connected'}
            </span>
          </div>
          <div className="mt-1 text-gray text-[0.82rem]">
            {isStripeConnected
              ? 'Your payout destination is managed in Stripe. Use Manage Stripe to update payout settings.'
              : 'Connect Stripe to finish onboarding and enable payouts.'}
          </div>
          <div className="mt-3 flex w-full gap-2">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              min="20"
              className="bg-navy3 focus:border-teal flex-1 rounded border border-white/[0.07] px-3 py-1.5 text-sm text-white outline-none"
              placeholder="Amount"
            />
            <button onClick={submitPayout} disabled={loading} className="bg-teal text-navy hover:bg-teal2 rounded px-4 py-1.5 text-[0.75rem] font-bold transition-colors disabled:opacity-70">
              Withdraw
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={connectStripe} disabled={loading} className="text-gray hover:border-teal hover:text-teal rounded border border-white/10 px-4 py-1.5 text-[0.75rem] font-bold transition-all disabled:opacity-70">
              {isStripeConnected ? 'Manage Stripe' : 'Connect Stripe'}
            </button>
            <button onClick={load} className="text-gray hover:border-teal hover:text-teal rounded border border-white/10 px-4 py-1.5 text-[0.75rem] font-bold transition-all">
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card overflow-hidden rounded-lg border border-white/[0.07]">
        <div className="border-b border-white/[0.07] px-6 py-4">
          <h3 className="font-syne text-[1rem] font-bold text-white">Payout Transfer History</h3>
        </div>

        <div className="hidden min-[800px]:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-navy3/50 text-gray text-[0.7rem] font-bold tracking-widest uppercase">
              <tr className="border-b border-white/[0.07]">
                {['Date', 'Reference', 'Amount', 'Method', 'Status'].map((h) => (
                  <th key={h} className="px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[0.88rem] text-white">
              {!history.length && (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray2" colSpan={5}>
                    No payout transfers yet.
                  </td>
                </tr>
              )}
              {history.map((p) => (
                <tr key={p.ref} className="border-b border-white/[0.07] transition-colors last:border-b-0 hover:bg-white/2">
                  <td className="px-6 py-4 font-medium">{p.date}</td>
                  <td className="text-gray px-6 py-4 text-[0.8rem] tracking-wider">{p.ref}</td>
                  <td className="text-teal px-6 py-4 font-black">${p.amount.toFixed(2)}</td>
                  <td className="text-gray2 px-6 py-4">{p.method}</td>
                  <td className="px-6 py-4">
                    <Pill c={p.sc}>{p.status}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MerchantPayouts;

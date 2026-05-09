"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase";
import { ProcessingOverlay, SuccessOverlay } from "../../components/ProcessingOverlay";
import { BrandIcon } from "../../components/BrandIcon";

type Profile = Record<string, any> & {
  plan: string;
  plan_status: string;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  trial_end: string | null;
  stripe_subscription_id?: string;
};

type BillingItem = {
  id: string;
  created: number;
  amount_paid: number;
  status: string;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  type: 'subscription' | 'purchase';
  material_id: string | null;
};

const FALLBACK_PLAN_LABEL: Record<string, string> = {
  free: "toolio free",
  weekly: "toolio weekly unlimited",
  monthly: "toolio monthly unlimited",
};

const FALLBACK_PLAN_PRICE: Record<string, string> = {
  free: "¥0",
  weekly: "¥498 / 週",
  monthly: "¥1,480 / 月",
};

function formatDate(isoString: string | null) {
  if (!isoString) return "―";
  const d = new Date(isoString);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function StatusBadge({ plan_status, cancel_at_period_end, isPendingDeletion }: { plan_status: string; cancel_at_period_end: boolean; trial_end?: string | null; isPendingDeletion?: boolean }) {
  if (isPendingDeletion) {
    return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#fff0e8", color: "#a04020" }}>退会予約済み</span>;
  }
  if (plan_status === "trialing") {
    return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#e8f8ee", color: "#2a6a44" }}>トライアル中</span>;
  }
  if (cancel_at_period_end) {
    return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#fff0e8", color: "#a04020" }}>キャンセル予約済み</span>;
  }
  if (plan_status === "past_due") {
    return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#ffe8e8", color: "#a02020" }}>お支払い確認中</span>;
  }
  if (plan_status === "active") {
    return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#e8efff", color: "#3a5a9a" }}>有効</span>;
  }
  return null;
}

export default function BillingSection({
  profile,
  onChangePlan,
  onProfileUpdate,
  mobileMode,
  allMaterials = [],
}: {
  profile: Profile;
  onChangePlan: () => void;
  onProfileUpdate: (updates: Partial<Profile>) => void;
  mobileMode?: boolean;
  allMaterials?: { id: string; title: string }[];
}) {
  const [planLabel, setPlanLabel] = useState<Record<string, string>>(FALLBACK_PLAN_LABEL);
  const [planPrice, setPlanPrice] = useState<Record<string, string>>(FALLBACK_PLAN_PRICE);
  const [invoices, setInvoices] = useState<BillingItem[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [reactivateSuccess, setReactivateSuccess] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [subscriptionResetModal, setSubscriptionResetModal] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [confirmWithdrawalCancel, setConfirmWithdrawalCancel] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/notion/plans")
      .then(r => r.json())
      .then(({ plans }) => {
        if (!Array.isArray(plans) || plans.length === 0) return;
        const label: Record<string, string> = {};
        const price: Record<string, string> = {};
        for (const p of plans) {
          label[p.key] = p.displayName;
          price[p.key] = p.price === 0 ? "¥0" : p.key === "weekly" ? `¥${Number(p.price).toLocaleString()} / 週` : `¥${Number(p.price).toLocaleString()} / 月`;
        }
        setPlanLabel(label);
        setPlanPrice(price);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setInvoicesLoading(false); return; }
      try {
        const res = await fetch("/api/stripe/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: session.user.id }),
        });
        const data = await res.json();
        setInvoices(data.invoices ?? []);
      } catch {
        setInvoices([]);
      } finally {
        setInvoicesLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleCancel = async () => {
    setCancelLoading(true);
    setCancelError(null);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setCancelLoading(false); return; }
    try {
      const res = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });
      const data = await res.json();
      if (data.success) {
        onProfileUpdate({
          cancel_at_period_end: true,
          current_period_end: data.currentPeriodEnd ?? null,
        });
        setCancelSuccess(true);
        setCancelLoading(false);
        setTimeout(() => { setCancelSuccess(false); setConfirmCancel(false); }, 2000);
      } else if (data.error === 'subscription_reset') {
        setCancelLoading(false);
        setConfirmCancel(false);
        setSubscriptionResetModal(true);
      } else if (data.error === 'No active subscription') {
        setCancelError('有効なサブスクリプションが見つかりません。既にキャンセル済みの可能性があります。');
        setCancelLoading(false);
      } else if (data.error === 'Profile not found') {
        setCancelError('アカウント情報が見つかりません。再ログインしてからお試しください。');
        setCancelLoading(false);
      } else {
        setCancelError(`キャンセルに失敗しました（${data.error ?? 'Unknown error'}）。しばらく経ってから再度お試しください。`);
        setCancelLoading(false);
      }
    } catch {
      setCancelError('通信エラーが発生しました。接続を確認してから再度お試しください。');
      setCancelLoading(false);
    }
  };

  const handleReactivate = async () => {
    setReactivateLoading(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      const res = await fetch("/api/stripe/reactivate-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });
      const data = await res.json();
      if (data.success) {
        onProfileUpdate({ cancel_at_period_end: false });
        setReactivateSuccess(true);
        setReactivateLoading(false);
        setTimeout(() => setReactivateSuccess(false), 2000);
      } else if (data.error === 'subscription_reset') {
        setReactivateLoading(false);
        setSubscriptionResetModal(true);
      } else {
        setReactivateLoading(false);
      }
    } catch {
      setReactivateLoading(false);
    }
  };

  const handleWithdrawalCancel = async () => {
    setWithdrawalLoading(true);
    setWithdrawalError(null);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setWithdrawalLoading(false); return; }
    try {
      const res = await fetch("/api/auth/reactivate-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });
      const data = await res.json();
      if (data.success) {
        onProfileUpdate({ status: "active", cancel_at_period_end: false, deleted_at: null } as any);
        setWithdrawalSuccess(true);
        setWithdrawalLoading(false);
        setTimeout(() => { setWithdrawalSuccess(false); setConfirmWithdrawalCancel(false); }, 2000);
      } else {
        setWithdrawalError(`解約取り消しに失敗しました（${data.error ?? 'Unknown error'}）。しばらく経ってから再度お試しください。`);
        setWithdrawalLoading(false);
      }
    } catch {
      setWithdrawalError('通信エラーが発生しました。接続を確認してから再度お試しください。');
      setWithdrawalLoading(false);
    }
  };

  const isPaid = profile.plan !== "free";
  const isPendingDeletion = profile.status === "pending_deletion";

  return (
    <div>
      {/* ヘッダー */}
      {!mobileMode && (
        <div style={{ padding: "60px 48px 40px", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 75%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)", borderRadius: "16px 16px 0 0" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block" }}>支払い履歴</h2>
        </div>
      )}

      <div style={{ padding: mobileMode ? "20px 16px 56px" : "32px 48px 56px", maxWidth: mobileMode ? undefined : 640, display: "flex", flexDirection: "column", gap: 20, margin: "0 auto" }}>

        {/* 現在のプラン */}
        <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 14, padding: mobileMode ? "16px" : "24px" }}>
          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 10, fontWeight: 700, letterSpacing: 1 }}>現在のプラン</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontSize: mobileMode ? 15 : 20, fontWeight: 800, color: "#7a50b0", whiteSpace: "nowrap" }}>{planLabel[profile.plan] ?? "toolio free"}</div>
                <StatusBadge
                  plan_status={profile.plan_status}
                  cancel_at_period_end={profile.cancel_at_period_end}
                  trial_end={profile.trial_end}
                  isPendingDeletion={isPendingDeletion}
                />
              </div>
              <div style={{ fontSize: 12, color: "#aaa" }}>{planPrice[profile.plan] ?? "無料"}</div>
              {profile.plan_status === "trialing" && profile.trial_end && (
                <div style={{ fontSize: 11, color: "#2a6a44", background: "#e8f8ee", padding: "5px 10px", borderRadius: 8 }}>
                  トライアル終了日：{formatDate(profile.trial_end)}
                </div>
              )}
              {isPendingDeletion && profile.current_period_end && (
                <div style={{ fontSize: 11, color: "#a04020", background: "#fff0e8", padding: "5px 10px", borderRadius: 8 }}>
                  {formatDate(profile.current_period_end)}に退会予定
                </div>
              )}
              {!isPendingDeletion && isPaid && profile.cancel_at_period_end && profile.current_period_end && (
                <div style={{ fontSize: 11, color: "#a04020", background: "#fff0e8", padding: "5px 10px", borderRadius: 8 }}>
                  {formatDate(profile.current_period_end)}にfreeへ移行
                </div>
              )}
              {isPaid && !profile.cancel_at_period_end && profile.plan_status !== "trialing" && profile.current_period_end && (
                <div style={{ fontSize: 11, color: "#3a5a9a", background: "#e8efff", padding: "5px 10px", borderRadius: 8 }}>
                  次回更新日：{formatDate(profile.current_period_end)}
                </div>
              )}
              {profile.plan_status === "past_due" && (
                <div style={{ fontSize: 11, color: "#a02020", background: "#ffe8e8", padding: "5px 10px", borderRadius: 8 }}>
                  お支払いが確認できていません
                </div>
              )}
            </div>
            {isPendingDeletion && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => setConfirmWithdrawalCancel(true)}
                  style={{ fontSize: 11, padding: "7px 14px", borderRadius: 20, border: "0.5px solid rgba(163,192,255,0.6)", background: "white", color: "#3a5a9a", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  退会をやめる
                </button>
              </div>
            )}
            {!isPendingDeletion && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={onChangePlan}
                  style={{ fontSize: 11, padding: "7px 14px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}
                >
                  プランを変更 →
                </button>
                {isPaid && !profile.cancel_at_period_end && profile.plan_status !== "trialing" && (
                  <button
                    onClick={() => setConfirmCancel(true)}
                    style={{ fontSize: 11, padding: "7px 14px", borderRadius: 20, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#aaa", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    サブスクをキャンセル
                  </button>
                )}
                {isPaid && profile.cancel_at_period_end && (
                  <button
                    onClick={handleReactivate}
                    disabled={reactivateLoading}
                    style={{ fontSize: 11, padding: "7px 14px", borderRadius: 20, border: "0.5px solid rgba(163,192,255,0.6)", background: "white", color: "#3a5a9a", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    {reactivateLoading ? "処理中..." : "キャンセルを取り消す"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 退会取り消し処理中・完了モーダル */}
        {(withdrawalLoading || withdrawalSuccess) && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "white", borderRadius: 16, maxWidth: 380, width: "90%", boxShadow: "0 8px 48px rgba(0,0,0,0.18)", overflow: "hidden" }}>
              {withdrawalLoading ? (
                <ProcessingOverlay messages={["退会取り消し処理中...", "もう少しで完了します", "データを更新しています"]} />
              ) : (
                <div style={{ padding: "36px 40px" }}>
                  <SuccessOverlay label="退会予約を取り消しました。引き続きご利用いただけます。" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 退会取り消し確認モーダル */}
        {confirmWithdrawalCancel && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "white", borderRadius: 16, maxWidth: 420, width: "90%", boxShadow: "0 8px 48px rgba(0,0,0,0.18)", overflow: "hidden" }}>
              {withdrawalLoading ? (
                <ProcessingOverlay messages={["退会取り消し処理中...", "もう少しで完了します", "データを更新しています"]} />
              ) : withdrawalSuccess ? (
                <div style={{ padding: "36px 40px" }}>
                  <SuccessOverlay label="退会予約を取り消しました。引き続きご利用いただけます。" />
                </div>
              ) : (
                <div style={{ padding: "36px 40px" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 12 }}>退会をやめますか？</div>
                  <div style={{ fontSize: 13, color: "#666", lineHeight: 1.8, marginBottom: 24 }}>
                    退会予約を取り消すと、<strong>{formatDate(profile.current_period_end)}</strong> 以降も引き続きご利用いただけます。<br />
                    現在のプランはそのまま継続されます。
                  </div>
                  {withdrawalError && (
                    <div style={{ fontSize: 12, color: "#a02020", background: "#ffe8e8", padding: "8px 12px", borderRadius: 8, marginBottom: 12 }}>
                      {withdrawalError}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => { setConfirmWithdrawalCancel(false); setWithdrawalError(null); }}
                      style={{ fontSize: 13, padding: "10px 24px", borderRadius: 20, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#aaa", cursor: "pointer" }}
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleWithdrawalCancel}
                      style={{ fontSize: 13, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}
                    >
                      退会をやめる
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 無料プラン変更取り消し処理中・完了モーダル */}
        {(reactivateLoading || reactivateSuccess) && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "white", borderRadius: 16, maxWidth: 380, width: "90%", boxShadow: "0 8px 48px rgba(0,0,0,0.18)", overflow: "hidden" }}>
              {reactivateLoading ? (
                <ProcessingOverlay messages={["キャンセル取り消し処理中...", "もう少しで完了します", "データを更新しています"]} />
              ) : (
                <div style={{ padding: "36px 40px" }}>
                  <SuccessOverlay label="キャンセルを取り消しました。引き続きご利用いただけます。" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 無料プラン変更確認モーダル */}
        {confirmCancel && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "white", borderRadius: 16, maxWidth: 420, width: "90%", boxShadow: "0 8px 48px rgba(0,0,0,0.18)", overflow: "hidden" }}>
              {cancelLoading ? (
                <ProcessingOverlay messages={["キャンセル処理中...", "もう少しで完了します", "データを更新しています"]} />
              ) : cancelSuccess ? (
                <div style={{ padding: "36px 40px" }}>
                  <SuccessOverlay label="サブスクのキャンセルを受け付けました。期間終了までご利用いただけます。" />
                </div>
              ) : (
                <div style={{ padding: "36px 40px" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 12 }}>サブスクのキャンセルを確認</div>
                  <div style={{ fontSize: 13, color: "#666", lineHeight: 1.8, marginBottom: 24 }}>
                    キャンセルすると、<strong>{formatDate(profile.current_period_end)}</strong> までご利用いただけます。<br />
                    期間終了後は toolio free に移行します。
                  </div>
                  {cancelError && (
                    <div style={{ fontSize: 12, color: "#a02020", background: "#ffe8e8", padding: "8px 12px", borderRadius: 8, marginBottom: 12 }}>
                      {cancelError}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => { setConfirmCancel(false); setCancelError(null); }}
                      style={{ fontSize: 13, padding: "10px 24px", borderRadius: 20, border: "0.5px solid rgba(200,170,240,0.5)", background: "white", color: "#aaa", cursor: "pointer" }}
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleCancel}
                      style={{ fontSize: 13, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}
                    >
                      サブスクをキャンセルする
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {subscriptionResetModal && (
  <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ background: "white", borderRadius: 16, padding: "36px 40px", maxWidth: 460, width: "90%", boxShadow: "0 8px 48px rgba(0,0,0,0.18)" }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#333", marginBottom: 16 }}>プランについてご確認ください</div>
      <div style={{ fontSize: 13, color: "#666", lineHeight: 2, marginBottom: 28 }}>
        お支払い情報に問題が発生したため、現在のプランが toolio free に戻っています。これまでのご請求に変更はありません。プランの再登録は新たなご契約となりますが、二重請求にはなりませんのでご安心ください。引き続きご利用いただくには、プランページから希望のプランを選択して再度ご登録をお願いします。差額が発生する場合は、個別にご連絡の上、適切に対応いたします。
      </div>
      <button
        onClick={() => { setSubscriptionResetModal(false); window.location.reload(); }}
        style={{ width: "100%", padding: "12px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
      >
        プランを確認する →
      </button>
    </div>
  </div>
)}

        {/* 支払い履歴 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "0.5px solid rgba(200,170,240,0.1)", fontSize: 13, fontWeight: 700, color: "#555" }}>支払い履歴</div>
          {invoicesLoading ? (
            <div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ padding: "14px 24px", borderBottom: "0.5px solid rgba(200,170,240,0.07)", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 80px", alignItems: "center", gap: 8 }}>
                  <div className="skeleton" style={{ height: 13, width: "65%" }} />
                  <div className="skeleton" style={{ height: 13, width: "55%" }} />
                  <div className="skeleton" style={{ height: 13, width: "45%" }} />
                  <div className="skeleton" style={{ height: 13, width: "60%" }} />
                </div>
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div style={{ padding: "56px 0", textAlign: "center", color: "#bbb", fontSize: 14 }}>
              <div style={{ marginBottom: 14, display: "flex", justifyContent: "center" }}><BrandIcon name="billing" size={38} color="#dbb0f5" /></div>
              支払い履歴はまだありません
            </div>
          ) : (() => {
            // 月別グループ化
            const groups: { monthLabel: string; items: BillingItem[] }[] = [];
            for (const item of invoices) {
              const d = new Date(item.created * 1000);
              const label = `${d.getFullYear()}年${d.getMonth() + 1}月`;
              const last = groups[groups.length - 1];
              if (last && last.monthLabel === label) last.items.push(item);
              else groups.push({ monthLabel: label, items: [item] });
            }
            const materialMap = Object.fromEntries(allMaterials.map(m => [m.id, m.title]));
            return (
              <div style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 380 }}>
                  <div style={{ padding: "12px 24px", borderBottom: "0.5px solid rgba(200,170,240,0.1)", display: "grid", gridTemplateColumns: "110px 1fr 72px 72px 72px", fontSize: 11, color: "#bbb", fontWeight: 700, gap: 8 }}>
                    <span>日付</span><span>内容</span><span>金額</span><span>種別</span><span></span>
                  </div>
                  {groups.map(({ monthLabel, items }) => (
                    <div key={monthLabel}>
                      <div style={{ padding: "8px 24px", background: "rgba(228,155,253,0.06)", fontSize: 11, fontWeight: 800, color: "#b080d8", borderBottom: "0.5px solid rgba(200,170,240,0.12)" }}>{monthLabel}</div>
                      {items.map((item) => {
                        const d = new Date(item.created * 1000);
                        const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
                        const label = item.type === "purchase"
                          ? (materialMap[item.material_id ?? ""] ?? "単品教材")
                          : "サブスク";
                        return (
                          <div key={item.id} style={{ padding: "13px 24px", borderBottom: "0.5px solid rgba(200,170,240,0.07)", display: "grid", gridTemplateColumns: "110px 1fr 72px 72px 72px", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13, color: "#555" }}>{dateStr}</span>
                            <span style={{ fontSize: 12, color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                            <span style={{ fontSize: 13, color: "#555" }}>¥{item.amount_paid.toLocaleString()}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 10, background: item.type === "purchase" ? "#f0e8ff" : "#e8efff", color: item.type === "purchase" ? "#8040c0" : "#3a5a9a", whiteSpace: "nowrap" }}>
                              {item.type === "purchase" ? "単品" : "サブスク"}
                            </span>
                            {item.invoice_pdf ? (
                              <a href={item.invoice_pdf} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#9b6ed4", textDecoration: "none", fontWeight: 600 }}>領収書↓</a>
                            ) : <span />}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
"use server"
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'toolio <noreply@nihongo-tool.com>'

function formatDate(isoString: string | null) {
  if (!isoString) return '―'
  const d = new Date(isoString)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

// ─── アップグレード完了 ───────────────────────────────────────
export async function sendUpgradeEmail({
  to, planLabel, currentPeriodEnd,
}: {
  to: string
  planLabel: string
  currentPeriodEnd: string | null
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `【toolio】${planLabel}へのアップグレードが完了しました`,
    html: `
      <p>toolioをご利用いただきありがとうございます。</p>
      <p><strong>${planLabel}</strong>へのアップグレードが完了しました。</p>
      <p>次回更新日：${formatDate(currentPeriodEnd)}</p>
      <p>引き続きtoolioをお楽しみください。</p>
      <br />
      <p style="color:#aaa;font-size:12px;">toolio | nihongo-tool.com</p>
    `,
  })
}

// ─── ダウングレード予約完了 ───────────────────────────────────
export async function sendDowngradeEmail({
  to, newPlanLabel, currentPeriodEnd,
}: {
  to: string
  newPlanLabel: string
  currentPeriodEnd: string | null
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `【toolio】プランのダウングレード予約が完了しました`,
    html: `
      <p>toolioをご利用いただきありがとうございます。</p>
      <p>${formatDate(currentPeriodEnd)} に<strong>${newPlanLabel}</strong>へ変更されます。</p>
      <p>それまでは現在のプランをご利用いただけます。</p>
      <br />
      <p style="color:#aaa;font-size:12px;">toolio | nihongo-tool.com</p>
    `,
  })
}

// ─── 無料プランへの変更予約完了 ──────────────────────────────
export async function sendCancelEmail({
  to, currentPeriodEnd,
}: {
  to: string
  currentPeriodEnd: string | null
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `【toolio】無料プランへの変更予約が完了しました`,
    html: `
      <p>toolioをご利用いただきありがとうございます。</p>
      <p>無料プランへの変更予約を承りました。</p>
      <p><strong>${formatDate(currentPeriodEnd)} まで</strong>引き続き現在のプランをご利用いただけます。</p>
      <p>期間終了後は無料プランに移行します。</p>
      <p>ご利用を継続される場合は、マイページの「請求・プラン管理」から変更を取り消すことができます。</p>
      <br />
      <p style="color:#aaa;font-size:12px;">toolio | nihongo-tool.com</p>
    `,
  })
}

// ─── 退会予約完了 ─────────────────────────────────────────────
export async function sendWithdrawalEmail({
  to, currentPeriodEnd,
}: {
  to: string
  currentPeriodEnd: string | null
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `【toolio】退会予約が完了しました`,
    html: `
      <p>toolioをご利用いただきありがとうございます。</p>
      <p>退会予約を承りました。</p>
      <p><strong>${formatDate(currentPeriodEnd)} まで</strong>引き続き現在のプランをご利用いただけます。</p>
      <p>期間終了後、自動的に退会となります。</p>
      <p>いつでも同じメールアドレスで再開できます。お待ちしています。</p>
      <br />
      <p style="color:#aaa;font-size:12px;">toolio | nihongo-tool.com</p>
    `,
  })
}

// ─── トライアル開始 ───────────────────────────────────────────
export async function sendTrialStartEmail({
  to, trialEnd,
}: {
  to: string
  trialEnd: string | null
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `【toolio】14日間の無料トライアルが始まりました`,
    html: `
      <p>toolioをご利用いただきありがとうございます。</p>
      <p>Lightプランの<strong>14日間無料トライアル</strong>が始まりました。</p>
      <p>トライアル終了日：<strong>${formatDate(trialEnd)}</strong></p>
      <p>期間中はLightプランのすべての機能をお使いいただけます。</p>
      <p>トライアル終了後はFreeプランに自動で戻ります。クレジットカードの登録は不要です。</p>
      <br />
      <p style="color:#aaa;font-size:12px;">toolio | nihongo-tool.com</p>
    `,
  })
}

// ─── トライアル終了3日前 ─────────────────────────────────────
export async function sendTrialEndingSoonEmail({
  to, trialEnd,
}: {
  to: string
  trialEnd: string | null
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `【toolio】無料トライアルが3日後に終了します`,
    html: `
      <p>toolioをご利用いただきありがとうございます。</p>
      <p>無料トライアルが<strong>${formatDate(trialEnd)}</strong>に終了します。</p>
      <p>引き続きご利用いただくには、マイページからプランにご登録ください。</p>
      <a href="https://nihongo-tool.com/ja" style="display:inline-block;margin-top:16px;padding:10px 24px;background:linear-gradient(135deg,#f4b9b9,#e49bfd);color:white;border-radius:20px;text-decoration:none;font-weight:700;">プランを確認する</a>
      <br /><br />
      <p style="color:#aaa;font-size:12px;">toolio | nihongo-tool.com</p>
    `,
  })
}

// ─── 決済失敗 ─────────────────────────────────────────────────
export async function sendPaymentFailedEmail({
  to,
}: {
  to: string
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `【toolio】お支払いが確認できませんでした`,
    html: `
      <p>toolioをご利用いただきありがとうございます。</p>
      <p>お支払いが確認できませんでした。クレジットカード情報をご確認ください。</p>
      <p>7日以内にお支払いが確認できない場合、Freeプランに移行します。</p>
      <a href="https://nihongo-tool.com/ja" style="display:inline-block;margin-top:16px;padding:10px 24px;background:linear-gradient(135deg,#f4b9b9,#e49bfd);color:white;border-radius:20px;text-decoration:none;font-weight:700;">カード情報を確認する</a>
      <br /><br />
      <p style="color:#aaa;font-size:12px;">toolio | nihongo-tool.com</p>
    `,
  })
}

// ─── free降格 ─────────────────────────────────────────────────
export async function sendDowngradedToFreeEmail({
  to,
}: {
  to: string
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `【toolio】Freeプランに移行しました`,
    html: `
      <p>toolioをご利用いただきありがとうございます。</p>
      <p>ご利用のプランがFreeプランに移行しました。</p>
      <p>再度ご登録いただくことでいつでも有料プランをご利用いただけます。</p>
      <a href="https://nihongo-tool.com/ja" style="display:inline-block;margin-top:16px;padding:10px 24px;background:linear-gradient(135deg,#f4b9b9,#e49bfd);color:white;border-radius:20px;text-decoration:none;font-weight:700;">プランを確認する</a>
      <br /><br />
      <p style="color:#aaa;font-size:12px;">toolio | nihongo-tool.com</p>
    `,
  })
}
// ─── 管理者への異常通知 ───────────────────────────────────
export async function sendAdminAlertEmail({
  userId,
  event,
}: {
  userId: string
  event: string
}) {
  await resend.emails.send({
    from: FROM,
    to: 'support@nihongo-tool.com',
    subject: `【toolio管理】サブスクリプション異常検知`,
    html: `
      <p>以下のユーザーでサブスクリプション情報の自動リセットが発生しました。</p>
      <p><strong>ユーザーID：</strong>${userId}</p>
      <p><strong>発生箇所：</strong>${event}</p>
      <p>Stripeダッシュボードで差額の確認・クレジット付与が必要な場合があります。</p>
      <p>該当ユーザーへの個別連絡もご確認ください。</p>
      <br />
      <p style="color:#aaa;font-size:12px;">toolio | nihongo-tool.com</p>
    `,
  })
}
/**
 * Shared OTP gateway copy for website customer + partner login UIs.
 * Mirrors admin SMS Setting: WhatsApp (default) vs Custom SMS.
 */

export const OTP_GATEWAY = {
  WHATSAPP: 'whatsapp',
  CUSTOM_SMS: 'custom_sms',
};

export const OTP_GATEWAY_COPY = {
  whatsapp: {
    gateway: 'whatsapp',
    label: 'WhatsApp Number',
    placeholder: 'Please enter the WhatsApp number',
    invalidMessage: 'Please enter the WhatsApp number',
    loginTitle: 'Login with WhatsApp',
    loginSubtitle: "We'll send you a one-time password on WhatsApp",
    sendButton: 'Send OTP on WhatsApp',
    otpSentMessage: 'OTP has been sent to your WhatsApp number',
    otpScreenTitle: 'Verify Your WhatsApp Number',
    otpScreenSubtitle: (phone) =>
      phone
        ? `OTP has been sent to your WhatsApp number (+91 ${phone})`
        : 'OTP has been sent to your WhatsApp number',
    changeNumberLabel: 'Change WhatsApp number',
  },
  custom_sms: {
    gateway: 'custom_sms',
    label: 'Mobile',
    placeholder: 'Please enter valid phone number',
    invalidMessage: 'Please enter valid phone number',
    loginTitle: 'Login with Mobile',
    loginSubtitle: "We'll send you a one-time password via SMS",
    sendButton: 'Send OTP via SMS',
    otpSentMessage: 'OTP has been sent to your phone number via SMS',
    otpScreenTitle: 'Verify Your Mobile Number',
    otpScreenSubtitle: (phone) =>
      phone
        ? `OTP has been sent to your phone number via SMS (+91 ${phone})`
        : 'OTP has been sent to your phone number via SMS',
    changeNumberLabel: 'Change mobile number',
  },
};

export function resolveOtpGateway(value) {
  return value === OTP_GATEWAY.CUSTOM_SMS
    ? OTP_GATEWAY.CUSTOM_SMS
    : OTP_GATEWAY.WHATSAPP;
}

export function getOtpGatewayCopy(gateway) {
  return OTP_GATEWAY_COPY[resolveOtpGateway(gateway)];
}

/**
 * Fetch active OTP gateway from backend (public endpoint).
 * Falls back to WhatsApp if the request fails.
 */
export async function fetchOtpGateway() {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  const fallback = getOtpGatewayCopy(OTP_GATEWAY.WHATSAPP);

  if (!base) return fallback;

  try {
    const response = await fetch(`${base}/app/auth/otp-gateway`, {
      method: 'GET',
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));
    const gateway = resolveOtpGateway(data?.gateway);
    const copy = getOtpGatewayCopy(gateway);
    return {
      ...copy,
      label: data?.label || copy.label,
      placeholder: data?.placeholder || copy.placeholder,
      otpSentMessage: data?.otpSentMessage || copy.otpSentMessage,
      channel: data?.channel || copy.gateway,
    };
  } catch {
    return fallback;
  }
}

import emailjs from "@emailjs/browser";

const EMAILJS_STORAGE_KEY = "apex_emailjs_config";

const DEFAULT_CONFIG = {
  serviceId: "service_fg9773t",
  templateId: "",
  publicKey: "",
  isEnabled: true
};

// Default or persisted configuration
export function getEmailJSConfig() {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return { ...DEFAULT_CONFIG };
  }
  try {
    const saved = localStorage.getItem(EMAILJS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        serviceId: parsed.serviceId || DEFAULT_CONFIG.serviceId,
        templateId: parsed.templateId || DEFAULT_CONFIG.templateId,
        publicKey: parsed.publicKey || DEFAULT_CONFIG.publicKey,
        isEnabled: parsed.isEnabled !== undefined ? parsed.isEnabled : true
      };
    }
  } catch (e) {}

  return { ...DEFAULT_CONFIG };
}

export function saveEmailJSConfig(config) {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return;
  const data = {
    serviceId: (config.serviceId || "").trim(),
    templateId: (config.templateId || "").trim(),
    publicKey: (config.publicKey || "").trim(),
    isEnabled: Boolean(config.isEnabled)
  };
  localStorage.setItem(EMAILJS_STORAGE_KEY, JSON.stringify(data));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("apex_emailjs_config_changed", { detail: data }));
  }
  return data;
}

// Generate direct Gmail Web Compose URL as an instant zero-config fallback
export function generateGmailComposeUrl({ recipientEmail, recipientName, role, activationUrl, tempCode }) {
  const subject = `Official Apex Portal ID Invitation - Action Required to Activate Your Account`;
  const body = `Dear ${recipientName},

You have been registered as ${role} on the official Apex Education Forum Ecosystem.

Please activate your official portal ID and set your permanent password using the secure link below:

🔗 Direct Activation Link:
${activationUrl}

🔑 Temporary Security Code:
${tempCode}

Security Notice:
This invitation was dispatched by the Apex Executive Administration. Please complete your registration within 7 days.

Best regards,
Apex Education Forum Administration
Website: https://apex-education-forum.web.app`;

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Send real automated email via EmailJS directly to inbox
export async function sendActivationEmail({ recipientEmail, recipientName, role, activationUrl, tempCode }) {
  const config = getEmailJSConfig();

  if (!config.serviceId || !config.templateId || !config.publicKey || !config.isEnabled) {
    return {
      success: false,
      unconfigured: true,
      error: "EmailJS is not configured or disabled. Please enter your EmailJS credentials to enable automated inbox delivery."
    };
  }

  const templateParams = {
    to_email: recipientEmail,
    to_name: recipientName,
    recipient_email: recipientEmail,
    recipient_name: recipientName,
    role: role,
    activation_url: activationUrl,
    temp_code: tempCode,
    support_email: "muhammadraufbaloch6@gmail.com",
    forum_name: "Apex Education Forum"
  };

  try {
    const result = await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams,
      config.publicKey
    );

    return {
      success: true,
      status: result.status,
      text: result.text
    };
  } catch (err) {
    console.error("EmailJS dispatch error:", err);
    return {
      success: false,
      error: err?.text || err?.message || "Failed to send email via EmailJS."
    };
  }
}

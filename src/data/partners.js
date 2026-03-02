export const partnerConfig = {
  // ═══════════════════════════════════════════════════════
  // 📱 WHATSAPP PROVIDERS (India + Global)
  // ═══════════════════════════════════════════════════════
  '💚 WhatsApp — Meta (Official Cloud API)': [
    { key:'WA_ACCESS_TOKEN', label:'Permanent Access Token', value:'', type:'password', partner:'Meta', docs:'https://developers.facebook.com/docs/whatsapp/cloud-api' },
    { key:'WA_PHONE_NUMBER_ID', label:'Phone Number ID', value:'', type:'text', partner:'Meta' },
    { key:'WA_BUSINESS_ACCOUNT_ID', label:'WABA ID', value:'', type:'text', partner:'Meta' },
    { key:'WA_VERIFY_TOKEN', label:'Webhook Verify Token', value:'cm_verify_2026', type:'text', partner:'Meta' },
    { key:'WA_APP_SECRET', label:'App Secret', value:'', type:'password', partner:'Meta' },
    { key:'WA_CATALOG_ID', label:'Product Catalog ID', value:'', type:'text', partner:'Meta' },
    { key:'META_APP_ID', label:'Meta App ID', value:'', type:'text', partner:'Meta' },
    { key:'META_PIXEL_ID', label:'Meta Pixel ID', value:'', type:'text', partner:'Meta' },
  ],
  '💚 WhatsApp — Gupshup': [
    { key:'GUPSHUP_WA_API_KEY', label:'API Key', value:'', type:'password', partner:'Gupshup', docs:'https://www.gupshup.io/developer/docs' },
    { key:'GUPSHUP_WA_APP_NAME', label:'App Name', value:'', type:'text', partner:'Gupshup' },
    { key:'GUPSHUP_WA_SOURCE', label:'Source Phone Number', value:'', type:'text', partner:'Gupshup' },
    { key:'GUPSHUP_WA_CALLBACK', label:'Callback URL', value:'', type:'text', partner:'Gupshup' },
  ],
  '💚 WhatsApp — WATI (India)': [
    { key:'WATI_API_URL', label:'API Base URL', value:'https://live-server.wati.io', type:'text', partner:'WATI', docs:'https://docs.wati.io' },
    { key:'WATI_ACCESS_TOKEN', label:'Access Token', value:'', type:'password', partner:'WATI' },
    { key:'WATI_WEBHOOK_URL', label:'Webhook URL', value:'', type:'text', partner:'WATI' },
  ],
  '💚 WhatsApp — Interakt (India)': [
    { key:'INTERAKT_API_KEY', label:'API Key', value:'', type:'password', partner:'Interakt', docs:'https://developer.interakt.ai' },
    { key:'INTERAKT_WA_NUMBER', label:'WhatsApp Number', value:'', type:'text', partner:'Interakt' },
    { key:'INTERAKT_WEBHOOK_SECRET', label:'Webhook Secret', value:'', type:'password', partner:'Interakt' },
  ],
  '💚 WhatsApp — AiSensy (India)': [
    { key:'AISENSY_API_KEY', label:'API Key', value:'', type:'password', partner:'AiSensy', docs:'https://aisensy.com/docs' },
    { key:'AISENSY_PROJECT_ID', label:'Project ID', value:'', type:'text', partner:'AiSensy' },
    { key:'AISENSY_CALLBACK', label:'Callback URL', value:'', type:'text', partner:'AiSensy' },
  ],
  '💚 WhatsApp — Twilio': [
    { key:'TWILIO_WA_SID', label:'Account SID', value:'', type:'text', partner:'Twilio', docs:'https://www.twilio.com/docs/whatsapp' },
    { key:'TWILIO_WA_TOKEN', label:'Auth Token', value:'', type:'password', partner:'Twilio' },
    { key:'TWILIO_WA_FROM', label:'From (whatsapp:+14155238886)', value:'', type:'text', partner:'Twilio' },
  ],
  '💚 WhatsApp — MessageBird': [
    { key:'MBIRD_WA_KEY', label:'API Key', value:'', type:'password', partner:'MessageBird', docs:'https://developers.messagebird.com' },
    { key:'MBIRD_WA_CHANNEL', label:'Channel ID', value:'', type:'text', partner:'MessageBird' },
  ],
  '💚 WhatsApp — 360dialog': [
    { key:'D360_API_KEY', label:'API Key', value:'', type:'password', partner:'360dialog', docs:'https://docs.360dialog.com' },
    { key:'D360_WA_NUMBER', label:'Phone Number', value:'', type:'text', partner:'360dialog' },
    { key:'D360_NAMESPACE', label:'Template Namespace', value:'', type:'text', partner:'360dialog' },
  ],
  '💚 WhatsApp — Kaleyra (India)': [
    { key:'KALEYRA_WA_API_KEY', label:'API Key', value:'', type:'password', partner:'Kaleyra', docs:'https://developers.kaleyra.io' },
    { key:'KALEYRA_WA_SID', label:'SID', value:'', type:'text', partner:'Kaleyra' },
    { key:'KALEYRA_WA_FROM', label:'From Number', value:'', type:'text', partner:'Kaleyra' },
  ],

  // ═══════════════════════════════════════════════════════
  // 📨 SMS PROVIDERS (India + Global)
  // ═══════════════════════════════════════════════════════
  '📨 SMS — MSG91 (India)': [
    { key:'MSG91_AUTH_KEY', label:'Auth Key', value:'', type:'password', partner:'MSG91', docs:'https://docs.msg91.com' },
    { key:'MSG91_SENDER_ID', label:'Sender ID (6 chars)', value:'CHRMFL', type:'text', partner:'MSG91' },
    { key:'MSG91_TEMPLATE_ID', label:'OTP Template ID (DLT)', value:'', type:'text', partner:'MSG91' },
    { key:'MSG91_ROUTE', label:'Route (4=transactional)', value:'4', type:'text', partner:'MSG91' },
  ],
  '📨 SMS — Textlocal (India)': [
    { key:'TEXTLOCAL_API_KEY', label:'API Key', value:'', type:'password', partner:'Textlocal', docs:'https://api.textlocal.in/docs' },
    { key:'TEXTLOCAL_SENDER', label:'Sender ID', value:'CHRMFL', type:'text', partner:'Textlocal' },
    { key:'TEXTLOCAL_TEMPLATE_ID', label:'DLT Template ID', value:'', type:'text', partner:'Textlocal' },
  ],
  '📨 SMS — Kaleyra (India)': [
    { key:'KALEYRA_SMS_API_KEY', label:'API Key', value:'', type:'password', partner:'Kaleyra', docs:'https://developers.kaleyra.io' },
    { key:'KALEYRA_SMS_SID', label:'SID', value:'', type:'text', partner:'Kaleyra' },
    { key:'KALEYRA_SMS_SENDER', label:'Sender ID', value:'CHRMFL', type:'text', partner:'Kaleyra' },
  ],
  '📨 SMS — Gupshup (India)': [
    { key:'GUPSHUP_SMS_USER', label:'User ID', value:'', type:'text', partner:'Gupshup', docs:'https://www.gupshup.io/developer/sms-api' },
    { key:'GUPSHUP_SMS_PASS', label:'Password', value:'', type:'password', partner:'Gupshup' },
    { key:'GUPSHUP_SMS_MASK', label:'Mask (Sender ID)', value:'CHRMFL', type:'text', partner:'Gupshup' },
  ],
  '📨 SMS — 2Factor (India)': [
    { key:'TWOFACTOR_API_KEY', label:'API Key', value:'', type:'password', partner:'2Factor', docs:'https://2factor.in/v3' },
    { key:'TWOFACTOR_TEMPLATE', label:'OTP Template Name', value:'', type:'text', partner:'2Factor' },
  ],
  '📨 SMS — ValueFirst (India)': [
    { key:'VF_SMS_USER', label:'Username', value:'', type:'text', partner:'ValueFirst', docs:'https://www.valuefirst.com' },
    { key:'VF_SMS_PASS', label:'Password', value:'', type:'password', partner:'ValueFirst' },
    { key:'VF_SMS_FROM', label:'Sender ID', value:'CHRMFL', type:'text', partner:'ValueFirst' },
    { key:'VF_SMS_PE_ID', label:'DLT PE ID', value:'', type:'text', partner:'ValueFirst' },
  ],
  '📨 SMS — Pinnacle (India)': [
    { key:'PINNACLE_API_KEY', label:'API Key', value:'', type:'password', partner:'Pinnacle', docs:'https://www.pinnacle.in' },
    { key:'PINNACLE_SENDER', label:'Sender ID', value:'CHRMFL', type:'text', partner:'Pinnacle' },
    { key:'PINNACLE_ENTITY_ID', label:'DLT Entity ID', value:'', type:'text', partner:'Pinnacle' },
  ],
  '📨 SMS — Twilio (Global)': [
    { key:'TWILIO_SID', label:'Account SID', value:'', type:'text', partner:'Twilio', docs:'https://www.twilio.com/docs/sms' },
    { key:'TWILIO_TOKEN', label:'Auth Token', value:'', type:'password', partner:'Twilio' },
    { key:'TWILIO_FROM', label:'From Number', value:'', type:'text', partner:'Twilio' },
    { key:'TWILIO_MSG_SVC', label:'Messaging Service SID', value:'', type:'text', partner:'Twilio' },
  ],
  '📨 SMS — Vonage / Nexmo (Global)': [
    { key:'VONAGE_API_KEY', label:'API Key', value:'', type:'text', partner:'Vonage', docs:'https://developer.vonage.com/messaging/sms' },
    { key:'VONAGE_API_SECRET', label:'API Secret', value:'', type:'password', partner:'Vonage' },
    { key:'VONAGE_FROM', label:'From Number / Brand', value:'MEHFIL', type:'text', partner:'Vonage' },
  ],
  '📨 SMS — Sinch (Global)': [
    { key:'SINCH_APP_ID', label:'App ID', value:'', type:'text', partner:'Sinch', docs:'https://developers.sinch.com/docs/sms' },
    { key:'SINCH_APP_SECRET', label:'App Secret', value:'', type:'password', partner:'Sinch' },
    { key:'SINCH_SVC_PLAN', label:'Service Plan ID', value:'', type:'text', partner:'Sinch' },
  ],
  '📨 SMS — Plivo (Global)': [
    { key:'PLIVO_AUTH_ID', label:'Auth ID', value:'', type:'text', partner:'Plivo', docs:'https://www.plivo.com/docs/sms' },
    { key:'PLIVO_AUTH_TOKEN', label:'Auth Token', value:'', type:'password', partner:'Plivo' },
    { key:'PLIVO_FROM', label:'From Number', value:'', type:'text', partner:'Plivo' },
  ],
  '📨 SMS — AWS SNS (Global)': [
    { key:'AWS_SNS_ACCESS_KEY', label:'Access Key ID', value:'', type:'text', partner:'AWS SNS', docs:'https://docs.aws.amazon.com/sns' },
    { key:'AWS_SNS_SECRET_KEY', label:'Secret Key', value:'', type:'password', partner:'AWS SNS' },
    { key:'AWS_SNS_REGION', label:'Region', value:'ap-south-1', type:'text', partner:'AWS SNS' },
    { key:'AWS_SNS_SENDER_ID', label:'Sender ID', value:'MEHFIL', type:'text', partner:'AWS SNS' },
  ],

  // ═══════════════════════════════════════════════════════
  // 📧 EMAIL PROVIDERS (India + Global)
  // ═══════════════════════════════════════════════════════
  '📧 Email — SendGrid (Global)': [
    { key:'SENDGRID_API_KEY', label:'API Key', value:'', type:'password', partner:'SendGrid', docs:'https://docs.sendgrid.com' },
    { key:'SENDGRID_FROM_EMAIL', label:'From Email', value:'orders@charminarmehfil.com', type:'text', partner:'SendGrid' },
    { key:'SENDGRID_FROM_NAME', label:'From Name', value:'Charminar Mehfil', type:'text', partner:'SendGrid' },
    { key:'SENDGRID_TEMPLATE_ORDER', label:'Order Template ID', value:'', type:'text', partner:'SendGrid' },
    { key:'SENDGRID_TEMPLATE_OTP', label:'OTP Template ID', value:'', type:'text', partner:'SendGrid' },
    { key:'SENDGRID_WEBHOOK_KEY', label:'Webhook Signing Key', value:'', type:'password', partner:'SendGrid' },
  ],
  '📧 Email — AWS SES (Global)': [
    { key:'SES_ACCESS_KEY', label:'Access Key ID', value:'', type:'text', partner:'AWS SES', docs:'https://docs.aws.amazon.com/ses' },
    { key:'SES_SECRET_KEY', label:'Secret Access Key', value:'', type:'password', partner:'AWS SES' },
    { key:'SES_REGION', label:'Region', value:'ap-south-1', type:'text', partner:'AWS SES' },
    { key:'SES_FROM_EMAIL', label:'Verified From Email', value:'', type:'text', partner:'AWS SES' },
    { key:'SES_CONFIG_SET', label:'Config Set Name', value:'', type:'text', partner:'AWS SES' },
  ],
  '📧 Email — Mailgun (Global)': [
    { key:'MAILGUN_API_KEY', label:'API Key', value:'', type:'password', partner:'Mailgun', docs:'https://documentation.mailgun.com' },
    { key:'MAILGUN_DOMAIN', label:'Domain', value:'mg.charminarmehfil.com', type:'text', partner:'Mailgun' },
    { key:'MAILGUN_FROM', label:'From Address', value:'Charminar Mehfil <noreply@charminarmehfil.com>', type:'text', partner:'Mailgun' },
    { key:'MAILGUN_WEBHOOK_KEY', label:'Webhook Signing Key', value:'', type:'password', partner:'Mailgun' },
  ],
  '📧 Email — Postmark (Global)': [
    { key:'POSTMARK_SERVER_TOKEN', label:'Server Token', value:'', type:'password', partner:'Postmark', docs:'https://postmarkapp.com/developer' },
    { key:'POSTMARK_FROM_EMAIL', label:'From Email', value:'', type:'text', partner:'Postmark' },
    { key:'POSTMARK_STREAM_TRANSACT', label:'Transactional Stream ID', value:'outbound', type:'text', partner:'Postmark' },
    { key:'POSTMARK_STREAM_BROADCAST', label:'Broadcast Stream ID', value:'broadcast', type:'text', partner:'Postmark' },
  ],
  '📧 Email — Resend (Global)': [
    { key:'RESEND_API_KEY', label:'API Key', value:'', type:'password', partner:'Resend', docs:'https://resend.com/docs' },
    { key:'RESEND_FROM_EMAIL', label:'From Email', value:'', type:'text', partner:'Resend' },
    { key:'RESEND_FROM_NAME', label:'From Name', value:'Charminar Mehfil', type:'text', partner:'Resend' },
  ],
  '📧 Email — Brevo / Sendinblue (Global)': [
    { key:'BREVO_API_KEY', label:'API Key (v3)', value:'', type:'password', partner:'Brevo', docs:'https://developers.brevo.com' },
    { key:'BREVO_FROM_EMAIL', label:'From Email', value:'', type:'text', partner:'Brevo' },
    { key:'BREVO_FROM_NAME', label:'From Name', value:'Charminar Mehfil', type:'text', partner:'Brevo' },
    { key:'BREVO_TEMPLATE_OTP', label:'OTP Template ID', value:'', type:'text', partner:'Brevo' },
  ],
  '📧 Email — Zoho Mail (India)': [
    { key:'ZOHO_SMTP_USER', label:'Email Address', value:'', type:'text', partner:'Zoho', docs:'https://www.zoho.com/mail/help/api' },
    { key:'ZOHO_SMTP_PASS', label:'App Password', value:'', type:'password', partner:'Zoho' },
    { key:'ZOHO_SMTP_HOST', label:'SMTP Host', value:'smtp.zoho.in', type:'text', partner:'Zoho' },
    { key:'ZOHO_SMTP_PORT', label:'SMTP Port', value:'587', type:'text', partner:'Zoho' },
  ],
  '📧 Email — Pepipost / Netcore (India)': [
    { key:'PEPIPOST_API_KEY', label:'API Key', value:'', type:'password', partner:'Pepipost', docs:'https://netcorecloud.com/email-api' },
    { key:'PEPIPOST_FROM_EMAIL', label:'From Email', value:'', type:'text', partner:'Pepipost' },
    { key:'PEPIPOST_FROM_NAME', label:'From Name', value:'Charminar Mehfil', type:'text', partner:'Pepipost' },
  ],
  '📧 Email — Mailchimp / Mandrill (Global)': [
    { key:'MANDRILL_API_KEY', label:'API Key', value:'', type:'password', partner:'Mailchimp', docs:'https://mandrillapp.com/api/docs' },
    { key:'MANDRILL_FROM_EMAIL', label:'From Email', value:'', type:'text', partner:'Mailchimp' },
    { key:'MANDRILL_SUBACCOUNT', label:'Sub-Account', value:'', type:'text', partner:'Mailchimp' },
  ],
  '📧 Email — SMTP (Custom)': [
    { key:'SMTP_HOST', label:'SMTP Host', value:'', type:'text', partner:'SMTP' },
    { key:'SMTP_PORT', label:'SMTP Port', value:'587', type:'text', partner:'SMTP' },
    { key:'SMTP_USER', label:'Username', value:'', type:'text', partner:'SMTP' },
    { key:'SMTP_PASS', label:'Password', value:'', type:'password', partner:'SMTP' },
    { key:'SMTP_FROM', label:'From Address', value:'', type:'text', partner:'SMTP' },
    { key:'SMTP_TLS', label:'Use TLS', value:'true', type:'toggle', partner:'SMTP' },
  ],

  // ═══════════════════════════════════════════════════════
  // 💳 PAYMENTS
  // ═══════════════════════════════════════════════════════
  '💳 Payment — Razorpay (India)': [
    { key:'RZP_KEY_ID', label:'Key ID', value:'', type:'text', partner:'Razorpay', docs:'https://razorpay.com/docs' },
    { key:'RZP_KEY_SECRET', label:'Key Secret', value:'', type:'password', partner:'Razorpay' },
    { key:'RZP_WEBHOOK_SECRET', label:'Webhook Secret', value:'', type:'password', partner:'Razorpay' },
  ],
  '💳 Payment — Cashfree (India)': [
    { key:'CF_APP_ID', label:'App ID', value:'', type:'text', partner:'Cashfree', docs:'https://docs.cashfree.com' },
    { key:'CF_SECRET_KEY', label:'Secret Key', value:'', type:'password', partner:'Cashfree' },
  ],
  '💳 Payment — PayU (India)': [
    { key:'PAYU_MERCHANT_KEY', label:'Merchant Key', value:'', type:'text', partner:'PayU', docs:'https://devguide.payu.in' },
    { key:'PAYU_MERCHANT_SALT', label:'Merchant Salt', value:'', type:'password', partner:'PayU' },
  ],
  '💳 Payment — Stripe (Global)': [
    { key:'STRIPE_PK', label:'Publishable Key', value:'', type:'text', partner:'Stripe', docs:'https://stripe.com/docs' },
    { key:'STRIPE_SK', label:'Secret Key', value:'', type:'password', partner:'Stripe' },
    { key:'STRIPE_WEBHOOK_SECRET', label:'Webhook Secret', value:'', type:'password', partner:'Stripe' },
  ],

  // ═══════════════════════════════════════════════════════
  // 🛵 DELIVERY
  // ═══════════════════════════════════════════════════════
  '🛵 Delivery — Dunzo (Chennai/Hyd)': [
    { key:'DUNZO_CLIENT_ID', label:'Client ID', value:'', type:'text', partner:'Dunzo', docs:'https://www.dunzo.com/business' },
    { key:'DUNZO_SECRET', label:'Client Secret', value:'', type:'password', partner:'Dunzo' },
    { key:'DUNZO_WEBHOOK', label:'Webhook URL', value:'', type:'text', partner:'Dunzo' },
  ],
  '🛵 Delivery — Swiggy Genie': [
    { key:'SWIGGY_GENIE_KEY', label:'API Key', value:'', type:'password', partner:'Swiggy Genie', docs:'https://www.swiggy.com/genie' },
    { key:'SWIGGY_GENIE_MERCHANT', label:'Merchant ID', value:'', type:'text', partner:'Swiggy Genie' },
  ],
  '🛵 Delivery — Porter': [
    { key:'PORTER_API_KEY', label:'API Key', value:'', type:'password', partner:'Porter', docs:'https://porter.in' },
    { key:'PORTER_WEBHOOK', label:'Webhook URL', value:'', type:'text', partner:'Porter' },
  ],
  '🛵 Delivery — Shadowfax': [
    { key:'SHADOWFAX_TOKEN', label:'API Token', value:'', type:'password', partner:'Shadowfax', docs:'https://www.shadowfax.in' },
    { key:'SHADOWFAX_CLIENT', label:'Client Code', value:'', type:'text', partner:'Shadowfax' },
  ],
  '🛵 Delivery — Borzo (WeFast)': [
    { key:'BORZO_API_KEY', label:'API Key', value:'', type:'password', partner:'Borzo', docs:'https://borzo.net' },
    { key:'BORZO_SECRET', label:'Secret', value:'', type:'password', partner:'Borzo' },
  ],
  '🛵 Delivery — Loadshare': [
    { key:'LOADSHARE_KEY', label:'API Key', value:'', type:'password', partner:'Loadshare', docs:'https://loadshare.net' },
    { key:'LOADSHARE_SECRET', label:'Secret', value:'', type:'password', partner:'Loadshare' },
  ],
  '🛵 Delivery — Pidge': [
    { key:'PIDGE_API_KEY', label:'API Key', value:'', type:'password', partner:'Pidge', docs:'https://www.pidge.in' },
    { key:'PIDGE_MERCHANT', label:'Merchant ID', value:'', type:'text', partner:'Pidge' },
  ],
  '🛵 Delivery — Rapido B2B': [
    { key:'RAPIDO_API_KEY', label:'API Key', value:'', type:'password', partner:'Rapido', docs:'https://www.rapido.bike' },
    { key:'RAPIDO_MERCHANT', label:'Merchant ID', value:'', type:'text', partner:'Rapido' },
  ],
  '🛵 Delivery — Zypp Electric': [
    { key:'ZYPP_API_KEY', label:'API Key', value:'', type:'password', partner:'Zypp', docs:'https://zyppelectric.com' },
    { key:'ZYPP_HUB_ID', label:'Hub ID', value:'', type:'text', partner:'Zypp' },
  ],
  '🛵 Delivery — Shiprocket': [
    { key:'SHIPROCKET_EMAIL', label:'Email', value:'', type:'text', partner:'Shiprocket', docs:'https://www.shiprocket.in' },
    { key:'SHIPROCKET_PASS', label:'Password', value:'', type:'password', partner:'Shiprocket' },
    { key:'SHIPROCKET_CHANNEL', label:'Channel ID', value:'', type:'text', partner:'Shiprocket' },
  ],
  '🛵 Delivery — Delhivery': [
    { key:'DELHIVERY_TOKEN', label:'API Token', value:'', type:'password', partner:'Delhivery', docs:'https://www.delhivery.com' },
    { key:'DELHIVERY_WAREHOUSE', label:'Warehouse Name', value:'', type:'text', partner:'Delhivery' },
  ],
  '🛵 Delivery — Ecom Express': [
    { key:'ECOM_USERNAME', label:'Username', value:'', type:'text', partner:'Ecom Express', docs:'https://ecomexpress.in' },
    { key:'ECOM_PASSWORD', label:'Password', value:'', type:'password', partner:'Ecom Express' },
  ],

  // ═══════════════════════════════════════════════════════
  // 🌍 ANALYTICS & MAPS
  // ═══════════════════════════════════════════════════════
  '🌍 Analytics & Maps': [
    { key:'GA4_ID', label:'GA4 Measurement ID', value:'', type:'text', partner:'Google' },
    { key:'GOOGLE_MAPS_KEY', label:'Google Maps API Key', value:'', type:'password', partner:'Google' },
    { key:'MIXPANEL_TOKEN', label:'Mixpanel Token', value:'', type:'text', partner:'Mixpanel' },
    { key:'SEGMENT_WRITE_KEY', label:'Segment Write Key', value:'', type:'password', partner:'Segment' },
    { key:'SENTRY_DSN', label:'Sentry DSN', value:'', type:'text', partner:'Sentry' },
    { key:'CLEVERTAP_ACCOUNT', label:'CleverTap Account ID', value:'', type:'text', partner:'CleverTap' },
    { key:'CLEVERTAP_PASSCODE', label:'CleverTap Passcode', value:'', type:'password', partner:'CleverTap' },
    { key:'MOENGAGE_APP_ID', label:'MoEngage App ID', value:'', type:'text', partner:'MoEngage' },
    { key:'MOENGAGE_KEY', label:'MoEngage Data API Key', value:'', type:'password', partner:'MoEngage' },
  ],
};

export function getPartnerDefaults() {
  const defaults = {};
  Object.values(partnerConfig).flat().forEach(p => { defaults[p.key] = p.value; });
  return defaults;
}

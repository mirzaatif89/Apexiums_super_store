export const WHATSAPP_NUMBER = '923391717571';

export function getWhatsAppUrl(message = 'Hello, I need assistance from Elistin customer support.') {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message) {
  const url = getWhatsAppUrl(message);
  const whatsappWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (!whatsappWindow) window.location.assign(url);
}

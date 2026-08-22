export const WHATSAPP_NUMBER = '923391717571';

export function getWhatsAppUrl(message = 'Assalam-o-Alaikum, mujhe Apexiums customer support se madad chahiye.') {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message) {
  window.location.href = getWhatsAppUrl(message);
}

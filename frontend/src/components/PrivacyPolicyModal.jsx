import React from 'react';
import { X } from 'lucide-react';

export const openPrivacyPolicy = () => window.dispatchEvent(new Event('elistin-open-privacy-policy'));

const sections = [
  ['1. Information We Collect', ['When you use our platform, we may collect:', ['Your name', 'Email address', 'Phone number', 'Delivery and billing address', 'Account information', 'Order and purchase history', 'Payment and transaction information', 'Product reviews and feedback', 'Information about how you use our app or website', 'Device and technical information']]],
  ['2. How We Use Your Information', ['We use your information to:', ['Create and manage your account', 'Process and deliver your orders', 'Process payments and refunds', 'Provide customer support', 'Send order confirmations and delivery updates', 'Improve our products and services', 'Personalize your shopping experience', 'Detect and prevent fraud or unauthorized activity', 'Comply with applicable laws and legal requirements']]],
  ['3. Payment Information', ['Payments may be processed through third-party payment providers. We use appropriate security measures to help protect your payment information. We do not use your payment information for purposes unrelated to processing your transactions, except where permitted or required by law.']],
  ['4. Sharing Your Information', ['We may share necessary information with trusted service providers, such as payment processors, delivery companies, hosting providers, customer-support services, and other partners who help us operate our platform.', 'We may also disclose information when required by law or when necessary to protect our rights, users, or platform.']],
  ['5. Cookies and Tracking Technologies', ['We may use cookies and similar technologies to remember your preferences, keep you signed in, analyze platform usage, improve performance, and provide a better shopping experience.']],
  ['6. Data Security', ['We take reasonable technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.', 'However, no online service can guarantee complete security of information.']],
  ['7. Your Privacy Rights', ['Depending on applicable laws, you may have the right to:', ['Access your personal information', 'Correct inaccurate information', 'Request deletion of your information', 'Withdraw certain consents', 'Manage marketing communications', 'Request information about how your data is used'], 'You can contact us to exercise applicable privacy rights.']],
  ['8. Third-Party Services', ['Our platform may contain links or integrations with third-party services. We are not responsible for the privacy practices of third-party websites or services. We recommend reviewing their privacy policies before providing them with your information.']],
  ["9. Children's Privacy", ['Our platform is not intended for children where prohibited by applicable law. We do not knowingly collect personal information from children without appropriate authorization.']],
  ['10. Changes to This Privacy Policy', ['We may update this Privacy Policy from time to time. When we make changes, we will update the “Last Updated” date and, where appropriate, notify you through the platform.']],
  ['11. Contact Us', ['If you have questions about this Privacy Policy or how we handle your information, please contact us:', 'Email: elistin.com@gmail.com', 'Phone: 03391717571']]
];

export function PrivacyPolicyContent() {
  return <div className="space-y-5 text-sm leading-6 text-slate-600"><p>Welcome to Elistin.Com. We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains what information we collect, how we use it, how we protect it, and your rights regarding your information when you use our e-commerce platform.</p>{sections.map(([heading, content]) => <section key={heading} className="space-y-2"><h4 className="font-black text-slate-900">{heading}</h4>{content.map((item, index) => Array.isArray(item) ? <ul key={index} className="list-disc space-y-1 pl-5">{item.map((entry) => <li key={entry}>{entry}</li>)}</ul> : <p key={index}>{item}</p>)}</section>)}<p className="font-semibold text-slate-800">By using our platform, you acknowledge that you have read and understood this Privacy Policy.</p></div>;
}

export default function PrivacyPolicyModal() {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => { const show = () => setOpen(true); window.addEventListener('elistin-open-privacy-policy', show); return () => window.removeEventListener('elistin-open-privacy-policy', show); }, []);
  React.useEffect(() => { if (!open) return undefined; const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous; }; }, [open]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm"><div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b px-5 py-4 sm:px-7"><div><h2 className="text-xl font-black text-slate-900">Privacy Policy</h2><p className="text-xs text-slate-500">Elistin.Com</p></div><button type="button" onClick={() => setOpen(false)} className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"><X size={20}/></button></div><div className="overflow-y-auto px-5 py-5 sm:px-7"><PrivacyPolicyContent/></div></div></div>;
}

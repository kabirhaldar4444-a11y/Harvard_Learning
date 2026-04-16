import React, { useState } from 'react';
import supabase from '../utils/supabase';

const DisclaimerOverlay = ({ user, profile }) => {
  const [disclaimerCheckbox, setDisclaimerCheckbox] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  // Visibility Logic
  const userId = user?.id || profile?.id;
  const isSessionAccepted = sessionStorage.getItem(`disclaimer_accepted_${userId}`);

  if ((profile?.disclaimer_accepted === true && profile?.profile_completed === true) || isSessionAccepted) {
    return null; 
  }

  const handleAccept = async () => {
    if (!disclaimerCheckbox) return;
    setIsAccepting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ disclaimer_accepted: true })
        .eq('id', userId);
      if (error) throw error;
      sessionStorage.setItem(`disclaimer_accepted_${userId}`, 'true');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error('Error accepting disclaimer:', err);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] scale-in-center border border-slate-200">
        
        {/* Header - Fixed */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-5 shrink-0 bg-slate-50/50">
          <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg">
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 leading-none">Privacy Policy</h2>
            <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-1">Elitetoolistic Official Protection</p>
          </div>
        </div>

        {/* Content Area - Scrollable with exactly provided text */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar-light select-text">
          <div className="space-y-8 text-slate-700 leading-relaxed text-sm">
            
            {/* Information We Collect */}
            <div>
              <h3 className="text-base font-black text-slate-900 mb-2">Information We Collect</h3>
              <p className="mb-4">We collect the following types of information to ensure smooth operation of our services:</p>
              
              <div className="space-y-4">
                <div>
                  <p className="font-bold underline decoration-slate-200 underline-offset-4 mb-1">Personal Information:</p>
                  <p>Your name, email address, contact number, and country of residence collected during registration or inquiries.</p>
                </div>
                <div>
                  <p className="font-bold underline decoration-slate-200 underline-offset-4 mb-1">Payment Information:</p>
                  <p>Transaction details (amount, date, and payment method). We do not store complete payment card or crypto wallet details.</p>
                </div>
                <div>
                  <p className="font-bold underline decoration-slate-200 underline-offset-4 mb-1">Course and Usage Data:</p>
                  <p>Information about the courses you enroll in, your progress, assessments, and interactions with our online learning platform.</p>
                </div>
                <div>
                  <p className="font-bold underline decoration-slate-200 underline-offset-4 mb-1">Technical Information:</p>
                  <p>Device type, IP address, browser version, and cookies to improve website performance and user experience.</p>
                </div>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div>
              <h3 className="text-base font-black text-slate-900 mb-2">How We Use Your Information</h3>
              <p className="mb-4">We use your information to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Process your course enrollment and payments.</li>
                <li>Provide access to study materials, exams, and course completion certificates.</li>
                <li>Communicate important updates, reminders, and support-related information.</li>
                <li>Improve course quality, website functionality, and user experience.</li>
                <li>Maintain compliance with our internal policies and applicable laws.</li>
              </ul>
              <p className="mt-4 font-bold">We do not sell, trade, or rent your personal information to any third party.</p>
            </div>

            {/* Data Storage and Security */}
            <div>
              <h3 className="text-base font-black text-slate-900 mb-4">Data Storage and Security</h3>
              <ul className="space-y-3">
                <li>All personal data is stored securely in encrypted databases.</li>
                <li>Only authorized Elitetoolistic personnel have access to user data.</li>
                <li>We regularly update our systems and employ security measures such as SSL encryption to protect against unauthorized access, alteration, or disclosure.</li>
              </ul>
            </div>

            {/* Payment & Financial Data */}
            <div>
              <h3 className="text-base font-black text-slate-900 mb-4">Payment & Financial Data</h3>
              <ul className="space-y-3">
                <li>All personal data is stored securely in encrypted databases.</li>
                <li>Only authorized Elitetoolistic personnel have access to user data.</li>
                <li>We regularly update our systems and employ security measures such as SSL encryption to protect against unauthorized access, alteration, or disclosure.</li>
              </ul>
            </div>

            {/* Use of Cookies */}
            <div>
              <h3 className="text-base font-black text-slate-900 mb-2">Use of Cookies</h3>
              <p className="mb-4">Our website uses cookies to:</p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Enhance your browsing experience.</li>
                <li>Save login preferences.</li>
                <li>Analyze site traffic and improve user experience.</li>
              </ul>
              <p>You can choose to disable cookies from your browser settings; however, some website features may not function properly as a result.</p>
            </div>

            {/* Data Retention */}
            <div>
              <h3 className="text-base font-black text-slate-900 mb-2">Data Retention</h3>
              <p>We retain your personal information for as long as necessary to fulfill course delivery and legal obligations. Once no longer needed, your data will be securely deleted or anonymized.</p>
            </div>

            {/* Third-Party Links */}
            <div>
              <h3 className="text-base font-black text-slate-900 mb-2">Third-Party Links</h3>
              <p>Our website may contain links to third-party websites (e.g., payment gateways or educational partners). Elitetoolistic is not responsible for the privacy practices or content of these external sites.</p>
            </div>

            {/* Your Rights */}
            <div>
              <h3 className="text-base font-black text-slate-900 mb-2">Your Rights</h3>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Access the information we hold about you.</li>
                <li>Request correction or deletion of inaccurate data.</li>
                <li>Withdraw consent for marketing communications at any time.</li>
              </ul>
              <p>To exercise these rights, please contact our support team at <span className="text-primary-600 font-bold">support@elitetoolistic.com</span>.</p>
            </div>

            {/* Policy Updates */}
            <div className="pt-6 border-t border-slate-100 italic text-[11px] text-slate-500 text-center">
              <h3 className="text-xs font-black text-slate-900 not-italic uppercase tracking-widest mb-2">Policy Updates</h3>
              <p>
                Elitetoolistic OPC Pvt Ltd and PayG, reserves the right to update or modify this Privacy Policy at any time without prior notice. The revised version will be posted on our website with an updated effective date.
              </p>
            </div>
          </div>
        </div>

        {/* Actions - Fixed Footer */}
        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex flex-col gap-4">
            <label className="flex items-start gap-4 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={disclaimerCheckbox}
                onChange={(e) => setDisclaimerCheckbox(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-600/20 transition-all"
              />
              <span className="text-[12px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                I acknowledge that I have read and agree to the <span className="text-primary-600 font-black">Elitetoolistic Privacy Policy</span>.
              </span>
            </label>

            <button
              onClick={handleAccept}
              disabled={!disclaimerCheckbox || isAccepting}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all duration-300 ${
                disclaimerCheckbox && !isAccepting
                  ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-xl shadow-primary-600/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isAccepting ? 'Processing...' : (
                <>
                  Accept Agreement
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerOverlay;

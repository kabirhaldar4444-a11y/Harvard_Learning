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
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 leading-none uppercase">Harvard Learning Terms & Conditions</h2>
            <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-1">Please read carefully</p>
          </div>
        </div>

        {/* Content Area - Scrollable with exactly provided text */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar-light select-text">
          <div className="space-y-16">
            
            {/* 01 Service Delivery */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">01</div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.25em]">Service Delivery</h3>
              </div>
              <div className="pl-10 space-y-10 border-l border-slate-100">
                <div>
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2.5">Enrollment Process</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Customers visit the Harvard Learning website and fill out the Enrollment Form. After form submission, Our team connects with the customer. A detailed email is shared explaining the complete process flow and fee structure. Payments may also be accepted directly through an authorized professional expert trainer account, where applicable.</p>
                </div>
                <div>
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2.5">Process Explanation & Confirmation</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">During the call, the team explains the course structure, learning journey, and assessment-to-certification flow. The customer then confirms their participation in the program.</p>
                </div>
                <div>
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2.5">Fee Payment</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Upon successful completion of the fee payment, a GST-compliant invoice is issued within 6 hours. Pre-examination study materials are shared with the learner within 24 hours.</p>
                </div>
                <div>
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2.5">Pre-Exam</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">A Pre-Exam is conducted within 24–48 hours of fee payment. This exam assesses the customer’s initial understanding of the selected domain. Before the exam, the Guidance Team connects to explain the exam process.</p>
                </div>
                <div>
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2.5">Pre-Exam Result & Pre-Board Professional Certificate</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Results are shared within 24–48 hours via email. A Pre-Board Professional Certificate is issued with “Under Training” mentioned.</p>
                </div>
                <div>
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2.5">Reward Eligibility</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Customers scoring above 80% become eligible for a gift. One gift can be selected from four available options, which will be delivered accordingly.</p>
                </div>
                <div>
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2.5">Self-Paced Training</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Access to recorded video lectures is shared within 15 days on payment. Training duration is 90–120 days.</p>
                </div>
                <div>
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2.5">Final Exam</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">A Final Exam is conducted between 90-120 days.</p>
                </div>
                <div>
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2.5">Final Certificate</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Upon successful completion of all requirements, the Final Certificate is issued. The certificate will clearly state the status as “Certified.”</p>
                </div>
                <div>
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2.5">Continuous Support</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Throughout the entire journey, the Harvard Learning team remains in contact for guidance and support.</p>
                </div>
              </div>
            </section>

            {/* 02 Terms & Conditions */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">02</div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.25em]">Terms & Conditions</h3>
              </div>
              <div className="pl-4 space-y-12 border-l border-slate-100">
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Course Duration and Delivery</h4>
                  <div className="space-y-4 text-[13px] text-slate-500 font-medium leading-relaxed">
                    <p>The complete course will be delivered within 90 to 120 days from the date of enrollment.</p>
                    <p>After enrollment, learners will receive an Invoice, Study Materials and video lectures within 10 working days of making the payment.</p>
                    <p>A Pre-Board Exam will be scheduled 24 to 48 hours after payment, accessible via the official Harvard Learning exam portal. An Initial PC Softcopy (indicating “Under Training” and course details), will be provided after going through the pre-board exam within 48 to 72 hours.</p>
                    <p>The final online exam must be attended between 90 to 120 days after enrollment.</p>
                    <p>Upon successful exam completion, the Final PC Softcopy will be emailed to the candidate, indicating “Successfully Certified”.</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Training Format</h4>
                  <ul className="space-y-3 text-[13px] text-slate-500 font-medium leading-relaxed">
                    <li className="flex gap-3"><span className="text-slate-900">•</span> No live training sessions will be provided.</li>
                    <li className="flex gap-3"><span className="text-slate-900">•</span> Study material and training videos will be shared once only via email after the enrollment.</li>
                    <li className="flex gap-3"><span className="text-slate-900">•</span> Training videos and study materials are non-transferable and intended solely for enrolled candidates.</li>
                    <li className="flex gap-3"><span className="text-slate-900">•</span> Upon successful completion of the program, the certificate will be released with an abbreviation format. For an example if the course you have enrolled in "Resilience Coach Training", then "RCT" will appear on your certificate, similarly if the course name is Decision Making Mastery Training, on the certificate it will show "DMMT"</li>
                  </ul>
                </div>
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Exam Policy</h4>
                  <ul className="space-y-3 text-[13px] text-slate-500 font-medium leading-relaxed">
                    <li className="flex gap-3"><span className="text-slate-900">•</span> Multiple exam attempts are not permitted, for pre- board as well as final exam.</li>
                    <li className="flex gap-3"><span className="text-slate-900">•</span> The Final PC Softcopy will be issued within 15 days after the final exam attempt.</li>
                    <li className="flex gap-3"><span className="text-slate-900">•</span> No hard copy certificates will be delivered; all documents will be sent in digital format only.</li>
                  </ul>
                </div>
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Refund Policy</h4>
                  <ul className="space-y-3 text-[13px] text-slate-500 font-medium leading-relaxed">
                    <li className="flex gap-3"><span className="text-slate-900 font-black">•</span> No refund will be applicable after attempting any exam (Pre-Board or Final).</li>
                    <li className="flex gap-3"><span className="text-slate-900 font-black">•</span> A 90% refund is applicable before attempting any exam.</li>
                    <li className="flex gap-3"><span className="text-slate-900 font-black">•</span> There is no 100% refund policy.</li>
                    <li className="flex gap-3"><span className="text-slate-900 font-black">•</span> A 10% deduction will apply to all refunds to cover the cost of digital study materials and content access.</li>
                  </ul>
                </div>
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Pre-Examination Reward Policy</h4>
                  <div className="p-8 bg-slate-900 rounded-[2rem] shadow-2xl space-y-6">
                    <p className="text-[13px] font-bold text-white tracking-tight leading-relaxed">Candidates who secure 80% or above in the designated pre-examination will be eligible to receive a complimentary gift.</p>
                    <ul className="text-[11px] text-slate-400 space-y-3 font-medium leading-relaxed">
                      <li>• Eligible candidates will be provided with 5+ options for gift items worth upto 50k-100k. The final gift selection will be subject to availability and company discretion.</li>
                      <li>• By qualifying for the reward, candidates consent to the use and display of their photograph on the company’s official website and promotional platforms.</li>
                      <li>• Gift items will be dispatched within 45 to 60 days from the date of result declaration.</li>
                      <li>• All gifts will be accompanied by the manufacturer’s warranty, where applicable.</li>
                      <li>• Courier tracking details will be shared via registered email once the item has been dispatched.</li>
                      <li>• For delivery verification, a one-time password (OTP) required by the courier partner will be shared with the recipient by the company.</li>
                      <li>• The company reserves the right to modify, substitute, or discontinue the reward offer at any time without prior notice, in accordance with applicable laws and operational requirements.</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">General Terms</h4>
                  <ul className="space-y-3 text-[13px] text-slate-500 font-medium leading-relaxed">
                    <li className="flex gap-3"><span className="text-slate-900">•</span> All timelines mentioned are approximate and subject to variation depending on course type and customer engagement.</li>
                    <li className="flex gap-3"><span className="text-slate-900">•</span> Study materials and videos are shared once and cannot be reissued.</li>
                    <li className="flex gap-3"><span className="text-slate-900">•</span> By enrolling, candidates agree to comply with the above terms and conditions.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 03 Privacy Policy */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">03</div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.25em]">Privacy Policy</h3>
              </div>
              <div className="pl-4 space-y-10 border-l border-slate-100">
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Information We Collect</h4>
                  <p className="text-slate-500 text-[13px] leading-relaxed font-medium">We collect the following types of information to ensure smooth operation of our services:</p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">Personal Information:</p>
                      <p className="text-xs text-slate-500 font-medium">Your name, email address, contact number, and country of residence collected during registration or inquiries.</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">Payment Information:</p>
                      <p className="text-xs text-slate-500 font-medium">Transaction details (amount, date, and payment method). We do not store complete payment card or crypto wallet details.</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">Course and Usage Data:</p>
                      <p className="text-xs text-slate-500 font-medium">Information about the courses you enroll in, your progress, assessments, and interactions with our online learning platform.</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">Technical Information:</p>
                      <p className="text-xs text-slate-500 font-medium">Device type, IP address, browser version, and cookies to improve website performance and user experience.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">How We Use Your Information</h4>
                  <p className="text-slate-500 text-[13px] leading-relaxed font-medium">We use your information to:</p>
                  <ul className="space-y-2 text-xs text-slate-500 font-medium list-disc pl-5">
                    <li>Process your course enrollment and payments.</li>
                    <li>Provide access to study materials, exams, and course completion certificates.</li>
                    <li>Communicate important updates, reminders, and support-related information.</li>
                    <li>Improve course quality, website functionality, and user experience.</li>
                    <li>Maintain compliance with our internal policies and applicable laws.</li>
                  </ul>
                  <p className="text-xs text-slate-900 font-bold mt-2">We do not sell, trade, or rent your personal information to any third party.</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Data Storage and Security</h4>
                  <ul className="space-y-2 text-xs text-slate-500 font-medium list-disc pl-5">
                    <li>All personal data is stored securely in encrypted databases.</li>
                    <li>Only authorized Harvard Learning personnel have access to user data.</li>
                    <li>We regularly update our systems and employ security measures such as SSL encryption to protect against unauthorized access, alteration, or disclosure.</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Payment & Financial Data</h4>
                  <p className="text-slate-500 text-[13px] leading-relaxed font-medium">All personal data is stored securely in encrypted databases. Only authorized Harvard Learning personnel have access to user data. We regularly update our systems and employ security measures such as SSL encryption to protect against unauthorized access, alteration, or disclosure.</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Use of Cookies</h4>
                  <p className="text-slate-500 text-[13px] leading-relaxed font-medium">Our website uses cookies to enhance your browsing experience, save login preferences, and analyze site traffic. You can choose to disable cookies from your browser settings; however, some website features may not function properly as a result.</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Data Retention</h4>
                  <p className="text-slate-500 text-[13px] leading-relaxed font-medium">We retain your personal information for as long as necessary to fulfill course delivery and legal obligations. Once no longer needed, your data will be securely deleted or anonymized.</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Third-Party Links</h4>
                  <p className="text-slate-500 text-[13px] leading-relaxed font-medium">Our website may contain links to third-party websites (e.g., payment gateways or educational partners). Harvard Learning is not responsible for the privacy practices or content of these external sites.</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Your Rights</h4>
                  <p className="text-slate-500 text-[13px] leading-relaxed font-medium">You have the right to access the information we hold about you, request correction or deletion of inaccurate data, and withdraw consent for marketing communications at any time. To exercise these rights, please contact our support team at support@harvardlearning.in.</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Policy Updates</h4>
                  <p className="text-slate-500 text-[13px] leading-relaxed font-medium">Harvard Learning reserves the right to update or modify this Privacy Policy at any time without prior notice. The revised version will be posted on our website with an updated effective date.</p>
                </div>
              </div>
            </section>

            {/* 04 Refund Policy Detailed */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">04</div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.25em]">Detailed Refund Policy</h3>
              </div>
              <div className="space-y-10 pl-4 border-l border-slate-100">
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">No Refund After Exam Attempt</h4>
                  <p className="text-slate-500 text-[13px] leading-relaxed font-medium">Once a candidate has attempted any exam — whether it is the Pre-Board Exam or the Final Exam — no refund will be applicable under any circumstances.</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed italic font-medium p-4 bg-slate-50 rounded-xl border border-slate-100/50">This policy ensures the integrity of our course access and examination system, as study materials and evaluations are already utilized at that stage.</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">90% Refund Before Exam Attempt</h4>
                  <p className="text-slate-500 text-[13px] leading-relaxed font-medium">If a candidate wishes to cancel their enrollment before attempting the pre-exam, they are eligible for a 90% refund of the total course fee.</p>
                  <div className="p-6 bg-slate-900 rounded-2xl shadow-xl">
                    <p className="text-white text-[10px] leading-relaxed font-black uppercase tracking-widest text-center">REFUND WILL BE ONLY BE PROVIDED IF THE CUSTOMER RAISED THE REQUEST WITHIN 24 HOURS OF MAKING THE PAYMENT AND THEY MUST NOT ATTEND THE EXAM OTHERWISE NO REFUND WILL BE INITIATED TO THEM.</p>
                  </div>
                  <div className="space-y-4 pt-2">
                    <p className="text-slate-500 text-[13px] leading-relaxed font-medium">The refund request must be raised in writing via email to the official Harvard Learning support team.</p>
                    <p className="text-slate-500 text-[13px] leading-relaxed font-medium">Refund processing time is 5-7 working days once the refund request is approved it may take an additional 7 working days to get credited into the customer's bank account from which payment was made.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">No 100% Refund Policy</h4>
                  <p className="text-slate-500 text-[13px] leading-relaxed font-medium">Please note that Harvard Learning does not offer a 100% refund under any condition. This is due to administrative, processing, and content access costs incurred upon enrollment.</p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Refund Request Procedure</h4>
                  <p className="text-slate-500 text-[13px] leading-relaxed font-medium">To request a refund, the candidate must email <span className="text-slate-900 font-bold">support@harvardlearning.in</span> with their full name, registered email ID, course name, payment receipt, and reason for cancellation. Requests without complete details may face delays in processing.</p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">10% Deduction on All Refunds</h4>
                  <p className="text-slate-500 text-[13px] leading-relaxed font-medium">All approved refunds will include a 10% deduction to cover costs associated with digital content delivery, study materials, and platform usage. This deduction applies uniformly to all refund cases.</p>
                </div>
                <div className="space-y-6 pt-4">
                  <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Special Note</h5>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Partial Course Completion</p>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed">If a candidate has completed only a portion of the course, no refund will be issued for the remaining content.</p>
                      </div>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Delayed Course Progress</p>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed">Refunds will not be provided due to delays in completing the course at the candidate’s own pace.</p>
                      </div>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Accessed Content</p>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed">Once study materials, training videos, or pre-board assessments have been accessed, refunds will not be applicable.</p>
                      </div>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Dissatisfaction</p>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed">Refunds cannot be claimed solely based on personal preferences, expectations, or dissatisfaction with the course material.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Agreement to Policies</h5>
                  <div className="space-y-4 text-xs text-slate-500 font-medium leading-relaxed">
                    <p>By enrolling in any course offered by Harvard Learning Education, candidates acknowledge and agree to comply with all policies, terms of service, and refund rules.</p>
                    <p>Enrolling confirms that the candidate has read, understood, and accepted the terms outlined in the policies, including payment, course access, exam schedules, and refund rules.</p>
                    <p>Candidates are responsible for reviewing these policies prior to enrollment, as continued use of the course materials implies acceptance of all terms.</p>
                  </div>
                </div>
                <div className="space-y-6 pt-4">
                  <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Important Notices</h5>
                  <div className="space-y-4">
                    <div>
                      <h6 className="text-[10px] font-black text-slate-900 uppercase mb-1">Independent Organization</h6>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Harvard Learning is an independent training and service provider. We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with any other institute, organization, or governing body. All rights related to our services, content, and training materials are solely reserved by Harvard Learning.</p>
                    </div>
                    <div>
                      <h6 className="text-[10px] font-black text-slate-900 uppercase mb-1">No Guarantee of Employment or Monetary Benefit</h6>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Our programs are designed for skill development and professional enhancement only. We do not guarantee any monetary benefit, job placement, promotion, or financial gain as a result of completing our training or certification programs.</p>
                    </div>
                    <div>
                      <h6 className="text-[10px] font-black text-slate-900 uppercase mb-1">Third-Party Recommendations</h6>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Harvard Learning shall not be held responsible for any financial, personal, or professional loss incurred by customers who enroll in our services based on third-party recommendations, promotions, or representations. Any such engagement is strictly at the discretion and responsibility of the individual.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
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
                I acknowledge that I have read and unequivocally agree to the <span className="text-primary-600 font-black">Harvard Learning Terms & Conditions</span> and associated protocols.
              </span>
            </label>

            <button
              onClick={handleAccept}
              disabled={!disclaimerCheckbox || isAccepting}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all duration-300 ${disclaimerCheckbox && !isAccepting
                ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-xl shadow-primary-600/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
            >
              {isAccepting ? 'Processing...' : (
                <>
                  Accept Agreement & Continue
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

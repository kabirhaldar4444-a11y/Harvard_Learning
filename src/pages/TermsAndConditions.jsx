import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: '01',
      title: 'Service Delivery',
      content: [
        {
          subtitle: 'Enrollment Process',
          text: 'Customers visit the Harvard Learning website and fill out the Enrollment Form. After form submission, Our team connects with the customer. A detailed email is shared explaining the complete process flow and fee structure. Payments may also be accepted directly through an authorized professional expert trainer account, where applicable.'
        },
        {
          subtitle: 'Process Explanation & Confirmation',
          text: 'During the call, the team explains the course structure, learning journey, and assessment-to-certification flow. The customer then confirms their participation in the program.'
        },
        {
          subtitle: 'Fee Payment',
          text: 'Upon successful completion of the fee payment, a GST-compliant invoice is issued within 6 hours. Pre-examination study materials are shared with the learner within 24 hours.'
        },
        {
          subtitle: 'Pre-Exam',
          text: 'A Pre-Exam is conducted within 24–48 hours of fee payment. This exam assesses the customer’s initial understanding of the selected domain. Before the exam, the Guidance Team connects to explain the exam process.'
        },
        {
          subtitle: 'Pre-Exam Result & Pre-Board Professional Certificate',
          text: 'Results are shared within 24–48 hours via email. A Pre-Board Professional Certificate is issued with “Under Training” mentioned.'
        },
        {
          subtitle: 'Reward Eligibility',
          text: 'Customers scoring above 80% become eligible for a gift. One gift can be selected from four available options, which will be delivered accordingly.'
        },
        {
          subtitle: 'Self-Paced Training',
          text: 'Access to recorded video lectures is shared within 15 days on payment. Training duration is 90–120 days.'
        },
        {
          subtitle: 'Final Exam',
          text: 'A Final Exam is conducted between 90-120 days.'
        },
        {
          subtitle: 'Final Certificate',
          text: 'Upon successful completion of all requirements, the Final Certificate is issued. The certificate will clearly state the status as “Certified.”'
        },
        {
          subtitle: 'Continuous Support',
          text: 'Throughout the entire journey, the Harvard Learning team remains in contact for guidance and support.'
        }
      ]
    },
    {
      id: '02',
      title: 'Terms & Conditions',
      content: [
        {
          subtitle: 'Course Duration and Delivery',
          text: 'The complete course will be delivered within 90 to 120 days from the date of enrollment. After enrollment, learners will receive an Invoice, Study Materials and video lectures within 10 working days of making the payment. A Pre-Board Exam will be scheduled 24 to 48 hours after payment, accessible via the official HARVARD LEARNING exam portal. An Initial PC Softcopy (indicating “Under Training” and course details), will be provided after going through the pre-board exam within 48 to 72 hours. The final online exam must be attended between 90 to 120 days after enrollment. Upon successful exam completion, the Final PC Softcopy will be emailed to the candidate, indicating “Successfully Certified”.'
        },
        {
          subtitle: 'Training Format',
          list: [
            'No live training sessions will be provided.',
            'Study material and training videos will be shared once only via email after the enrollment.',
            'Training videos and study materials are non-transferable and intended solely for enrolled candidates.',
            'Upon successful completion of the program, the certificate will be released with an abbreviation format. For an example if the course you have enrolled in "Resilience Coach Training", then "RCT" will appear on your certificate, similarly if the course name is Decision Making Mastery Training, on the certificate it will show "DMMT"'
          ]
        },
        {
          subtitle: 'Exam Policy',
          list: [
            'Multiple exam attempts are not permitted, for pre- board as well as final exam.',
            'The Final PC Softcopy will be issued within 15 days after the final exam attempt.',
            'No hard copy certificates will be delivered; all documents will be sent in digital format only.'
          ]
        },
        {
          subtitle: 'Refund Policy (Summary)',
          list: [
            'No refund will be applicable after attempting any exam (Pre-Board or Final).',
            'A 90% refund is applicable before attempting any exam.',
            'There is no 100% refund policy.',
            'A 10% deduction will apply to all refunds to cover the cost of digital study materials and content access.'
          ]
        },
        {
          subtitle: 'Pre-Examination Reward Policy',
          text: 'Candidates who secure 80% or above in the designated pre-examination will be eligible to receive a complimentary gift worth upto 50k-100k.',
          list: [
            'Eligible candidates will be provided with 5+ options for gift items. Final selection subject to availability and company discretion.',
            'By qualifying, candidates consent to the use and display of their photograph on the company’s official website and promotional platforms.',
            'Gift items dispatched within 45 to 60 days from the date of result declaration.',
            'All gifts accompanied by the manufacturer’s warranty, where applicable.',
            'Courier tracking details shared via registered email once dispatched.',
            'Delivery verification (OTP) required by the courier partner will be shared with the recipient.',
            'The company reserves the right to modify, substitute, or discontinue the reward offer at any time without prior notice.'
          ]
        },
        {
          subtitle: 'General Terms',
          list: [
            'All timelines mentioned are approximate and subject to variation depending on course type and customer engagement.',
            'Study materials and videos are shared once and cannot be reissued.',
            'By enrolling, candidates agree to comply with the above terms and conditions.'
          ]
        }
      ]
    },
    {
      id: '03',
      title: 'Refund Policy',
      content: [
        {
          subtitle: 'No Refund After Exam Attempt',
          text: 'Once a candidate has attempted any exam — whether it is the Pre-Board Exam or the Final Exam — no refund will be applicable under any circumstances. This policy ensures the integrity of our course access and examination system, as study materials and evaluations are already utilized at that stage.'
        },
        {
          subtitle: '90% Refund Before Exam Attempt',
          text: 'If a candidate wishes to cancel their enrollment before attempting the pre-exam, they are eligible for a 90% refund of the total course fee. REFUND WILL BE ONLY BE PROVIDED IF THE CUSTOMER RAISED THE REQUEST WITHIN 24 HOURS OF MAKING THE PAYMENT AND THEY MUST NOT ATTEND THE EXAM OTHERWISE NO REFUND WILL BE INITIATED TO THEM. The refund request must be raised in writing via email to the official HARVARD LEARNING support team. Refund processing time is 5-7 working days once the refund request is approved it may take an additional 7 working days to get credited into the customer\'s bank account from which payment was made.'
        },
        {
          subtitle: 'No 100% Refund Policy',
          text: 'Please note that HARVARD LEARNING does not offer a 100% refund under any condition. This is due to administrative, processing, and content access costs incurred upon enrollment.'
        },
        {
          subtitle: 'Refund Request Procedure',
          text: 'To request a refund, the candidate must email support@harvardlearning.com with their full name, registered email ID, course name, payment receipt, and reason for cancellation. Requests without complete details may face delays in processing.'
        },
        {
          subtitle: '10% Deduction on All Refunds',
          text: 'All approved refunds will include a 10% deduction to cover costs associated with digital content delivery, study materials, and platform usage. This deduction applies uniformly to all refund cases.'
        },
        {
          subtitle: 'Special Note',
          list: [
            'Partial Course Completion: If a candidate has completed only a portion of the course, no refund will be issued for the remaining content.',
            'Delayed Course Progress: Refunds will not be provided due to delays in completing the course at the candidate’s own pace.',
            'Accessed Content: Once study materials, training videos, or pre-board assessments have been accessed, refunds will not be applicable.',
            'Dissatisfaction: Refunds cannot be claimed solely based on personal preferences, expectations, or dissatisfaction with the course material.'
          ]
        },
        {
          subtitle: 'Agreement to Policies',
          text: 'By enrolling in any course offered by HARVARD LEARNING Education, candidates acknowledge and agree to comply with all policies, terms of service, and refund rules. Enrolling confirms that the candidate has read, understood, and accepted the terms outlined in the policies, including payment, course access, exam schedules, and refund rules. Candidates are responsible for reviewing these policies prior to enrollment, as continued use of the course materials implies acceptance of all terms.'
        },
        {
          subtitle: 'Independent Organization',
          text: 'HARVARD LEARNING (OPC) PVT. LTD. is an independent training and service provider. We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with any other institute, organization, or governing body. All rights related to our services, content, and training materials are solely reserved by HARVARD LEARNING.'
        },
        {
          subtitle: 'No Guarantee of Employment or Monetary Benefit',
          text: 'Our programs are designed for skill development and professional enhancement only. We do not guarantee any monetary benefit, job placement, promotion, or financial gain as a result of completing our training or certification programs.'
        },
        {
          subtitle: 'Third-Party Recommendations',
          text: 'HARVARD LEARNING shall not be held responsible for any financial, personal, or professional loss incurred by customers who enroll in our services based on third-party recommendations, promotions, or representations. Any such engagement is strictly at the discretion and responsibility of the individual.'
        }
      ]
    },
    {
      id: '04',
      title: 'Privacy Policy',
      content: [
        {
          subtitle: 'Information We Collect',
          list: [
            'Personal Information: Your name, email address, contact number, and country of residence collected during registration or inquiries.',
            'Payment Information: Transaction details (amount, date, and payment method). We do not store complete payment card or crypto wallet details.',
            'Course and Usage Data: Information about the courses you enroll in, your progress, assessments, and interactions with our online learning platform.',
            'Technical Information: Device type, IP address, browser version, and cookies to improve website performance and user experience.'
          ]
        },
        {
          subtitle: 'How We Use Your Information',
          list: [
            'Process your course enrollment and payments.',
            'Provide access to study materials, exams, and course completion certificates.',
            'Communicate important updates, reminders, and support-related information.',
            'Improve course quality, website functionality, and user experience.',
            'Maintain compliance with our internal policies and applicable laws.',
            'We do not sell, trade, or rent your personal information to any third party.'
          ]
        },
        {
          subtitle: 'Data Storage and Security',
          text: 'All personal data is stored securely in encrypted databases. Only authorized HARVARD LEARNING personnel have access to user data. We regularly update our systems and employ security measures such as SSL encryption to protect against unauthorized access, alteration, or disclosure.'
        },
        {
          subtitle: 'Payment & Financial Data',
          text: 'All personal data is stored securely in encrypted databases. Only authorized Harvard Learning personnel have access to user data. We regularly update our systems and employ security measures such as SSL encryption to protect against unauthorized access, alteration, or disclosure.'
        },
        {
          subtitle: 'Use of Cookies',
          text: 'Our website uses cookies to enhance your browsing experience, save login preferences, and analyze site traffic and improve user experience. You can choose to disable cookies from your browser settings; however, some website features may not function properly as a result.'
        },
        {
          subtitle: 'Data Retention & Third-Party Links',
          text: 'You have the right to access the information we hold about you, request correction or deletion of inaccurate data, and withdraw consent for marketing communications at any time. To exercise these rights, please contact our support team at support@harvardlearning.com.'
        },
        {
          subtitle: 'Your Rights',
          text: 'You have the right to access the information we hold about you, request correction or deletion of inaccurate data, and withdraw consent for marketing communications at any time. To exercise these rights, please contact our support team at support@harvardlearning.com.'
        },
        {
          subtitle: 'Policy Updates',
          text: 'Harvard Learning OPC Pvt Ltd and PayG, reserves the right to update or modify this Privacy Policy at any time without prior notice. The revised version will be posted on our website with an updated effective date.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-[2.5rem] overflow-hidden border border-slate-200">
          <div className="bg-primary-600 px-8 py-10 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
             <button 
              onClick={() => navigate(-1)} 
              className="absolute top-8 left-8 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="text-center">
              <h1 className="text-4xl font-black tracking-tight uppercase">Legal Documents</h1>
              <p className="mt-2 text-primary-100 font-bold uppercase tracking-widest text-xs opacity-80">Harvard Learning Information Center</p>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-16">
            {sections.map((section) => (
              <div key={section.id} id={`section-${section.id}`} className="scroll-mt-10">
                <div className="flex items-center gap-4 mb-8">
                  <span className="flex-shrink-0 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl">
                    {section.id}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-8 ml-16">
                  {section.content.map((item, idx) => (
                    <div key={idx} className="space-y-3">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                        {item.subtitle}
                      </h3>
                      {item.text && (
                        <p className="text-slate-600 leading-relaxed text-sm font-medium">
                          {item.text}
                        </p>
                      )}
                      {item.list && (
                        <ul className="space-y-2">
                          {item.list.map((li, lidx) => (
                            <li key={lidx} className="flex items-start gap-3 text-slate-600 text-sm font-medium">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0"></span>
                              <span>{li}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
                {section.id !== '04' && <div className="mt-16 h-px bg-slate-100 ml-16"></div>}
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-8 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              Last Updated: April 2026 • © Harvard Learning (OPC) PVT. LTD.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;

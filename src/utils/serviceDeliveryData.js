// 12-stage Service Delivery Lifecycle Definition
export const SERVICE_DELIVERY_STAGES = [
  { id: 1, name: "Candidate submitted the service enrollment", code: "ENROLLMENT" },
  { id: 2, name: "Proposal Email sent", code: "PROPOSAL_SENT" },
  { id: 3, name: "Payment received", code: "PAYMENT_RECEIVED" },
  { id: 4, name: "Invoice Sent", code: "INVOICE_SENT" },
  { id: 5, name: "Study material shared", code: "STUDY_MATERIAL" },
  { id: 6, name: "Login credentials shared", code: "CREDENTIALS_SHARED" },
  { id: 7, name: "Exam Cleared", code: "EXAM_CLEARED" },
  { id: 8, name: "Completion Certificates Delivered", code: "CERTIFICATE_DELIVERED" },
  { id: 9, name: "Video Lectures Delivered", code: "LECTURES_DELIVERED" },
  { id: 10, name: "Final Login Shared", code: "FINAL_LOGIN" },
  { id: 11, name: "Final Exam Cleared", code: "FINAL_EXAM" },
  { id: 12, name: "PC verified", code: "PC_VERIFIED" },
];

// Helper to map a Supabase profile record to a 100% completed service delivery candidate object
export const mapProfileToCandidate = (profile) => {
  const displayName = (profile.full_name && profile.full_name.trim()) || profile.email?.split('@')[0] || 'Candidate';
  const avatarUrl = profile.profile_photo_url || 
                    profile.aadhaar_front_url || 
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=A51C30&color=ffffff&bold=true&font-size=0.4`;

  return {
    id: profile.id,
    full_name: displayName,
    email: profile.email || 'No email provided',
    phone: profile.phone || 'Not provided',
    address: profile.address || '',
    avatar_url: avatarUrl,
    current_step: 12,
    total_steps: 12,
    status: 'completed',
    pc_verified: true,
    profile_completed: !!profile.profile_completed,
    disclaimer_accepted: !!profile.disclaimer_accepted,
    is_exam_locked: !!profile.is_exam_locked,
    created_at: profile.created_at || new Date().toISOString()
  };
};

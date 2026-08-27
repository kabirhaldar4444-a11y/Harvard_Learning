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

const LOCAL_STORAGE_KEY = 'hl_service_delivery_stages_v1';

// Helper to get locally persisted stages mapping { [candidateId]: { current_step, status } }
export const getStoredStages = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Error reading stored service delivery stages:', err);
    return {};
  }
};

// Helper to save stage progress for a candidate
export const saveStoredStage = (candidateId, step, status) => {
  try {
    const stages = getStoredStages();
    stages[candidateId] = {
      current_step: step,
      status: status || (step >= 12 ? 'completed' : 'in_progress'),
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stages));
    return stages[candidateId];
  } catch (err) {
    console.error('Error saving service delivery stage:', err);
    return null;
  }
};

// Helper to map a Supabase profile record to a service delivery candidate object
export const mapProfileToCandidate = (profile, submissions = [], storedStages = {}) => {
  const customStage = storedStages[profile.id];
  const dbStep = profile.service_delivery_step;
  const dbStatus = profile.service_delivery_status;

  // Determine current step:
  // 1. If explicit step in DB or stored in localStorage
  // 2. Otherwise default based on profile completion / submissions
  let currentStep = 12;
  let status = 'completed';

  if (customStage && customStage.current_step !== undefined) {
    currentStep = Number(customStage.current_step);
    status = customStage.status || (currentStep >= 12 ? 'completed' : 'in_progress');
  } else if (dbStep !== undefined && dbStep !== null) {
    currentStep = Number(dbStep);
    status = dbStatus || (currentStep >= 12 ? 'completed' : 'in_progress');
  } else {
    // Automatic heuristic for past & future users if not manually overridden:
    if (profile.profile_completed || profile.disclaimer_accepted) {
      currentStep = 12;
      status = 'completed';
    } else {
      currentStep = 6;
      status = 'in_progress';
    }
  }

  const isVerified = currentStep >= 12;

  // Real avatar resolution: profile_photo_url -> aadhaar_front_url -> UI Avatar with Harvard Crimson
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
    current_step: currentStep,
    total_steps: 12,
    status: status,
    pc_verified: isVerified,
    profile_completed: !!profile.profile_completed,
    disclaimer_accepted: !!profile.disclaimer_accepted,
    is_exam_locked: !!profile.is_exam_locked,
    created_at: profile.created_at || new Date().toISOString()
  };
};

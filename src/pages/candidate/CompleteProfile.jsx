import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../utils/supabase';
import DisclaimerOverlay from '../../components/DisclaimerOverlay';
import SignaturePad from '../../components/common/SignaturePad';

let INDIA_STATES_CITIES = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kakinada", "Kadapa", "Anantapur"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Bomdila", "Roing", "Tezu", "Aalo", "Khonsa"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Dhubri", "Diphu"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Arrah", "Begusarai", "Chhapra", "Katihar", "Munger"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur", "Ambikapur", "Raigarh", "Chirmiri"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Sanquelim", "Canacona", "Pernem"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Morbi"],
  "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"],
  "Himachal Pradesh": ["Shimla", "Mandi", "Solan", "Dharamsala", "Kullu", "Hamirpur", "Chamba", "Una", "Bilaspur", "Nahan"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh", "Phusro", "Medininagar"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Davanagere", "Ballari", "Vijayapura", "Shivamogga", "Tumakuru"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad", "Alappuzha", "Malappuram", "Kottayam", "Kannur"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Ratlam", "Satna", "Dewas", "Murwara"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati", "Navi Mumbai", "Kolhapur"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Ukhrul", "Senapati", "Chandel", "Tamenglong", "Jiribam", "Moreh"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh", "Baghmara", "Williamnagar", "Resubelpara", "Nongstoin", "Mairang", "Khliehriat"],
  "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib", "Serchhip", "Lawngtlai", "Mamit", "Hnahthial", "Khawzach"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunieboto", "Mon", "Phek", "Longleng", "Kiphire"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Hoshiarpur", "Batala", "Moga"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar"],
  "Sikkim": ["Gangtok", "Namchi", "Mangan", "Gyalshing", "Rangpo", "Jorethang", "Nayabazar", "Singtam", "Ravangla", "Yuksom"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Vellore", "Erode", "Thoothukudi", "Dindigul"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet", "Miryalaguda"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailasahar", "Belonia", "Khowai", "Ambassa", "Sonamura", "Sabroom", "Teliamura"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Allahabad", "Ghaziabad", "Bareilly", "Aligarh", "Moradabad"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Kotdwar", "Ramnagar", "Mussoorie"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur"],
  "Andaman and Nicobar Islands": ["Port Blair", "Car Nicobar", "Little Andaman", "Diglipur", "Rangat", "Mayabunder", "Ferrargunj", "Prothrapur", "Nancowrie", "Campbell Bay"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  "Delhi": ["New Delhi", "Central Delhi", "East Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore", "Kathua", "Udhampur", "Poonch", "Leh", "Kargil"],
  "Ladakh": ["Leh", "Kargil"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Amini", "Andrott", "Kadmat"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"]
};

const STATES = Object.keys(INDIA_STATES_CITIES).sort();

const CompleteProfile = ({ profile, user, onComplete }) => {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailValue, setEmailValue] = useState(profile?.email || '');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedLocationText, setDetectedLocationText] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [panCard, setPanCard] = useState(null);
  const [signatureBlob, setSignatureBlob] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const availableCities = selectedState ? INDIA_STATES_CITIES[selectedState] || [] : [];

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    setSelectedCity('');
  };

  const compressImage = async (file) => {
    if (!file) return null;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file instanceof Blob ? file : file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > height && width > maxDim) {
            height = (maxDim / width) * height;
            width = maxDim;
          } else if (height > maxDim) {
            width = (maxDim / height) * width;
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.7);
        };
      };
    });
  };

  const startCamera = async () => {
    setShowCamera(true);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setError('Could not access camera: ' + err.message);
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        setProfilePhoto(blob);
        const stream = video.srcObject;
        if (stream) stream.getTracks().forEach(track => track.stop());
        setShowCamera(false);
      }, 'image/jpeg', 0.8);
    }
  };

  const handleFileUpload = async (file, path) => {
    if (!file) return '';
    const fileExt = 'jpg';
    const fileName = `${profile.id}/${path}-${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('aadhaar_cards').upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('aadhaar_cards').getPublicUrl(fileName);
    return publicUrl;
  };

  const getIPAddress = async () => {
    const services = [
      'https://api4.ipify.org?format=json', // Forces IPv4
      'https://ipapi.co/json/',
      'https://ipv4.icanhazip.com' // Plain text fallback
    ];

    for (const service of services) {
      try {
        const res = await fetch(service, { timeout: 5000 });
        if (service.includes('icanhazip')) {
          const ip = await res.text();
          if (ip && ip.trim()) return ip.trim();
        } else {
          const data = await res.json();
          const ip = data.ip || data.query || data.address;
          if (ip && ip !== 'Unknown' && !ip.includes(':')) return ip; // Ensure no IPv6 (colons)
        }
      } catch (e) {
        console.warn(`IP service ${service} failed:`, e.message);
        continue;
      }
    }
    return '0.0.0.0';
  };

  const fetchLocationByPincode = async (pin) => {
    if (pin.length !== 6) return;
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0].Status === 'Success') {
        const postOffice = data[0].PostOffice[0];
        const state = postOffice.State;
        const city = postOffice.District;

        setSelectedState(state);
        // Add city to list if not present (optional, but good for UX)
        if (INDIA_STATES_CITIES[state] && !INDIA_STATES_CITIES[state].includes(city)) {
          INDIA_STATES_CITIES[state].push(city);
        }
        setSelectedCity(city);
      }
    } catch (err) {
      console.error('Pincode fetch error:', err);
    }
  };

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    setError('');
    
    // Fetch IP in background (compulsory but transparent)
    getIPAddress().then(ip => setIpAddress(ip));

    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { 
          enableHighAccuracy: true,
          timeout: 10000 
        });
      });

      const { latitude, longitude } = pos.coords;
      
      // Use Nominatim (OpenStreetMap) which is often more accurate for Indian Pincodes
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
      const data = await res.json();
      const addr = data.address || {};

      const state = addr.state || addr.region || '';
      const city = addr.city || addr.town || addr.village || addr.district || addr.county || '';
      const postCode = addr.postcode || '';

      if (state) setSelectedState(state);
      if (city) setSelectedCity(city);
      if (postCode) {
        // Clean postcode (sometimes contains ranges or text)
        const cleanPin = postCode.replace(/\D/g, '').slice(0, 6);
        if (cleanPin.length === 6) {
          setPincode(cleanPin);
          // Optional: Verify/Sync with postal API
          fetchLocationByPincode(cleanPin);
        }
      }

      const locationParts = [city, state, postCode].filter(Boolean);
      setDetectedLocationText(locationParts.join(', '));
      
      if (!postCode) {
        console.warn('Pincode not found in geocoding response');
        // If pincode is still missing, we could try a fallback API or just let the user enter it
      }

    } catch (err) {
      setError('Location verification failed. Please ensure location services are enabled and try again.');
      console.error('Security Verification Error:', err);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const getGeoLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve('Not Supported');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve(`LAT: ${pos.coords.latitude}, LNG: ${pos.coords.longitude}`);
        },
        () => {
          resolve('Permission Denied');
        },
        { timeout: 10000 }
      );
    });
  };

  const sendEmailNotification = async (candidateData) => {
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
          subject: `KYC FROM User:- ${profile.full_name}`,
          from_name: "HarvardLearning Exam Portal",
          to_email: "support@harvardlearning.com",
          message: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KYC VERIFICATION REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CANDIDATE INFORMATION:
──────────────────────
• Full Name: ${profile?.full_name || 'N/A'}
• Email ID: ${candidateData.email || 'N/A'}

• PIN Code: ${pincode || 'N/A'}
• Location: ${selectedCity || 'N/A'}, ${selectedState || 'N/A'}
• Residential Address: ${address || 'N/A'}
• IP Address: ${candidateData.ipAddress || '0.0.0.0'}

VERIFICATION STATUS:
───────────────────
• Declaration: CHECKED & ACCEPTED ✓
• Signature: CAPTURED & VERIFIED ✓
• Documentation: ALL ASSETS UPLOADED ✓

LEGAL ACKNOWLEDGEMENT & ATTESTATION:
──────────────────────────────────

IDENTITY VERIFICATION:
Candidate authorizes live photo capture for identity
authentication and anti-proxy measures.
EMPLOYMENT DISCLAIMER:
Candidate acknowledges certification does not guarantee
employment, placement, or financial increases.
ACADEMIC INTEGRITY:
Candidate agrees to complete exams independently
without unauthorized materials or AI assistance.
LIMITATION OF LIABILITY:
Portal is not liable for technical failures or candidate-side
connectivity issues during examinations.

FINAL DECLARATION & FULL AGREEMENT:
──────────────────────────────────
SERVICE DELIVERY:
• Enrollment Process: Customers visit the HarvardLearning website
and fill out the Enrollment Form. After form submission, our
team connects with the customer.
• Process Flow: A detailed email is shared explaining the
complete process flow and fee structure. Payments may also
be accepted directly through an authorized professional
expert trainer account, where applicable.
• Explanation: During the call, the team explains the course
structure, learning journey, and assessment-to-certification
flow. Customer then confirms participation.
• Fee Payment: Upon completion, a GST-compliant invoice is
issued within 6 hours. Study materials are shared within 24h.
• Pre-Exam: Conducted within 24–48 hours of fee payment to
assess initial understanding. Results shared within 24–48h.
• Certificate: A Pre-Board Professional Certificate is issued
with "Under Training" mentioned.
• Reward: Customers scoring above 80% become eligible for a
gift from four available options.
• Training: Access to recorded video lectures within 15 days.
Duration is 90–120 days.
• Final Exam: Conducted between 90–120 days.
• Final Certificate: Issued upon successful completion,
clearly stating status as "Certified."
• Support: Team remains in contact for guidance throughout.

TERMS & CONDITIONS:
• Delivery: Complete course delivered within 90–120 days.
• Access: Invoice, materials, and videos within 10 working days.
• Exams: Pre-Board (24–48h) and Final (90–120 days) attempts.
• Certification: Final PC Softcopy indicates "Successfully
Certified." Abbreviation format used (e.g., "RCT" for
Resilience Coach Training).
• Training Format: No live sessions. Materials shared once via
email and are non-transferable.
• Exam Policy: Multiple attempts are NOT permitted for any exam.
• Rewards: 80%+ scorers eligible for gifts worth 50k–100k.
Consent required for promotional use of photograph.

PRIVACY POLICY:
• Information We Collect: Personal, payment, course progress,
and technical data (IP, device info).
• Usage: To process enrollment, provide access, communicate,
and improve services. We do NOT sell data.
• Data Security: Stored securely in encrypted databases.
Only authorized personnel have access.
• Retention & Rights: Data retained as necessary. Candidates
can request access, correction, or deletion via support.

REFUND POLICY:
• No Refund: Not applicable after attempting any exam
(Pre-Board or Final).
• 90% Refund: Applicable ONLY before attempting any exam
and if requested within 24 hours of payment.
• Deductions: A 10% deduction applies to all approved refunds
to cover administrative and content access costs.
• Procedure: Written request via support@harvardlearning.com
including full credentials and receipt.
• Non-Refundable Cases: Partial completion, delayed progress,
accessed content, or general dissatisfaction.

LEGAL NOTICE:
• Independent Org: HARVARDLEARNING (OPC) PVT. LTD. is an
independent entity not affiliated with other bodies.
• Employment: Programs are for skill development only;
NO guarantee of job placement or financial gain.
• Third-Party: No liability for losses from third-party
recommendations or representations.

ACCEPTED BY CANDIDATE: YES ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DOCUMENT ACCESS LINKS:
─────────────────────
• Profile Photo:
${candidateData.photoUrl}

• Aadhaar Card (Front):
${candidateData.frontUrl}

• Aadhaar Card (Back):
${candidateData.backUrl}

• PAN Card:
${candidateData.panUrl}

• Digital Signature:
${candidateData.signUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Submitted via HarvardLearning Exam Portal 
`
        })
      });
    } catch (err) {
      console.error('Email Notification Error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!profilePhoto) return setError('Please click your photo to continue.');
    if (!signatureBlob) return setError('Please provide your digital signature.');
    if (!panCard) return setError('Please upload your PAN card.');
    if (!emailValue) return setError('Please provide a valid email address.');
    if (!acceptedTerms) return setError('Please accept the legal terms to continue.');

    const digits = phone.replace(/\D/g, '');
    if (!digits.startsWith('91') || digits.length !== 12) return setError('Please enter a valid 10-digit Indian mobile number.');
    if (!selectedState) return setError('Please select your state.');
    if (!selectedCity) return setError('Please select your city.');

    setUploading(true);
    setUploadStatus('Optimizing legal documents...');

    try {
      // 1. Parallel Compression
      const [compPhoto, compFront, compBack, compPan] = await Promise.all([
        compressImage(profilePhoto),
        compressImage(aadhaarFront),
        compressImage(aadhaarBack),
        compressImage(panCard)
      ]);

      setUploadStatus('Securing identity files...');

      // 2. Parallel Upload
      const [photoUrl, frontUrl, backUrl, panUrl, signUrl] = await Promise.all([
        handleFileUpload(compPhoto, 'profile-photo'),
        handleFileUpload(compFront, 'front'),
        handleFileUpload(compBack, 'back'),
        handleFileUpload(compPan, 'pan-card'),
        handleFileUpload(signatureBlob, 'signature')
      ]);

      setUploadStatus('Verifying session security...');
      let finalIP = ipAddress;
      if (!finalIP) {
        finalIP = await getIPAddress();
      }

      setUploadStatus('Initializing your dashboard...');
      const [liveLocation] = await Promise.all([
        getGeoLocation()
      ]);

      if (liveLocation === 'Permission Denied' || liveLocation === 'Not Supported') {
        throw new Error('Location verification is required for global identity protocol. Please enable location access in your browser settings and refresh.');
      }

      setUploadStatus('Initializing your dashboard...');

      const fullAddress = `${address ? address + ', ' : ''}${selectedCity}, ${selectedState} - ${pincode}`;

      const { error } = await supabase.from('profiles').update({
        email: emailValue,
        phone,
        address: fullAddress,
        aadhaar_front_url: frontUrl,
        aadhaar_back_url: backUrl,
        pan_url: panUrl,
        signature_url: signUrl,
        profile_photo_url: photoUrl,
        ip_address: finalIP,
        profile_completed: true,
        disclaimer_accepted: true
      }).eq('id', profile.id);

      if (error) throw error;

      // Send background notification with document links
      await sendEmailNotification({
        phone,
        email: emailValue,
        location: `${selectedCity}, ${selectedState}`,
        photoUrl,
        frontUrl,
        backUrl,
        panUrl,
        signUrl,
        address: fullAddress,
        ipAddress: finalIP
      });

      if (onComplete) await onComplete();
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      setUploadStatus('');
    }
  };

  const inputStyle = {
    padding: '16px 20px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    width: '100%',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 20px center',
    backgroundSize: '16px',
    paddingRight: '48px'
  };

  return (
    <>
      <DisclaimerOverlay user={user} profile={profile} />
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary-100/50 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-indigo-100/50 rounded-full blur-[128px] pointer-events-none" />

        <div className="relative w-full max-w-3xl bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] border border-slate-200 z-10 p-8 md:p-12 animate-slide-up my-12">
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-[2rem] bg-slate-50 border border-slate-100 text-primary-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-2 text-slate-900 uppercase">KYC Form</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] opacity-70">Step 2: Harvard Learning Global Verification</p>
          </div>

          {error && (
            <div className="mb-8 p-5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 text-xs font-black text-center uppercase tracking-wide">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary-600 flex items-center gap-3">
                  <span className="w-1.5 h-5 bg-primary-600 rounded-full"></span>
                  Personal Credentials
                </h4>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all disabled:opacity-50"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {isDetectingLocation ? 'Detecting...' : 'Detect Location'}
                </button>
              </div>

              {detectedLocationText && (
                <div className="flex items-center gap-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl animate-fade-in mx-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest leading-none mb-1.5">Location Automatically Detected</p>
                    <p className="text-sm font-black text-slate-900 tracking-tight">{detectedLocationText}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setDetectedLocationText('')}
                    className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-100 text-emerald-400 hover:text-emerald-600 transition-all"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex flex-col items-center gap-6 p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 group transition-all hover:border-primary-300">
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Livestream Verification</p>
                  <p className="text-xs font-bold text-slate-600">Take a high-quality profile photo *</p>
                </div>

                {!showCamera && !profilePhoto && (
                  <button type="button" onClick={startCamera} className="w-32 h-32 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all border-4 border-white bg-white shadow-xl hover:scale-105 gap-2 group-hover:shadow-primary-500/10">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><circle cx="12" cy="13" r="3" /></svg>
                    </div>
                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Open Lens</span>
                  </button>
                )}

                {showCamera && (
                  <div className="relative w-full max-w-sm">
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl border-4 border-white shadow-2xl bg-black" />
                    <button type="button" onClick={capturePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2 py-3 px-8 rounded-full font-black text-xs bg-slate-900 text-white shadow-2xl hover:bg-slate-800 transition-all uppercase tracking-widest">Capture Now</button>
                  </div>
                )}

                {profilePhoto && !showCamera && (
                  <div className="relative">
                    <img src={URL.createObjectURL(profilePhoto)} alt="Candidate" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl" />
                    <button type="button" onClick={startCamera} className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-xs hover:rotate-180 transition-all duration-500 shadow-xl">🔄</button>
                  </div>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-widest ml-1">Account Email *</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={emailValue}
                    onChange={e => setEmailValue(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-widest ml-1">Phone Number *</label>
                  <div className="flex gap-3">
                    <div className="flex items-center px-5 rounded-2xl border border-slate-200 font-black text-xs bg-slate-50 text-slate-500">+91</div>
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      value={phone.replace(/^\+91\s?/, '')}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone('+91 ' + raw);
                        setPhoneError(raw.length === 10 ? '' : (raw.length > 0 ? 'Invalid length' : ''));
                      }}
                      style={inputStyle}
                      required
                    />
                  </div>
                  {phoneError && <p className="text-[10px] text-rose-500 font-black uppercase ml-1">{phoneError}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-widest ml-1">Pin Code *</label>
                  <input
                    type="text"
                    placeholder="6-digit pincode"
                    value={pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPincode(val);
                      if (val.length === 6) fetchLocationByPincode(val);
                    }}
                    style={inputStyle}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-widest ml-1">Residential Address</label>
                  <input
                    type="text"
                    placeholder="Street, Locality, House No."
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-widest ml-1">State / UT *</label>
                  <select value={selectedState} onChange={handleStateChange} style={selectStyle} required>
                    <option value="">Select State</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-widest ml-1">City / District *</label>
                  <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} style={selectStyle} required disabled={!selectedState}>
                    <option value="">{selectedState ? 'Choose City' : 'Pending State Selection...'}</option>
                    {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                    {selectedCity && !availableCities.includes(selectedCity) && (
                      <option value={selectedCity}>{selectedCity}</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="space-y-8">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-3">
                <span className="w-1.5 h-5 bg-indigo-600 rounded-full"></span>
                Verification Documents
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { label: 'Aadhaar Front *', state: aadhaarFront, setter: setAadhaarFront },
                  { label: 'Aadhaar Back *', state: aadhaarBack, setter: setAadhaarBack },
                  { label: 'PAN Card *', state: panCard, setter: setPanCard }
                ].map(({ label, state, setter }) => (
                  <div key={label} className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">{label}</label>
                    <div className="relative h-32 group">
                      <input type="file" accept="image/*" onChange={e => setter(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                      <div className={`h-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all px-4 text-center ${state ? 'border-primary-500 bg-primary-50/10 text-primary-600' : 'border-slate-200 bg-white hover:border-slate-300 text-slate-400'}`}>
                        {state ? (
                          <>
                            <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center mb-2 shadow-lg shadow-primary-500/20">
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            </div>
                            <span className="text-[10px] font-black truncate w-full uppercase tracking-widest">{state.name}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center mb-2 group-hover:text-slate-400 transition-colors">
                              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Upload File</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="space-y-8">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-3">
                <span className="w-1.5 h-5 bg-emerald-600 rounded-full"></span>
                Identity Attestation
              </h4>

              <div className="bg-white p-1 rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                <SignaturePad onSave={(blob) => setSignatureBlob(blob)} onClear={() => setSignatureBlob(null)} />
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Legal Terms Section */}
            <div className="space-y-8">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 flex items-center gap-3">
                <span className="w-1.5 h-5 bg-amber-600 rounded-full"></span>
                Legal Acknowledgement
              </h4>

              <div className="relative w-full flex flex-col max-h-[80vh] bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-200">


                <div className="px-8 py-10 overflow-y-auto flex-1 custom-scrollbar selection:bg-slate-100 bg-white">
                  <div className="space-y-12">
                    {/* 01 Identity Verification */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">01</div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.25em]">Identity Verification and Authentication</h3>
                      </div>
                      <div className="pl-4 border-l border-slate-100">
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          To ensure the integrity of the examination process and to prevent proxy attendance, the Candidate hereby authorizes the Portal to capture a live photograph (selfie) at the commencement of and/or during the examination. This image will be used solely to authenticate the Candidate’s identity against registered records. Failure to provide a clear image or any attempt to bypass this authentication may result in immediate disqualification.
                        </p>
                      </div>
                    </section>

                    {/* 02 Purpose & Disclaimer */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">02</div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.25em]">Purpose of Certification and Employment Disclaimer</h3>
                      </div>
                      <div className="pl-4 border-l border-slate-100 space-y-6">
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          The Candidate acknowledges and agrees that this certification is intended solely for personal and professional growth.
                        </p>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">No Guarantee of Employment</p>
                              <p className="text-slate-500 text-xs font-medium leading-relaxed">Successful completion of the exam and issuance of a certificate does not guarantee a job offer, placement, or any form of employment.</p>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">No Guarantee of Financial Increase</p>
                              <p className="text-slate-500 text-xs font-medium leading-relaxed">This certification does not entitle the Candidate to a salary hike, promotion, or bonus from any current or future employer.</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 font-medium italic">
                          The Portal and its affiliates are not liable for any career expectations not met following the attainment of this certification.
                        </p>
                      </div>
                    </section>

                    {/* 03 Academic Integrity */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">03</div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.25em]">Academic Integrity</h3>
                      </div>
                      <div className="pl-4 border-l border-slate-100">
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          The Candidate agrees to complete the examination independently without the use of unauthorized materials, AI tools, or external assistance. Any detected malpractice will lead to the permanent banning of the Candidate’s profile and the nullification of any previous results.
                        </p>
                      </div>
                    </section>

                    {/* 04 Limitation of Liability */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">04</div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.25em]">Limitation of Liability</h3>
                      </div>
                      <div className="pl-4 border-l border-slate-100 pb-6">
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          The Portal shall not be held responsible for technical failures on the Candidate’s end, including but not limited to internet connectivity issues, hardware malfunctions, or power outages during the examination session.
                        </p>
                      </div>
                    </section>
                  </div>
                </div>

                <div className="px-8 py-8 border-t border-slate-50 bg-white/90 backdrop-blur-md shrink-0 sticky bottom-0 z-20">
                  <div className="flex flex-col gap-6">
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="relative flex items-center mt-1">
                        <input
                          className="w-5 h-5 rounded-lg border-[3px] border-slate-900 checked:bg-slate-900 checked:border-slate-900 transition-all cursor-pointer appearance-none shadow-sm"
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                        />
                        <svg className={`absolute left-1 top-1 w-3 h-3 text-white pointer-events-none transition-transform duration-300 ${acceptedTerms ? 'scale-100' : 'scale-0'}`} fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-900 transition-colors leading-relaxed uppercase tracking-tight">I have read and unequivocally agree to the <span className="text-slate-900 underline underline-offset-4 decoration-2">Harvard Learning TERMS & CONDITIONS</span> and all associated identity protocols.</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className={acceptedTerms ? 'block animate-fade-in' : 'hidden'}>
              <button
                type="submit"
                className="w-full py-6 rounded-3xl font-black tracking-[0.25em] flex flex-col items-center justify-center gap-1 mt-8 transition-all duration-500 shadow-2xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.01] active:scale-95 disabled:opacity-50 uppercase text-sm"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-black">Processing Security...</span>
                    </div>
                    {uploadStatus && <span className="text-[10px] font-bold opacity-80 tracking-widest animate-pulse">{uploadStatus}</span>}
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      Submit KYC & Complete Profile
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CompleteProfile;

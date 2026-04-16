import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../utils/supabase';
import DisclaimerOverlay from '../../components/DisclaimerOverlay';
import SignaturePad from '../../components/common/SignaturePad';

const INDIA_STATES_CITIES = {
  "Andhra Pradesh": ["Visakhapatnam","Vijayawada","Guntur","Nellore","Kurnool","Rajahmundry","Tirupati","Kakinada","Kadapa","Anantapur"],
  "Arunachal Pradesh": ["Itanagar","Naharlagun","Pasighat","Tawang","Ziro","Bomdila","Roing","Tezu","Aalo","Khonsa"],
  "Assam": ["Guwahati","Silchar","Dibrugarh","Jorhat","Nagaon","Tinsukia","Tezpur","Bongaigaon","Dhubri","Diphu"],
  "Bihar": ["Patna","Gaya","Bhagalpur","Muzaffarpur","Darbhanga","Arrah","Begusarai","Chhapra","Katihar","Munger"],
  "Chhattisgarh": ["Raipur","Bhilai","Bilaspur","Korba","Durg","Rajnandgaon","Jagdalpur","Ambikapur","Raigarh","Chirmiri"],
  "Goa": ["Panaji","Margao","Vasco da Gama","Mapusa","Ponda","Bicholim","Curchorem","Sanquelim","Canacona","Pernem"],
  "Gujarat": ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar","Jamnagar","Junagadh","Gandhinagar","Anand","Morbi"],
  "Haryana": ["Faridabad","Gurugram","Panipat","Ambala","Yamunanagar","Rohtak","Hisar","Karnal","Sonipat","Panchkula"],
  "Himachal Pradesh": ["Shimla","Mandi","Solan","Dharamsala","Kullu","Hamirpur","Chamba","Una","Bilaspur","Nahan"],
  "Jharkhand": ["Ranchi","Jamshedpur","Dhanbad","Bokaro","Deoghar","Hazaribagh","Giridih","Ramgarh","Phusro","Medininagar"],
  "Karnataka": ["Bengaluru","Mysuru","Hubballi","Mangaluru","Belagavi","Davanagere","Ballari","Vijayapura","Shivamogga","Tumakuru"],
  "Kerala": ["Thiruvananthapuram","Kochi","Kozhikode","Thrissur","Kollam","Palakkad","Alappuzha","Malappuram","Kottayam","Kannur"],
  "Madhya Pradesh": ["Indore","Bhopal","Jabalpur","Gwalior","Ujjain","Sagar","Ratlam","Satna","Dewas","Murwara"],
  "Maharashtra": ["Mumbai","Pune","Nagpur","Thane","Nashik","Aurangabad","Solapur","Amravati","Navi Mumbai","Kolhapur"],
  "Manipur": ["Imphal","Thoubal","Bishnupur","Churachandpur","Ukhrul","Senapati","Chandel","Tamenglong","Jiribam","Moreh"],
  "Meghalaya": ["Shillong","Tura","Jowai","Nongpoh","Baghmara","Williamnagar","Resubelpara","Nongstoin","Mairang","Khliehriat"],
  "Mizoram": ["Aizawl","Lunglei","Saiha","Champhai","Kolasib","Serchhip","Lawngtlai","Mamit","Hnahthial","Khawzach"],
  "Nagaland": ["Kohima","Dimapur","Mokokchung","Tuensang","Wokha","Zunieboto","Mon","Phek","Longleng","Kiphire"],
  "Odisha": ["Bhubaneswar","Cuttack","Rourkela","Brahmapur","Sambalpur","Puri","Balasore","Bhadrak","Baripada","Jharsuguda"],
  "Punjab": ["Ludhiana","Amritsar","Jalandhar","Patiala","Bathinda","Mohali","Pathankot","Hoshiarpur","Batala","Moga"],
  "Rajasthan": ["Jaipur","Jodhpur","Kota","Bikaner","Ajmer","Udaipur","Bhilwara","Alwar","Bharatpur","Sikar"],
  "Sikkim": ["Gangtok","Namchi","Mangan","Gyalshing","Rangpo","Jorethang","Nayabazar","Singtam","Ravangla","Yuksom"],
  "Tamil Nadu": ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem","Tirunelveli","Vellore","Erode","Thoothukudi","Dindigul"],
  "Telangana": ["Hyderabad","Warangal","Nizamabad","Karimnagar","Khammam","Mahbubnagar","Nalgonda","Adilabad","Suryapet","Miryalaguda"],
  "Tripura": ["Agartala","Udaipur","Dharmanagar","Kailasahar","Belonia","Khowai","Ambassa","Sonamura","Sabroom","Teliamura"],
  "Uttar Pradesh": ["Lucknow","Kanpur","Agra","Varanasi","Meerut","Allahabad","Ghaziabad","Bareilly","Aligarh","Moradabad"],
  "Uttarakhand": ["Dehradun","Haridwar","Roorkee","Haldwani","Rudrapur","Kashipur","Rishikesh","Kotdwar","Ramnagar","Mussoorie"],
  "West Bengal": ["Kolkata","Howrah","Durgapur","Asansol","Siliguri","Bardhaman","Malda","Baharampur","Habra","Kharagpur"],
  "Andaman and Nicobar Islands": ["Port Blair","Car Nicobar","Little Andaman","Diglipur","Rangat","Mayabunder","Ferrargunj","Prothrapur","Nancowrie","Campbell Bay"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman","Diu","Silvassa"],
  "Delhi": ["New Delhi","Central Delhi","East Delhi","North Delhi","North East Delhi","North West Delhi","Shahdara","South Delhi","South East Delhi","South West Delhi","West Delhi"],
  "Jammu and Kashmir": ["Srinagar","Jammu","Anantnag","Baramulla","Sopore","Kathua","Udhampur","Poonch","Leh","Kargil"],
  "Ladakh": ["Leh","Kargil"],
  "Lakshadweep": ["Kavaratti","Agatti","Amini","Andrott","Kadmat"],
  "Puducherry": ["Puducherry","Karaikal","Mahe","Yanam"]
};

const STATES = Object.keys(INDIA_STATES_CITIES).sort();

const CompleteProfile = ({ profile, user, onComplete }) => {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailValue, setEmailValue] = useState(profile?.email || '');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [address, setAddress] = useState('');
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

  const sendEmailNotification = async (candidateData) => {
    try {
      // Using Web3Forms for a zero-backend, zero-database change notification
      // You can get a free access key at https://web3forms.com/
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: "33b16dfe-bac0-40f9-8137-1c00c3b758f8",
          subject: `NEW REGISTRATION: ${profile.full_name}`,
          from_name: "Elitetoolistic Portal",
          recipient: "kabirhaldar4444@gmail.com",
          message: `
            A new candidate has completed their profile:
            - Name: ${profile?.full_name || 'New Candidate'}
            - Email: ${emailValue || user?.email || 'N/A'}
            - Phone: ${candidateData.phone}
            - Location: ${candidateData.location}
            
            UPLOADED DOCUMENTS:
            - Profile Photo: ${candidateData.photoUrl}
            - Aadhaar (Front): ${candidateData.frontUrl}
            - Aadhaar (Back): ${candidateData.backUrl}
            - PAN Card: ${candidateData.panUrl}
            - Signature: ${candidateData.signUrl}
            
            Documents are also mirrored in the Admin Dashboard.
          `
        })
      });
    } catch (err) {
      console.error('Email Notification Error:', err);
      // We don't throw here to avoid blocking the user flow if the email fails
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

      setUploadStatus('Initializing your dashboard...');

      const fullAddress = `${address ? address + ', ' : ''}${selectedCity}, ${selectedState}`;

      const { error } = await supabase.from('profiles').update({
        phone,
        address: fullAddress,
        aadhaar_front_url: frontUrl,
        aadhaar_back_url: backUrl,
        pan_url: panUrl,
        signature_url: signUrl,
        profile_photo_url: photoUrl,
        profile_completed: true
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
        signUrl
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
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] opacity-70">Step 2: Elitetoolistic Global Verification</p>
        </div>

        {error && (
          <div className="mb-8 p-5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 text-xs font-black text-center uppercase tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="space-y-8">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary-600 flex items-center gap-3">
              <span className="w-1.5 h-5 bg-primary-600 rounded-full"></span>
              Personal Credentials
            </h4>
            
            <div className="flex flex-col items-center gap-6 p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 group transition-all hover:border-primary-300">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Livestream Verification</p>
                <p className="text-xs font-bold text-slate-600">Take a high-quality profile photo *</p>
              </div>

              {!showCamera && !profilePhoto && (
                <button type="button" onClick={startCamera} className="w-32 h-32 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all border-4 border-white bg-white shadow-xl hover:scale-105 gap-2 group-hover:shadow-primary-500/10">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
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
                <label className="text-xs font-black text-slate-800 uppercase tracking-widest ml-1">State / UT *</label>
                <select value={selectedState} onChange={handleStateChange} style={selectStyle} required>
                  <option value="">Select State</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 uppercase tracking-widest ml-1">City / District *</label>
                <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} style={selectStyle} required disabled={!selectedState}>
                  <option value="">{selectedState ? 'Choose City' : 'Pending State Selection...'}</option>
                  {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
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
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                          </div>
                          <span className="text-[10px] font-black truncate w-full uppercase tracking-widest">{state.name}</span>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center mb-2 group-hover:text-slate-400 transition-colors">
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
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

            <div className="bg-slate-50/80 rounded-[2rem] border border-slate-200 p-8 space-y-6">
              <div className="space-y-4 max-h-80 overflow-y-auto pr-4 custom-scrollbar">
                <div className="space-y-2">
                  <h5 className="text-[11px] font-black uppercase text-slate-900 tracking-wider">1. Identity Verification and Authentication</h5>
                  <p className="text-[13px] text-slate-600 leading-relaxed font-medium">To ensure the integrity of the examination process and to prevent proxy attendance, the Candidate hereby authorizes the Portal to capture a live photograph (selfie) at the commencement of and/or during the examination. This image will be used solely to authenticate the Candidate’s identity against registered records. Failure to provide a clear image or any attempt to bypass this authentication may result in immediate disqualification.</p>
                </div>

                <div className="space-y-2">
                  <h5 className="text-[11px] font-black uppercase text-slate-900 tracking-wider">2. Purpose of Certification and Employment Disclaimer</h5>
                  <p className="text-[13px] text-slate-600 leading-relaxed font-medium">The Candidate acknowledges and agrees that this certification is intended solely for personal and professional growth.</p>
                  <ul className="list-disc ml-4 space-y-1 text-[13px] text-slate-600 font-medium">
                    <li><span className="font-bold text-slate-800">No Guarantee of Employment:</span> Successful completion of the exam and issuance of a certificate does not guarantee a job offer, placement, or any form of employment.</li>
                    <li><span className="font-bold text-slate-800">No Guarantee of Financial Increase:</span> This certification does not entitle the Candidate to a salary hike, promotion, or bonus from any current or future employer.</li>
                  </ul>
                  <p className="text-[13px] text-slate-600 leading-relaxed font-medium">The Portal and its affiliates are not liable for any career expectations not met following the attainment of this certification.</p>
                </div>

                <div className="space-y-2">
                  <h5 className="text-[11px] font-black uppercase text-slate-900 tracking-wider">3. Academic Integrity</h5>
                  <p className="text-[13px] text-slate-600 leading-relaxed font-medium">The Candidate agrees to complete the examination independently without the use of unauthorized materials, AI tools, or external assistance. Any detected malpractice will lead to the permanent banning of the Candidate’s profile and the nullification of any previous results.</p>
                </div>

                <div className="space-y-2">
                  <h5 className="text-[11px] font-black uppercase text-slate-900 tracking-wider">4. Limitation of Liability</h5>
                  <p className="text-[13px] text-slate-600 leading-relaxed font-medium">The Portal shall not be held responsible for technical failures on the Candidate’s end, including but not limited to internet connectivity issues, hardware malfunctions, or power outages during the examination session.</p>
                </div>
              </div>

              <label className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200 cursor-pointer group transition-all hover:border-primary-400">
                <div className="relative flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 transition-all cursor-pointer"
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 leading-tight group-hover:text-primary-700 transition-colors">
                  I have read, understood, and agree to follow all the legal terms and academic integrity policies mentioned above.
                </span>
              </label>
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

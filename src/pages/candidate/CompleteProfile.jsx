import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../utils/supabase';

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
  "Mizoram": ["Aizawl","Lunglei","Saiha","Champhai","Kolasib","Serchhip","Lawngtlai","Mamit","Hnahthial","Khawzawl"],
  "Nagaland": ["Kohima","Dimapur","Mokokchung","Tuensang","Wokha","Zunheboto","Mon","Phek","Longleng","Kiphire"],
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

const CompleteProfile = ({ profile, onComplete }) => {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [address, setAddress] = useState('');
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const availableCities = selectedState ? INDIA_STATES_CITIES[selectedState] || [] : [];

  const handlePhoneChange = (e) => {
    // Only allow digits, spaces, + sign
    let val = e.target.value.replace(/[^\d\s+]/g, '');
    // Auto-prefix +91 if not started
    if (val.length > 0 && !val.startsWith('+')) {
      val = '+91 ' + val.replace(/\+91\s?/, '');
    }
    setPhone(val);
    // Validate: must be +91 followed by 10 digits
    const digits = val.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
      setPhoneError('');
    } else if (val.length > 4) {
      setPhoneError('Enter a valid 10-digit Indian mobile number');
    } else {
      setPhoneError('');
    }
  };

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    setSelectedCity('');
  };

  const startCamera = async () => {
    setShowCamera(true);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
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
    const fileExt = file instanceof Blob ? 'jpg' : file.name.split('.').pop();
    const fileName = `${profile.id}/${path}-${Math.random()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('aadhaar_cards').upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('aadhaar_cards').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!profilePhoto) return setError('Please click your photo to continue.');
    const digits = phone.replace(/\D/g, '');
    if (!digits.startsWith('91') || digits.length !== 12) return setError('Please enter a valid 10-digit Indian mobile number.');
    if (!selectedState) return setError('Please select your state.');
    if (!selectedCity) return setError('Please select your city.');
    setUploading(true);
    try {
      let frontUrl = '', backUrl = '', photoUrl = '';
      try { if (aadhaarFront) frontUrl = await handleFileUpload(aadhaarFront, 'front'); } catch (e) { console.error(e); }
      try { if (aadhaarBack) backUrl = await handleFileUpload(aadhaarBack, 'back'); } catch (e) { console.error(e); }
      try { if (profilePhoto) photoUrl = await handleFileUpload(profilePhoto, 'profile-photo'); } catch (e) { console.error(e); }

      const fullAddress = `${address ? address + ', ' : ''}${selectedCity}, ${selectedState}`;

      const { error } = await supabase.from('profiles').update({
        phone,
        address: fullAddress,
        aadhaar_front_url: frontUrl,
        aadhaar_back_url: backUrl,
        profile_photo_url: photoUrl,
        profile_completed: true
      }).eq('id', profile.id);

      if (error) throw error;
      if (onComplete) await onComplete();
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const inputStyle = { padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-dark)', width: '100%', fontSize: '14px', outline: 'none' };
  const selectStyle = { ...inputStyle, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '18px', paddingRight: '40px' };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--premium-bg)' }}>
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="glass-card-saas w-full max-w-2xl relative z-10 p-8 md:p-12 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center mx-auto mb-5 shadow-lg">
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2 text-[color:var(--text-dark)]">Candidate Registration</h2>
          <p className="text-[color:var(--text-light)] font-medium">Complete your profile to access your assigned exams.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/30 text-sm font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Photo */}
          <div className="flex flex-col items-center gap-4">
            <label className="text-sm font-bold uppercase tracking-widest text-[color:var(--text-light)]">Candidate Photo *</label>
            {!showCamera && !profilePhoto && (
              <div onClick={startCamera} className="w-32 h-32 rounded-full flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all border-2 border-dashed border-primary-500/40 bg-primary-500/5 hover:bg-primary-500/10 gap-2">
                <svg width="32" height="32" className="text-primary-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
                <span className="text-xs font-bold text-primary-500">Click Photo</span>
              </div>
            )}
            {showCamera && (
              <div className="relative w-full max-w-xs">
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl border-2 border-primary-500 shadow-lg shadow-primary-500/20" />
                <button type="button" onClick={capturePhoto} className="absolute bottom-3 left-1/2 -translate-x-1/2 py-2 px-6 rounded-full font-bold text-sm bg-primary-500 text-white shadow-lg hover:bg-primary-400 transition-all">
                  Capture
                </button>
              </div>
            )}
            {profilePhoto && !showCamera && (
              <div className="relative">
                <img src={URL.createObjectURL(profilePhoto)} alt="Candidate" className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500 shadow-lg shadow-emerald-500/20" />
                <button type="button" onClick={startCamera} className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[color:var(--card-bg)] border-2 border-emerald-500 flex items-center justify-center text-sm hover:scale-110 transition-all">
                  🔄
                </button>
              </div>
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[color:var(--text-dark)] flex items-center gap-2">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Phone Number *
            </label>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-4 rounded-xl border font-bold text-sm shrink-0" style={{ border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-dark)' }}>
                🇮🇳 +91
              </div>
              <input
                type="tel"
                placeholder="98765 43210"
                value={phone.replace(/^\+91\s?/, '')}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                  const val = '+91 ' + raw;
                  setPhone(val);
                  if (raw.length === 10) setPhoneError('');
                  else if (raw.length > 0) setPhoneError('Enter a valid 10-digit mobile number');
                  else setPhoneError('');
                }}
                maxLength={10}
                style={inputStyle}
                className="flex-1"
              />
            </div>
            {phoneError && <p className="text-xs text-red-500 font-semibold">{phoneError}</p>}
          </div>

          {/* State & City Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[color:var(--text-dark)]">State / UT *</label>
              <div className="relative">
                <select value={selectedState} onChange={handleStateChange} style={selectStyle} required>
                  <option value="">Select State</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[color:var(--text-dark)]">City *</label>
              <div className="relative">
                <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} style={selectStyle} required disabled={!selectedState}>
                  <option value="">{selectedState ? 'Select City' : 'Select State first'}</option>
                  {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Street Address (optional) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[color:var(--text-dark)]">Street / House Address <span className="text-[color:var(--text-light)] font-normal">(optional)</span></label>
            <input
              type="text"
              placeholder="Flat no., Street name, Locality..."
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Aadhaar Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[{ label: 'Aadhaar Front', state: aadhaarFront, setter: setAadhaarFront }, { label: 'Aadhaar Back', state: aadhaarBack, setter: setAadhaarBack }].map(({ label, state, setter }) => (
              <div key={label} className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[color:var(--text-dark)]">{label}</label>
                <div className="relative">
                  <input type="file" accept="image/*" onChange={e => setter(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                  <div className={`p-5 rounded-xl border-2 border-dashed text-center text-sm font-semibold transition-all ${state ? 'border-primary-500/50 bg-primary-500/5 text-primary-500' : 'border-[color:var(--glass-border)] bg-[color:var(--input-bg)] text-[color:var(--text-light)]'}`}>
                    {state ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                        {state.name.length > 20 ? state.name.slice(0, 20) + '…' : state.name}
                      </span>
                    ) : (
                      <span className="flex flex-col items-center gap-1">
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                        Upload {label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="btn-premium py-4 font-black tracking-wide flex items-center justify-center gap-2 mt-2 text-base hover:scale-[1.02] transition-all"
            disabled={uploading}
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Registering...
              </>
            ) : (
              <>
                Complete Registration
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;

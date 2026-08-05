import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';

const indianStates = [
  "Select State", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function Admission() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedId, setSubmittedId] = useState(null);

  // Script Language (Both, English, Hindi)
  const [activeScriptLang, setActiveScriptLang] = useState('both');

  // Step 1 Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [courseName, setCourseName] = useState('');

  // Step 2 Form Fields
  const [pincode, setPincode] = useState('');
  const [stateName, setStateName] = useState('Select State');
  const [cityName, setCityName] = useState('');
  const [address, setAddress] = useState('');

  // Video Recording & Media
  const [videoStream, setVideoStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Identity Documents Previews
  const [aadhaarFrontPreview, setAadhaarFrontPreview] = useState(null);
  const [aadhaarBackPreview, setAadhaarBackPreview] = useState(null);
  const [panCardPreview, setPanCardPreview] = useState(null);

  // Signature Canvas
  const canvasRef = useRef(null);
  const [signatureData, setSignatureData] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  // Terms Acceptance
  const [termsAccepted, setTermsAccepted] = useState(false);

  // User IP Address
  const [userIp, setUserIp] = useState('');

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIp(data.ip || ''))
      .catch(() => setUserIp('Not captured'));
  }, []);

  // Location Auto-Detect Handler
  const handleDetectLocation = () => {
    if ("geolocation" in navigator) {
      setLoadingMsg("Detecting location...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await res.json();
            if (data) {
              if (data.postcode) setPincode(data.postcode);
              if (data.principalSubdivision) setStateName(data.principalSubdivision);
              if (data.city || data.locality) setCityName(data.city || data.locality);
            }
          } catch (e) {
            console.warn('Geocoding notice:', e);
          } finally {
            setLoadingMsg("");
          }
        },
        () => setLoadingMsg("")
      );
    }
  };

  // Video Recorder Controls
  const startCamera = async () => {
    try {
      setErrorMsg('');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setVideoStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera/mic access error:', err);
      setErrorMsg('Camera and Microphone permissions are required to record your live video statement. Please allow permissions.');
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setIsCameraActive(false);
  };

  const startRecording = () => {
    if (!videoStream) return;
    recordedChunksRef.current = [];
    
    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const mediaRecorder = new MediaRecorder(videoStream, { 
        mimeType,
        videoBitsPerSecond: 2500000 
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const maxSizeBytes = 500 * 1024 * 1024;
        if (blob.size > maxSizeBytes) {
          setErrorMsg('Recorded video exceeds the maximum 500 MB limit. Please record a shorter statement.');
          stopCamera();
          return;
        }

        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideoBlob(blob);
        setRecordedVideoUrl(videoUrl);
        stopCamera();
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTimer(0);
      timerRef.current = setInterval(() => {
        setRecordingTimer(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting video recording:', err);
      setErrorMsg('Failed to start video recording. Please ensure camera/mic permissions are enabled.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const retakeVideo = () => {
    setRecordedVideoBlob(null);
    setRecordedVideoUrl(null);
    setRecordingTimer(0);
    startCamera();
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Signature Pad Handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e1b4b';
    setIsDrawing(true);
    setHasSigned(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (canvasRef.current) {
        setSignatureData(canvasRef.current.toDataURL('image/png'));
      }
    }
  };

  const clearSignature = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setSignatureData(null);
      setHasSigned(false);
    }
  };

  // File Upload Handler
  const handleFileChange = (e, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Step 1 Submit
  const handleStep1Submit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) return setErrorMsg('Please enter your full name.');
    if (!email.trim() || !email.includes('@')) return setErrorMsg('Please enter a valid email address.');
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) return setErrorMsg('Please enter a valid 10-digit mobile number.');
    if (!courseName.trim()) return setErrorMsg('Please enter the course name you are applying for.');

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const blobToDataURL = (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  };

  // Storage Upload Helper
  const uploadAsset = async (fileOrBase64, filenamePrefix) => {
    if (!fileOrBase64) return '';

    const fileExt = (fileOrBase64 instanceof Blob && fileOrBase64.type?.includes('video')) ? 'webm' : 'jpg';
    const path = `${filenamePrefix}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    if (supabase && supabase.storage) {
      try {
        let fileBody = fileOrBase64;
        let contentType = 'image/jpeg';

        if (fileOrBase64 instanceof Blob) {
          fileBody = fileOrBase64;
          contentType = fileOrBase64.type || (fileExt === 'webm' ? 'video/webm' : 'image/jpeg');
        } else if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:')) {
          const parts = fileOrBase64.split(';base64,');
          contentType = parts[0].split(':')[1] || 'image/jpeg';
          const raw = window.atob(parts[1]);
          const uInt8Array = new Uint8Array(raw.length);
          for (let i = 0; i < raw.length; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
          }
          fileBody = new Blob([uInt8Array], { type: contentType });
        }

        let targetBucket = 'admissions';
        let uploadRes = await supabase.storage.from(targetBucket).upload(path, fileBody, {
          contentType: contentType,
          upsert: true
        });

        if (uploadRes.error) {
          console.warn('Admissions bucket upload notice:', uploadRes.error.message);
          targetBucket = 'aadhaar_cards';
          uploadRes = await supabase.storage.from(targetBucket).upload(path, fileBody, {
            contentType: contentType,
            upsert: true
          });
        }

        if (!uploadRes.error) {
          const { data } = supabase.storage.from(targetBucket).getPublicUrl(path);
          if (data && data.publicUrl) {
            return data.publicUrl;
          }
        } else {
          console.warn('Supabase storage upload fallback triggered:', uploadRes.error.message);
        }
      } catch (err) {
        console.warn('Supabase storage upload notice:', err);
      }
    }

    if (typeof fileOrBase64 === 'string') {
      return fileOrBase64;
    }

    if (fileOrBase64 instanceof Blob) {
      const dataUrl = await blobToDataURL(fileOrBase64);
      return dataUrl;
    }

    return '';
  };

  // Step 2 Final Submit
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!pincode.trim()) return setErrorMsg('Please enter your 6-digit PIN code.');
    if (!stateName || stateName === 'Select State') return setErrorMsg('Please select your State / UT.');
    if (!cityName.trim()) return setErrorMsg('Please enter your City / District.');
    if (!recordedVideoBlob && !recordedVideoUrl) return setErrorMsg('Please record your live video statement reading the required script.');
    if (!aadhaarFrontPreview) return setErrorMsg('Please upload your Aadhaar Card (Front) image.');
    if (!aadhaarBackPreview) return setErrorMsg('Please upload your Aadhaar Card (Back) image.');
    if (!panCardPreview) return setErrorMsg('Please upload your PAN Card image.');
    if (!signatureData) return setErrorMsg('Please draw your digital signature on the signature pad.');
    if (!termsAccepted) return setErrorMsg('Please check the legal terms acknowledgement box to proceed.');

    setLoading(true);
    setLoadingMsg('Processing documents & saving application...');

    try {
      const [photoUrl, frontUrl, backUrl, panUrl, signUrl] = await Promise.all([
        uploadAsset(recordedVideoBlob, 'profile_video'),
        uploadAsset(aadhaarFrontPreview, 'aadhaar_front'),
        uploadAsset(aadhaarBackPreview, 'aadhaar_back'),
        uploadAsset(panCardPreview, 'pan_card'),
        uploadAsset(signatureData, 'signature')
      ]);

      const formatDocLink = (url) => {
        if (url && typeof url === 'string' && url.startsWith('http')) {
          return url;
        }
        return 'Saved in Admin Portal';
      };

      const admissionRecord = {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        course_name: courseName.trim(),
        pincode: pincode.trim(),
        state: stateName.trim(),
        city: cityName.trim(),
        address: address.trim(),
        aadhaar_front_url: frontUrl || (aadhaarFrontPreview || ''),
        aadhaar_back_url: backUrl || (aadhaarBackPreview || ''),
        pan_url: panUrl || (panCardPreview || ''),
        signature_url: signUrl || (signatureData || ''),
        profile_photo_url: photoUrl || (recordedVideoUrl || ''),
        video_url: photoUrl || (recordedVideoUrl || ''),
        ip_address: userIp || 'Not captured',
        status: 'pending',
        created_at: new Date().toISOString()
      };

      let recordId = `HL-ADM-${Date.now().toString().slice(-6)}`;

      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('admissions')
            .insert([admissionRecord])
            .select();

          if (data && data[0]) recordId = data[0].id;
          if (error) console.warn('Supabase DB Notice:', error.message);
        } catch (dbErr) {
          console.warn('DB Insert fallback notice:', dbErr);
        }
      }

      // Save local backup
      const existingLocal = JSON.parse(localStorage.getItem('harvard_admissions') || '[]');
      existingLocal.unshift({ ...admissionRecord, id: recordId });
      localStorage.setItem('harvard_admissions', JSON.stringify(existingLocal));

      // Backup notification via Web3Forms (Executive Format)
      try {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_key: '71d5ef87-88ee-4b57-9315-1340e1a9350e',
            subject: `NEW Harvard Learning Admission Application — ${fullName}`,
            from_name: `Harvard Learning Admission Portal`,
            email: email,
            recipient: 'support@harvardlearning.in',
            message: `============================================================
           HARVARD LEARNING ADMISSION NOTIFICATION
============================================================

Dear Admissions Committee,

A new candidate admission application has been submitted on the Harvard Learning Portal.

------------------------------------------------------------
CANDIDATE PROFILE DETAILS
------------------------------------------------------------
• Application ID : ${recordId}
• Full Name      : ${fullName.trim()}
• Email Address  : ${email.trim().toLowerCase()}
• Phone Number   : ${phone.trim()}
• Enrolled Course: ${courseName.trim()}

------------------------------------------------------------
RESIDENTIAL & NETWORK VERIFICATION
------------------------------------------------------------
• Address  : ${address.trim() || 'N/A'}
• Location : ${cityName.trim()}, ${stateName.trim()} - ${pincode.trim()}
• IP Address : ${userIp || 'Not captured'}

------------------------------------------------------------
VERIFICATION DOCUMENTS & RECORDINGS (DIRECT LINKS)
------------------------------------------------------------
• Live Video Statement : ${formatDocLink(photoUrl)}
• Aadhaar Card (Front) : ${formatDocLink(frontUrl)}
• Aadhaar Card (Back)  : ${formatDocLink(backUrl)}
• PAN Card             : ${formatDocLink(panUrl)}
• Digital Signature    : ${formatDocLink(signUrl)}

============================================================
       Harvard Learning Academic Governance System
============================================================`
          })
        });
      } catch (e) {
        console.warn('Web3Forms Notice:', e);
      }

      setSubmittedId(recordId);

    } catch (err) {
      console.error('Final Submit Error:', err);
      setErrorMsg(err.message || 'Failed to submit admission application. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const inputClass = "w-full bg-[#f8fafc] border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-800 text-sm font-semibold focus:outline-none focus:border-[#A51C30] focus:ring-4 focus:ring-[#A51C30]/10 transition-all placeholder:text-slate-400";
  const labelClass = "block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 ml-1";

  if (submittedId) {
    return (
      <div className="min-h-screen bg-[#fffcf9] flex items-center justify-center p-4 font-sans text-slate-900 selection:bg-rose-100">
        <div className="max-w-lg w-full bg-white border border-slate-100 rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#A51C30] to-[#C49619]" />
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto text-3xl font-black shadow-inner">
            ✓
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight font-serif">Application Submitted!</h2>
            <p className="text-slate-500 text-xs leading-relaxed">Your admission details, live video statement, and identity verification documents have been securely processed.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
            <span className="text-slate-400 block font-bold uppercase tracking-widest text-[10px]">Reference Number</span>
            <span className="font-mono text-[#A51C30] font-black text-lg">{submittedId}</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Our admissions department will verify your records. Updates will be dispatched to <strong>{email}</strong>.
          </p>
          <div className="pt-4 border-t border-slate-100">
            <p className="text-sm font-bold text-slate-700">
              Thank you for submitting your admission application!
            </p>
            <p className="text-xs text-slate-400 mt-1">
              You may close this window now.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffcf9] py-12 px-4 font-sans text-slate-900 selection:bg-rose-100 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Academic Auras */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#fffcf9]">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#A51C30]/5 rounded-full blur-[140px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-[#C49619]/5 rounded-full blur-[140px] opacity-40" />
      </div>

      <div className="relative z-10 max-w-3xl w-full">
        
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div 
            onClick={() => navigate('/login')}
            className="w-32 h-auto p-4 bg-white rounded-3xl shadow-xl border border-slate-100 cursor-pointer hover:scale-[1.03] transition-transform duration-500 mb-6"
          >
            <img src="/Elitetoolistic.png" alt="Harvard Learning" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-widest text-[#1e293b] uppercase font-serif">ADMISSION FORM</h1>
            <p className="text-[11px] font-black tracking-[0.3em] text-[#A51C30] uppercase">
              STEP {step} OF 2: {step === 1 ? 'INITIAL DETAILS' : 'LIVE VIDEO & IDENTITY VERIFICATION'}
            </p>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden border-t-4 border-t-[#A51C30]">
          
          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-between px-8 py-5 bg-slate-50 border-b border-slate-100">
            <div className={`flex items-center gap-3 ${step >= 1 ? 'text-[#A51C30]' : 'text-slate-400'}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${step >= 1 ? 'bg-[#A51C30] text-white shadow-md' : 'bg-slate-200 text-slate-500'}`}>1</span>
              <span className="text-[11px] font-black uppercase tracking-widest">Step 1: Details</span>
            </div>
            <div className="flex-1 mx-6 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div className={`h-full bg-[#A51C30] transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`} />
            </div>
            <div className={`flex items-center gap-3 ${step >= 2 ? 'text-[#A51C30]' : 'text-slate-400'}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${step >= 2 ? 'bg-[#A51C30] text-white shadow-md' : 'bg-slate-200 text-slate-500'}`}>2</span>
              <span className="text-[11px] font-black uppercase tracking-widest">Step 2: Verification</span>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-8 md:p-12 space-y-8">

            {/* Error Toast */}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-shake">
                <span>⚠️ {errorMsg}</span>
                <button onClick={() => setErrorMsg('')} className="text-rose-500 hover:text-rose-800 font-bold ml-4 text-base">✕</button>
              </div>
            )}

            {/* STEP 1: CANDIDATE INFORMATION */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-6 animate-fade-in">
                
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>FULL NAME *</label>
                    <input 
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>EMAIL ADDRESS *</label>
                    <input 
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>PHONE NUMBER *</label>
                    <div className="flex gap-3">
                      <span className="bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-600 flex items-center">
                        +91
                      </span>
                      <input 
                        type="tel"
                        required
                        placeholder="10-digit number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>COURSE NAME *</label>
                    <input 
                      type="text"
                      required
                      placeholder="Enter the course you're applying for"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white font-black py-4 px-8 rounded-2xl text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 group"
                  >
                    PROCEED TO VERIFICATION
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" className="group-hover:translate-x-1 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: VIDEO RECORDING, LOCATION & IDENTITY DOCUMENTS */}
            {step === 2 && (
              <form onSubmit={handleFinalSubmit} className="space-y-8 animate-fade-in">
                
                {/* 2A: LIVE VIDEO STATEMENT */}
                <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm flex items-center gap-2 font-serif uppercase tracking-wider">
                        <span>🎥</span> STEP 2A: LIVE VIDEO STATEMENT *
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Record a live video reading the read-aloud script below.
                      </p>
                    </div>
                    
                    {/* Script Language Switcher */}
                    <div className="flex items-center bg-slate-200 p-1 rounded-xl text-xs font-bold">
                      <button 
                        type="button"
                        onClick={() => setActiveScriptLang('both')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${activeScriptLang === 'both' ? 'bg-white text-[#A51C30] shadow-sm' : 'text-slate-600'}`}
                      >
                        Both
                      </button>
                      <button 
                        type="button"
                        onClick={() => setActiveScriptLang('en')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${activeScriptLang === 'en' ? 'bg-white text-[#A51C30] shadow-sm' : 'text-slate-600'}`}
                      >
                        English
                      </button>
                      <button 
                        type="button"
                        onClick={() => setActiveScriptLang('hi')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${activeScriptLang === 'hi' ? 'bg-white text-[#A51C30] shadow-sm' : 'text-slate-600'}`}
                      >
                        हिंदी
                      </button>
                    </div>
                  </div>

                  {/* Camera Display Box */}
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video max-h-[340px] flex items-center justify-center border border-slate-800 shadow-inner">
                    
                    {isCameraActive && !recordedVideoUrl && (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                    )}

                    {recordedVideoUrl && (
                      <video src={recordedVideoUrl} controls className="w-full h-full object-contain bg-black"></video>
                    )}

                    {!recordedVideoUrl && isCameraActive && (
                      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 px-4">
                        {!isRecording ? (
                          <button 
                            type="button" 
                            onClick={startRecording}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-2.5 rounded-full text-xs flex items-center gap-2 shadow-lg shadow-rose-600/40"
                          >
                            <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
                            Start Recording
                          </button>
                        ) : (
                          <div className="flex items-center gap-4">
                            <span className="bg-rose-600/90 text-white text-xs font-mono font-bold px-4 py-2 rounded-full border border-rose-400/30 flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                              REC {formatTimer(recordingTimer)}
                            </span>
                            <button 
                              type="button" 
                              onClick={stopRecording}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2 rounded-full text-xs border border-slate-700 shadow-lg"
                            >
                              Stop Recording
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {recordedVideoUrl && (
                      <div className="absolute top-4 right-4 z-10">
                        <button 
                          type="button"
                          onClick={retakeVideo}
                          className="bg-slate-900/90 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs border border-slate-700 shadow-lg"
                        >
                          🔄 Retake Video
                        </button>
                      </div>
                    )}

                    {!isCameraActive && !recordedVideoUrl && (
                      <div className="text-center p-6 space-y-3">
                        <button 
                          type="button"
                          onClick={startCamera}
                          className="w-14 h-14 rounded-full bg-[#A51C30]/20 text-[#A51C30] border border-[#A51C30]/30 flex items-center justify-center mx-auto text-2xl hover:scale-105 transition-all cursor-pointer"
                        >
                          📷
                        </button>
                        <p className="text-xs font-bold text-slate-300">Click to Open Camera & Microphone</p>
                      </div>
                    )}
                  </div>

                  {/* Read-Aloud Scripts */}
                  <div className="space-y-4 pt-2">
                    {(activeScriptLang === 'both' || activeScriptLang === 'en') && (
                      <div className="space-y-2">
                        <h5 className="font-black text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-2 ml-1">
                          <span className="w-2 h-2 rounded-full bg-[#A51C30]"></span>
                          PLEASE READ ALOUD (ENGLISH):
                        </h5>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-slate-700 text-xs leading-relaxed font-medium shadow-sm space-y-3">
                          <p>
                            "My name is <strong className="text-[#A51C30]">{fullName || 'test'}</strong>, and my registered email address is <strong className="text-[#A51C30]">{email || 'test@gmail.com'}</strong>. I purposely recorded this video statement to verify my profile, confirm my identity, and acknowledge my enrollment in Elite Toolistic's professional training program (available at elitetoolistic.com)."
                          </p>
                          <p>
                            "I am purchasing this course for personal skill enhancement, professional development, and career growth. I fully accept and understand that Elite Toolistic is only an educational skills-based course training provider and never offers a job promise, job placement assurance, or particular career assurances upon course completion."
                          </p>
                          <p>
                            "Furthermore, I certify that I will not file any chargebacks or complaints regarding this transaction in the future. I also promise not to share or distribute any copyrighted course materials supplied to me throughout this program. &ldquo;This statement is made freely, knowingly, and without pressure.&rdquo;"
                          </p>
                        </div>
                      </div>
                    )}

                    {(activeScriptLang === 'both' || activeScriptLang === 'hi') && (
                      <div className="space-y-2">
                        <h5 className="font-black text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-2 ml-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          कृपया ज़ोर से पढ़ें (HINDI):
                        </h5>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-slate-700 text-xs leading-relaxed font-medium shadow-sm space-y-3">
                          <p>
                            "मेरा नाम <strong className="text-emerald-700">{fullName || 'test'}</strong> है और मेरा रजिस्टर्ड ईमेल एड्रेस <strong className="text-emerald-700">{email || 'test@gmail.com'}</strong> है। मैंने यह वीडियो स्टेटमेंट जान-बूझकर रिकॉर्ड किया है ताकि मैं अपनी प्रोफ़ाइल वेरिफ़ाई कर सकूँ, अपनी पहचान कन्फ़र्म कर सकूँ और Elite Toolistic के प्रोफ़ेशनल ट्रेनिंग प्रोग्राम (जो elitetoolistic.com पर उपलब्ध है) में अपने एनरोलमेंट की पुष्टि कर सकूँ।"
                          </p>
                          <p>
                            "मैं यह कोर्स अपनी पर्सनल स्किल बढ़ाने, प्रोफ़ेशनल डेवलपमेंट और करियर में आगे बढ़ने के लिए खरीद रहा हूँ। मैं पूरी तरह से मानता और समझता हूँ कि Elite Toolistic सिर्फ़ एक एजुकेशनल स्किल-बेस्ड कोर्स ट्रेनिंग प्रोवाइडर है और कोर्स पूरा होने पर कभी भी नौकरी का वादा, नौकरी मिलने की गारंटी या किसी खास करियर की गारंटी नहीं देता है।"
                          </p>
                          <p>
                            "इसके अलावा, मैं यह सर्टिफ़ाई करता हूँ कि भविष्य में इस ट्रांसैक्शन के बारे में कोई चार्जबैक या शिकायत नहीं करूँगा। मैं यह भी वादा करता हूँ कि इस प्रोग्राम के दौरान मुझे दिए गए किसी भी कॉपीराइट वाले कोर्स मटीरियल को शेयर या डिस्ट्रीब्यूट नहीं करूँगा। &ldquo;यह स्टेटमेंट बिना किसी दबाव के, पूरी जानकारी के साथ और अपनी मर्ज़ी से दिया जा रहा है।&rdquo;"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2B: LOCATION DETAILS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="font-black text-slate-900 text-sm font-serif uppercase tracking-wider">STEP 2B: RESIDENTIAL LOCATION</h4>
                    <button 
                      type="button" 
                      onClick={handleDetectLocation}
                      className="text-xs font-bold text-[#A51C30] hover:text-[#851626] flex items-center gap-1"
                    >
                      📍 Detect Location
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className={labelClass}>PIN CODE *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="6-digit PIN"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>STATE / UT *</label>
                      <select 
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className={inputClass}
                      >
                        {indianStates.map((st, idx) => (
                          <option key={idx} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>CITY / DISTRICT *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="City Name"
                        value={cityName}
                        onChange={(e) => setCityName(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>RESIDENTIAL ADDRESS</label>
                    <input 
                      type="text" 
                      placeholder="Flat / House No., Street, Locality"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* 2C: IDENTITY DOCUMENTS */}
                <div className="space-y-4">
                  <h4 className="font-black text-slate-900 text-sm font-serif uppercase tracking-wider border-b border-slate-100 pb-2">STEP 2C: IDENTITY DOCUMENTS</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Aadhaar Front */}
                    <div className="space-y-2">
                      <label className={labelClass}>AADHAAR FRONT *</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setAadhaarFrontPreview)}
                        className="text-xs w-full text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#A51C30]/10 file:text-[#A51C30] hover:file:bg-[#A51C30]/20 cursor-pointer"
                      />
                      {aadhaarFrontPreview && (
                        <div className="h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner">
                          <img src={aadhaarFrontPreview} alt="Aadhaar Front" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Aadhaar Back */}
                    <div className="space-y-2">
                      <label className={labelClass}>AADHAAR BACK *</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setAadhaarBackPreview)}
                        className="text-xs w-full text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#A51C30]/10 file:text-[#A51C30] hover:file:bg-[#A51C30]/20 cursor-pointer"
                      />
                      {aadhaarBackPreview && (
                        <div className="h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner">
                          <img src={aadhaarBackPreview} alt="Aadhaar Back" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* PAN Card */}
                    <div className="space-y-2">
                      <label className={labelClass}>PAN CARD *</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setPanCardPreview)}
                        className="text-xs w-full text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#A51C30]/10 file:text-[#A51C30] hover:file:bg-[#A51C30]/20 cursor-pointer"
                      />
                      {panCardPreview && (
                        <div className="h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner">
                          <img src={panCardPreview} alt="PAN Card" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* 2D: DIGITAL SIGNATURE */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <label className={labelClass}>DIGITAL SIGNATURE *</label>
                    {hasSigned && (
                      <button 
                        type="button" 
                        onClick={clearSignature}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800"
                      >
                        Clear Signature
                      </button>
                    )}
                  </div>

                  <div className="border border-slate-300 rounded-2xl overflow-hidden bg-slate-50 relative shadow-inner">
                    <canvas 
                      ref={canvasRef}
                      width={700}
                      height={150}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-36 bg-white cursor-crosshair touch-none"
                    ></canvas>
                    {!hasSigned && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-bold uppercase tracking-wider opacity-60">
                        Sign Here Using Mouse or Touch Screen
                      </div>
                    )}
                  </div>
                </div>

                {/* 2E: LEGAL TERMS ACKNOWLEDGEMENT */}
                <label className="flex items-start gap-3 bg-slate-50 p-4.5 rounded-2xl border border-slate-200 cursor-pointer">
                  <input 
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#A51C30] rounded border-slate-300 focus:ring-[#A51C30]"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed font-medium">
                    I certify that all details, identity documents, digital signature, and live video statement submitted are genuine. I agree to the terms and policies of Harvard Learning.
                  </span>
                </label>

                {/* Navigation Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-4">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider transition-all"
                  >
                    ← Back to Step 1
                  </button>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="bg-[#A51C30] hover:bg-[#851626] text-white font-black py-4 px-8 rounded-2xl text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#A51C30]/20 flex items-center gap-2"
                  >
                    {loading ? (loadingMsg || 'Submitting...') : 'Complete & Submit Admission →'}
                  </button>
                </div>

              </form>
            )}

          </div>

        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#A51C30] transition-colors"
          >
            Already have an account? Sign In to Candidate Portal
          </button>
        </div>

      </div>
    </div>
  );
}

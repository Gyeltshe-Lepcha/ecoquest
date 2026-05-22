'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ImageUp,
  Leaf,
  MapPin,
  QrCode,
  Recycle,
  ScanLine,
  Sparkles,
  Trophy,
  Upload,
  Wifi,
  X,
} from 'lucide-react';

const nearbyBins = [
  { name: 'CST Block A', distance: '50m', fill: '62%', status: 'Available', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'CST Canteen', distance: '120m', fill: '48%', status: 'Available', color: 'bg-sky-100 text-sky-700' },
  { name: 'CST Library', distance: '200m', fill: '80%', status: 'Almost Full', color: 'bg-yellow-100 text-yellow-700' },
];

export default function ScanPage() {
  const [scanState, setScanState] = useState('idle');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [verification, setVerification] = useState(null);
  const [verifyError, setVerifyError] = useState('');

  const handleScan = async () => {
    setScanState('scanning');
    await new Promise((resolve) => setTimeout(resolve, 1800));
    setScanState('success');
  };

  const runModelScan = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setVerification(null);
    setVerifyError('');

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('user_id', 'USR-0042');
    formData.append('challenge_id', 'CH-001');
    formData.append('bin_id', 'BIN-001');
    formData.append('fill_level_pct', '62');
    formData.append('expected_label', 'plastic');

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Unable to analyze this image.');
      }

      setVerification(result);
      if (result.decision?.status === 'approved') {
        setScanState('success');
      }
    } catch (error) {
      setVerifyError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const prediction = verification?.prediction;
  const confidence = prediction?.confidence_pct;
  const decisionStatus = verification?.decision?.status;
  const statusLabel = decisionStatus === 'approved'
    ? 'Approved'
    : decisionStatus === 'pending'
      ? 'Review'
      : decisionStatus === 'rejected'
        ? 'Retake'
        : 'Not Full';
  const statusBg = decisionStatus === 'rejected'
    ? 'bg-rose-100'
    : decisionStatus === 'pending'
      ? 'bg-yellow-100'
      : 'bg-lime-100';
  const statusText = decisionStatus === 'rejected'
    ? 'text-rose-700'
    : decisionStatus === 'pending'
      ? 'text-yellow-700'
      : 'text-lime-700';
  const activityStats = [
    {
      label: 'Latest detection',
      value: prediction?.label ? prediction.label[0].toUpperCase() + prediction.label.slice(1) : 'Upload photo',
      icon: Recycle,
      bg: 'bg-sky-100',
      color: 'text-sky-700',
    },
    {
      label: 'Confidence',
      value: confidence != null ? `${confidence}%` : '--',
      icon: ScanLine,
      bg: 'bg-emerald-100',
      color: 'text-emerald-700',
    },
    { label: 'Bin fill level', value: '62%', icon: Wifi, bg: 'bg-yellow-100', color: 'text-yellow-700' },
    { label: 'Status', value: statusLabel, icon: CheckCircle2, bg: statusBg, color: statusText },
  ];

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <div className="overflow-hidden rounded-lg border border-white/80 bg-white/88 p-6 shadow-xl shadow-emerald-900/6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[1.8px] text-emerald-700">Smart Bin Quest</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">AI Smart Bin Activity</h1>
              <p className="mt-2 text-slate-500">Scan, sort, earn points, and keep your campus clean.</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-700">Bin is ready.</span>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_270px]">
            <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-sky-200 bg-[linear-gradient(135deg,#e0f7ff,#ecfdf5,#fff7cc)] p-5">
              <div className="absolute right-5 top-5 rounded-full bg-white/80 px-3 py-1 text-xs font-black text-emerald-700 shadow-sm">+5 EcoPoints</div>
              <div className="relative mx-auto grid h-80 max-w-md place-items-center">
                <div className="absolute h-64 w-64 rounded-full border border-emerald-300/50" />
                <div className="absolute h-48 w-48 rounded-full border border-sky-300/50" />
                <motion.div
                  className="absolute h-56 w-56 rounded-full border border-yellow-300/50"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />

                <div className="relative w-36 rounded-b-lg border-4 border-emerald-900/10 bg-emerald-700 shadow-2xl shadow-emerald-900/20">
                  <motion.div
                    className="h-8 rounded-t-lg bg-emerald-400"
                    animate={{ rotate: scanState === 'success' ? [0, -14, 0] : 0 }}
                    transition={{ duration: 1 }}
                    style={{ transformOrigin: '10% 100%' }}
                  />
                  <div className="relative h-44 overflow-hidden rounded-b">
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 bg-[linear-gradient(0deg,#bbf7d0,#34d39933)]"
                      animate={{ height: ['50%', '62%', '50%'] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    <div className="absolute inset-x-7 top-16 grid place-items-center rounded-lg bg-white/18 py-4">
                      <QrCode className="h-10 w-10 text-white" />
                    </div>
                    <motion.div
                      className="absolute left-0 right-0 h-1 bg-sky-300"
                      animate={{ top: ['18%', '84%', '18%'] }}
                      transition={{ duration: 2.3, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="absolute right-2 top-2 rounded-full bg-white/15 px-2 py-0.5 font-mono text-xs text-white">62%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {activityStats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm shadow-emerald-900/5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[1.4px] text-slate-400">{stat.label}</p>
                      <p className="text-xl font-black text-slate-950">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/80 bg-white/88 p-5 shadow-xl shadow-emerald-900/6">
          <p className="text-sm font-black uppercase tracking-[1.8px] text-yellow-700">Scan Challenge</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Sort one item now</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Use the Smart Bin scanner to log your next eco-action and help Team Green climb.</p>

          <div className="mt-5 rounded-lg bg-emerald-50 p-4 text-center">
            {scanState === 'idle' && (
              <>
                <Camera className="mx-auto h-12 w-12 text-emerald-600" />
                <p className="mt-3 font-black text-emerald-950">Ready for model scan</p>
                <p className="mt-1 text-sm text-emerald-700">Upload one item photo to classify it with waste_model2.h5.</p>
                {!selectedFile ? (
                  <label className="mx-auto mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-emerald-200 bg-white px-4 py-3 text-sm font-black text-emerald-700">
                    <ImageUp className="h-4 w-4" />
                    Upload item photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        setSelectedFile(event.target.files?.[0] ?? null);
                        setVerification(null);
                        setVerifyError('');
                      }}
                    />
                  </label>
                ) : (
                  <div className="mt-4 rounded-lg border border-emerald-100 bg-white p-3 text-left">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-black text-emerald-950">{selectedFile.name}</p>
                        <p className="text-xs font-bold text-emerald-600">Ready for AI classification</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setVerification(null);
                          setVerifyError('');
                        }}
                        className="rounded-full border border-slate-200 p-1 text-slate-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                <button onClick={handleScan} className="mt-4 rounded-lg bg-emerald-600 px-5 py-3 font-black text-white shadow-lg shadow-emerald-900/15">
                  Simulate QR Deposit
                </button>
                <button
                  onClick={runModelScan}
                  disabled={!selectedFile || isAnalyzing}
                  className="ml-2 mt-4 rounded-lg bg-sky-500 px-5 py-3 font-black text-white shadow-lg shadow-sky-900/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <Upload className={`h-4 w-4 ${isAnalyzing ? 'animate-bounce' : ''}`} />
                    {isAnalyzing ? 'Running model...' : 'Run AI Model'}
                  </span>
                </button>
                {verifyError && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-left text-sm font-bold text-rose-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {verifyError}
                  </div>
                )}
                {verification?.decision?.status && verification.decision.status !== 'approved' && (
                  <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-left">
                    <p className="font-black text-yellow-800">{verification.decision.status === 'pending' ? 'Admin review needed' : 'Try another photo'}</p>
                    <p className="mt-1 text-sm font-bold text-yellow-700">{verification.decision.message}</p>
                  </div>
                )}
              </>
            )}
            {scanState === 'scanning' && (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }} className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
                  <ScanLine className="h-7 w-7 text-sky-600" />
                </motion.div>
                <p className="mt-3 font-black text-sky-800">Scanning QR code...</p>
              </>
            )}
            {scanState === 'success' && (
              <>
                <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
                <p className="mt-3 text-xl font-black text-emerald-800">Great sorting!</p>
                <p className="mt-1 text-sm font-bold text-emerald-700">
                  {prediction?.label ? `${prediction.label} detected at ${confidence}% confidence.` : 'Plastic logged. +5 EcoPoints earned.'}
                </p>
                {verification?.decision?.message && (
                  <p className="mx-auto mt-2 max-w-xs text-sm text-emerald-700">{verification.decision.message}</p>
                )}
                <button
                  onClick={() => {
                    setScanState('idle');
                    setSelectedFile(null);
                    setVerification(null);
                    setVerifyError('');
                  }}
                  className="mt-4 rounded-lg bg-yellow-400 px-5 py-3 font-black text-emerald-950"
                >
                  Scan Another
                </button>
              </>
            )}
          </div>

          <div className="mt-5 rounded-lg bg-sky-50 p-4">
            <div className="flex items-center gap-2 text-sm font-black text-sky-800">
              <Trophy className="h-4 w-4" />
              Almost there!
            </div>
            <p className="mt-1 text-sm text-sky-700">One correct scan moves Team Green closer to Rank #1.</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-white/80 bg-white/88 p-5 shadow-xl shadow-emerald-900/6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[1.8px] text-emerald-700">Nearby Smart Bins</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Choose your next station</h2>
          </div>
          <Sparkles className="h-7 w-7 text-yellow-500" />
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {nearbyBins.map((bin) => (
            <div key={bin.name} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Leaf className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black text-slate-950">{bin.name}</p>
                    <p className="flex items-center gap-1 text-xs font-bold text-slate-500">
                      <MapPin className="h-3 w-3" />
                      {bin.distance} away
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${bin.color}`}>{bin.status}</span>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Fill level</span>
                  <span>{bin.fill}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: bin.fill }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

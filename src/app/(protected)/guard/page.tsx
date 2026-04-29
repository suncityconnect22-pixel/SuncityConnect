'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { recordVisitorEntry, recordVisitorExit, getTodayVisitors } from '@/actions/visitors';
import { uploadImage } from '@/lib/upload';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Toast from '@/components/ui/Toast';
import ImageWithModal from '@/components/ui/ImageWithModal';
import { VISITOR_TYPE_LABELS, VISITOR_TYPE_ICONS } from '@/lib/constants';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import type { VisitorType, Visitor } from '@/lib/types';

export default function GuardPage() {
  const [step, setStep] = useState<'select' | 'details'>('select');
  const [selectedType, setSelectedType] = useState<VisitorType | null>(null);
  const [houseNumber, setHouseNumber] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [todayVisitors, setTodayVisitors] = useState<Visitor[]>([]);
  const [showLog, setShowLog] = useState(false);

  const loadTodayVisitors = useCallback(async () => {
    const result = await getTodayVisitors();
    if (result.data) setTodayVisitors(result.data as Visitor[]);
  }, []);

  // Initial load
  useEffect(() => { loadTodayVisitors(); }, [loadTodayVisitors]);

  // Realtime + polling
  useRealtimeSync('visitors', loadTodayVisitors);

  const handleTypeSelect = (type: VisitorType) => {
    setSelectedType(type);
    setStep('details');
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!selectedType || !houseNumber.trim()) return;
    setLoading(true);

    let uploadedUrl = undefined;

    // Upload photo if present
    if (photoFile) {
      const url = await uploadImage(photoFile, 'visitors');
      if (url) uploadedUrl = url;
    }

    const result = await recordVisitorEntry(
      houseNumber.trim(),
      selectedType,
      visitorName.trim() || undefined,
      uploadedUrl
    );

    if (result.error) {
      setToast({ message: result.error, type: 'error' });
    } else {
      setToast({ message: `${VISITOR_TYPE_LABELS[selectedType]} entry recorded for ${houseNumber.toUpperCase()}`, type: 'success' });
      await loadTodayVisitors();
    }

    // Reset
    setStep('select');
    setSelectedType(null);
    setHouseNumber('');
    setVisitorName('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setLoading(false);
  };

  const handleExit = async (visitorId: string) => {
    const result = await recordVisitorExit(visitorId);
    if (result.error) {
      setToast({ message: result.error, type: 'error' });
    } else {
      setToast({ message: 'Exit recorded (निकास दर्ज)', type: 'success' });
      await loadTodayVisitors();
    }
  };

  const activeVisitors = todayVisitors.filter((v) => !v.exit_time);

  return (
    <>
      <Header
        title="Guard Panel (गार्ड पैनल)"
        action={
          <button
            onClick={() => setShowLog(!showLog)}
            className="text-sm font-medium text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {showLog ? 'Entry' : `Log (${todayVisitors.length})`}
          </button>
        }
      />

      <div className="px-4 py-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {!showLog ? (
          <>
            {step === 'select' ? (
              <>
                {/* Active visitors count */}
                {activeVisitors.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 text-center">
                    <span className="text-sm font-medium text-orange-800">
                      {activeVisitors.length} visitor(s) currently inside
                    </span>
                  </div>
                )}

                <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">
                  Select Visitor Type<br />
                  <span className="text-sm font-normal text-gray-500">(आगंतुक का प्रकार चुनें)</span>
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {(['maid', 'delivery', 'service', 'guest'] as VisitorType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeSelect(type)}
                      className="bg-white border border-gray-100 rounded-3xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-[0.97] transition-all duration-300"
                    >
                      <span className="text-4xl block mb-2">{VISITOR_TYPE_ICONS[type]}</span>
                      <span className="text-base font-bold text-gray-800 block">
                        {VISITOR_TYPE_LABELS[type]}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Details step */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => { setStep('select'); setSelectedType(null); }}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    ← Back
                  </button>
                  <Badge variant="info">
                    {selectedType && `${VISITOR_TYPE_ICONS[selectedType]} ${VISITOR_TYPE_LABELS[selectedType]}`}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <Input
                    label="House / Flat Number (मकान नंबर) *"
                    placeholder="e.g. A-101"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    autoFocus
                    required
                  />

                  <Input
                    label="Visitor Name (नाम) — Optional"
                    placeholder="e.g. Ramesh"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                  />

                  {/* Photo Upload Box */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Visitor Photo (फोटो) — Optional
                    </label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {photoPreview ? (
                        <div className="relative">
                          <img src={photoPreview} alt="Preview" className="h-32 mx-auto rounded-xl object-cover" />
                          <span className="text-xs text-blue-600 mt-2 block font-medium">Click to change</span>
                        </div>
                      ) : (
                        <div className="py-4">
                          <span className="text-3xl block mb-2">📸</span>
                          <span className="text-sm font-medium text-gray-600 block">Take Photo or Upload</span>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    fullWidth
                    size="lg"
                    loading={loading}
                    disabled={!houseNumber.trim()}
                    variant="success"
                    className="mt-6"
                  >
                    Record Entry (प्रवेश दर्ज करें)
                  </Button>
                </div>
              </>
            )}
          </>
        ) : (
          /* Today's Visitor Log */
          <>
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Today&apos;s Log ({todayVisitors.length})
            </h2>

            {todayVisitors.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl block mb-2">📋</span>
                <p className="text-gray-500">No visitors today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayVisitors.map((visitor) => (
                  <Card key={visitor.id}>
                    <div className="flex items-center gap-3">
                      {visitor.photo_url ? (
                        <ImageWithModal src={visitor.photo_url} className="w-12 h-12 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="text-2xl shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          {VISITOR_TYPE_ICONS[visitor.visitor_type] || '👤'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm truncate">
                            {visitor.name || 'Visitor'}
                          </span>
                          <span className="text-xs text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                            {visitor.house_number}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          In: {new Date(visitor.entry_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          {visitor.exit_time && (
                            <span className="text-green-600 ml-2">
                              Out: {new Date(visitor.exit_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                      {!visitor.exit_time && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleExit(visitor.id)}
                        >
                          Exit
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

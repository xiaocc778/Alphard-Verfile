import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, UploadCloud, Trash2 } from 'lucide-react';

function prettyJsonErrorMessage(err) {
  if (!err) return 'Invalid JSON.';
  if (typeof err.message === 'string' && err.message.trim()) return err.message;
  return 'Invalid JSON.';
}

export default function ImportPage({ source, onImport, onClear }) {
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [preview, setPreview] = useState({ count: 0, sampleTitles: [] });

  const sourceLabel = useMemo(() => {
    return source === 'imported' ? 'Imported (local)' : 'Default (bundled)';
  }, [source]);

  const handleFile = async (file) => {
    if (!file) return;
    setStatus({ type: 'loading', message: 'Reading file…' });
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : parsed?.cars;
      if (!Array.isArray(list)) {
        throw new Error('Expected an array of cars, or an object with a `cars` array.');
      }
      onImport(list);
      const titles = list
        .map((x) => (typeof x?.title === 'string' ? x.title.trim() : ''))
        .filter(Boolean)
        .slice(0, 5);
      setPreview({ count: list.length, sampleTitles: titles });
      setStatus({ type: 'success', message: `Imported ${list.length} items successfully.` });
    } catch (e) {
      setStatus({ type: 'error', message: prettyJsonErrorMessage(e) });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <span className="text-red-600 font-bold text-xs uppercase tracking-widest">
              Admin Tools
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mt-3">
              Import Inventory Data
            </h1>
            <p className="text-slate-500 mt-4 leading-relaxed">
              This page lets you import inventory data (JSON for now) and store it locally in the
              browser. Later, we can add Excel/Word ingestion and a proper admin backend.
            </p>
            <p className="text-xs text-slate-400 mt-3">
              Current source: <span className="font-bold text-slate-600">{sourceLabel}</span>
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="grid gap-6">
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <UploadCloud className="mx-auto text-slate-400 mb-4" size={36} />
                  <p className="font-bold text-slate-900">Upload JSON</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Accepts either <code className="text-slate-700 font-semibold">[cars]</code> or{' '}
                    <code className="text-slate-700 font-semibold">{'{ cars: [...] }'}</code>
                  </p>
                  <label className="inline-flex mt-5 cursor-pointer">
                    <input
                      type="file"
                      accept="application/json,.json"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                    <span className="bg-slate-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition-colors">
                      Choose file
                    </span>
                  </label>
                </div>

                {status.type !== 'idle' && (
                  <div
                    className={`rounded-2xl p-4 border flex items-start gap-3 ${
                      status.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : status.type === 'error'
                          ? 'bg-red-50 border-red-200 text-red-900'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    {status.type === 'success' ? (
                      <CheckCircle2 className="mt-0.5" size={18} />
                    ) : status.type === 'error' ? (
                      <AlertTriangle className="mt-0.5" size={18} />
                    ) : (
                      <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{status.message}</p>
                      {preview.count > 0 && status.type === 'success' && (
                        <p className="text-sm mt-1 opacity-80">
                          Sample: {preview.sampleTitles.join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={onClear}
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold py-3 px-5 rounded-xl transition-colors"
                  >
                    <Trash2 size={18} className="text-slate-500" />
                    Clear imported data
                  </button>
                  <div className="text-sm text-slate-500 sm:ml-auto sm:text-right self-center">
                    Tip: keep this page hidden and use it only when you update data.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-xs text-slate-400 leading-relaxed">
            Data fields we recommend: <code className="text-slate-700">id</code>,{' '}
            <code className="text-slate-700">title</code>, <code className="text-slate-700">year</code>
            , <code className="text-slate-700">price</code>, <code className="text-slate-700">mileage</code>
            , <code className="text-slate-700">features</code>,{' '}
            <code className="text-slate-700">folderName</code> + <code className="text-slate-700">imageCount</code>
            (or <code className="text-slate-700">coverUrl</code>/<code className="text-slate-700">galleryUrls</code>).
          </div>
        </div>
      </div>
    </div>
  );
}


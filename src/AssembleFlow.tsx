import { useReducer, useState } from 'react';
import { RecoverSubState, recoverReducer } from './fsm';
import * as wasm from './assets/sovcore_wasm_engine.js';

export default function AssembleFlow({ onComplete }: { onComplete: () => void }) {
  const [subState, dispatch] = useReducer(recoverReducer, RecoverSubState.IDLE);
  
  const [k, setK] = useState(3);
  const [shares, setShares] = useState<string[]>([]);
  const [errorIndex, setErrorIndex] = useState<number | null>(null);
  const [reconstructedPayload, setReconstructedPayload] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleSetThreshold = () => {
    dispatch({ type: "SET_RECOVERY_THRESHOLD", payload: { k } });
    setShares(Array(k).fill(""));
  };

  const handleUpdateShare = (index: number, val: string) => {
    const next = [...shares];
    next[index] = val;
    setShares(next);
    if (errorIndex === index) setErrorIndex(null);
  };

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        handleUpdateShare(index, content.trim());
      }
      // Reset input so the same file can be uploaded again if needed
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const handleInterpolate = async () => {
    dispatch({ type: "START_VALIDATION" });
    
    try {
      const validShares = shares.filter(s => s.trim() !== "");
      const result = wasm.assemble_secret(validShares);
      setReconstructedPayload(result);
      
      dispatch({ type: "VALIDATION_SUCCESS" });
      dispatch({ type: "RECONSTRUCTION_SUCCESS" });
    } catch (e) {
      console.error("Reconstruction failed:", e);
      // In a real app we might differentiate between checksum failure and crash
      setShowErrorModal(true);
      dispatch({ type: "VALIDATION_FAILURE" });
    }
  };

  const handleClose = () => {
    wasm.zeroize();
    setReconstructedPayload(null);
    dispatch({ type: "CLOSE_AND_ZEROIZE" });
    onComplete();
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* State: IDLE */}
      {subState === RecoverSubState.IDLE && (
        <div className="max-w-2xl mx-auto space-y-8 pt-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="font-display-lg text-display-lg text-on-surface">Assemble Shards</h1>
              <div className="group relative">
                <span className="material-symbols-outlined text-outline-variant cursor-help text-[20px]">info</span>
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-80 p-3 bg-inverse-surface text-inverse-on-surface text-[12px] rounded-lg shadow-xl z-10">
                  Reconstruction executes reverse Lagrange interpolation across your provided shards entirely on the client side.
                </div>
              </div>
            </div>
            <p className="text-on-surface-variant">How many shards are required to reconstruct the master secret?</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-6">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-4">Threshold Quorum (k)</label>
            <input 
              type="number" 
              min="2" max="255"
              value={k}
              onChange={e => setK(parseInt(e.target.value) || 2)}
              className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:border-2 focus:ring-0 rounded-DEFAULT p-4 font-code-md text-code-md text-on-surface"
            />
          </div>
          <button 
            onClick={handleSetThreshold}
            className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm px-6 py-4 rounded transition-colors"
          >
            Start Collection
          </button>
        </div>
      )}

      {/* State: COLLECTING_SHARES / VALIDATING / PROCESSING */}
      {(subState === RecoverSubState.COLLECTING_SHARES || 
        subState === RecoverSubState.VALIDATING_SIGNATURES || 
        subState === RecoverSubState.PROCESSING || 
        subState === RecoverSubState.CRASH_REJECTION) && (
        <div className="space-y-8">
          <div className="mb-gutter max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">Recovery Matrix</h1>
              <div className="group relative">
                <span className="material-symbols-outlined text-outline-variant cursor-help text-[20px]">info</span>
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-72 p-3 bg-inverse-surface text-inverse-on-surface text-[12px] rounded-lg shadow-xl z-10">
                  Verification Active: The system validates SHA-256 checksums embedded in shard metadata before executing interpolation.
                </div>
              </div>
            </div>
            <p className="text-on-surface-variant text-body-md max-w-2xl leading-relaxed">
              Input the requisite cryptographic shards below to reconstruct the original secret.
            </p>
          </div>

          {errorIndex !== null && (
            <div className="bg-error-container border border-error/20 rounded-DEFAULT p-4 mb-gutter flex items-start gap-3 max-w-4xl">
              <span className="material-symbols-outlined text-error mt-0.5">error</span>
              <div>
                <h3 className="font-code-md text-code-md text-on-error-container font-bold mb-1">Signature Mismatch Detected</h3>
                <p className="font-label-sm text-label-sm text-on-error-container/80">Shard {errorIndex + 1} fails validation against the institutional root block.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              {shares.map((val, i) => (
                <div key={i} className={`bg-surface-container-lowest border-2 ${errorIndex === i ? 'border-error/50' : 'border-outline-variant'} rounded-DEFAULT p-6 relative overflow-hidden`}>
                  {errorIndex === i && <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>}
                  <div className={`flex justify-between items-center mb-4 border-b ${errorIndex === i ? 'border-error/20' : 'border-outline-variant/30'} pb-2`}>
                    <div className="flex items-center gap-4">
                      <label className="font-code-md text-code-md text-on-surface flex items-center gap-2">
                        <span className={`material-symbols-outlined text-sm ${errorIndex === i ? 'text-error' : 'text-outline'}`}>{errorIndex === i ? 'key_off' : 'key'}</span>
                        Shard Input {i + 1}
                      </label>
                      <label className="cursor-pointer text-primary hover:text-primary-container flex items-center gap-1 font-label-sm text-label-sm">
                        <span className="material-symbols-outlined text-[16px]">upload_file</span>
                        <span>Upload .share</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(i, e)}
                        />
                      </label>
                    </div>
                    {errorIndex === i ? (
                      <span className="bg-error-container text-on-error-container px-2 py-1 rounded font-label-sm text-label-sm border border-error/30 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">warning</span> Invalid
                      </span>
                    ) : val ? (
                      <span className="bg-surface-container-high text-on-surface-variant px-2 py-1 rounded font-label-sm text-label-sm border border-outline-variant/50">Ready</span>
                    ) : null}
                  </div>
                  <textarea 
                    value={val}
                    onChange={e => handleUpdateShare(i, e.target.value)}
                    disabled={subState !== RecoverSubState.COLLECTING_SHARES}
                    className={`w-full ${errorIndex === i ? 'bg-error-container/10 border-error focus:border-error' : 'bg-surface-container-low border-outline-variant focus:border-primary'} border focus:border-2 focus:ring-0 rounded-DEFAULT p-4 font-code-md text-code-md text-on-surface resize-y`} 
                    placeholder="Paste Shard in base64 encoded format..." 
                    rows={4}
                  />
                </div>
              ))}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-surface-container border border-outline-variant/50 rounded-DEFAULT p-6">
                <h4 className="font-code-md text-code-md text-on-surface font-bold border-b border-outline-variant/30 pb-3 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">data_object</span>
                  Interpolation Status
                </h4>
                <ul className="space-y-3 mb-6">
                  <li className="flex justify-between items-center font-label-sm text-label-sm">
                    <span className="text-on-surface-variant">Threshold Req.</span>
                    <span className="text-on-surface font-code-md">{k}</span>
                  </li>
                  <li className="flex justify-between items-center font-label-sm text-label-sm">
                    <span className="text-on-surface-variant">Shards Provided</span>
                    <span className="text-on-surface font-code-md">{shares.filter(s => s.trim().length > 0).length}</span>
                  </li>
                </ul>
                <button 
                  onClick={handleInterpolate}
                  disabled={shares.some(s => s.trim().length === 0) || subState !== RecoverSubState.COLLECTING_SHARES}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-on-primary font-code-md text-code-md font-bold py-3 px-4 rounded-DEFAULT transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">{subState === RecoverSubState.PROCESSING ? 'sync' : 'lock_open'}</span>
                  {subState === RecoverSubState.PROCESSING ? 'Interpolating...' : 'Interpolate & Recover'}
                </button>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-6">
                <h4 className="font-code-md text-code-md text-on-surface font-bold mb-2">Audit Trace</h4>
                <div className="font-code-md text-[10px] leading-relaxed text-outline bg-surface-container-low p-3 rounded-DEFAULT border border-outline-variant/30 overflow-hidden break-all min-h-[100px]">
                  &gt; INIT_RECOVERY_SEQ<br/>
                  {subState === RecoverSubState.VALIDATING_SIGNATURES && <>&gt; VALIDATING_SIGNATURES...<br/></>}
                  {subState === RecoverSubState.PROCESSING && <>&gt; SIG_VERIFIED: OK<br/>&gt; EXECUTING_LAGRANGE...<br/></>}
                  {errorIndex !== null && <>&gt; ERR_MISMATCH_SHARD_{errorIndex + 1}<br/>&gt; HALT_INTERPOLATION<br/></>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-6">
            <div className="bg-surface-container-highest border border-error/30 rounded-xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-4 mb-4 text-error">
                <span className="material-symbols-outlined text-4xl">error</span>
                <h2 className="font-headline-lg text-2xl">Reconstruction Failed</h2>
              </div>
              <p className="text-on-surface-variant mb-8 leading-relaxed">
                The shares provided are mathematically mismatched or contain formatting errors (like extra spaces). Please verify your inputs and try again.
              </p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full bg-primary text-on-primary font-bold py-3 px-4 rounded transition-colors hover:bg-primary/90"
              >
                Check Shards
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State: SUCCESS */}
      {subState === RecoverSubState.SUCCESS && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-6 sm:p-10">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl max-w-3xl w-full p-8 relative">
              <div className="flex items-center gap-4 mb-6 text-primary">
                <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                <h1 className="font-display-lg text-3xl">Secret Reconstructed</h1>
              </div>

              <div className="bg-error-container/20 border border-error/30 p-4 rounded-lg mb-6">
                <p className="font-label-sm text-label-sm text-error uppercase tracking-widest font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">warning</span> Security Warning
                </p>
                <p className="text-on-surface-variant text-sm mt-1">This secret is held strictly in temporary volatile RAM. If you refresh this browser, close this window, or click exit, this file will be permanently scrubbed from memory.</p>
              </div>

              <textarea
                readOnly
                className="w-full h-64 bg-surface-container-low border border-outline-variant p-4 font-code-md text-code-md text-on-surface resize-none focus:ring-0 outline-none select-none custom-scrollbar"
                value={reconstructedPayload || "Reconstructing..."}
                onCopy={e => e.preventDefault()}
              />

              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={handleClose}
                  className="bg-error text-on-error px-6 py-3 rounded font-label-sm text-label-sm transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">delete_forever</span>
                  Exit & Scrub Memory
                </button>
              </div>

              <div className="mt-10 pt-6 border-t border-outline-variant/20 print:hidden space-y-4">
                <div className="space-y-1">
                  <h3 className="font-headline-sm text-sm text-on-surface font-bold">Ready to graduate?</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Graduate to premium SovCore Virtual Data Room (VDR) for venture fundraising, corporate legal audits, and M&A transactions. Engineered from the ground up for Corporate Law Partners and M&A Deal Teams requiring absolute boardroom liability mandate compliance.
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="font-headline-sm text-sm text-on-surface font-bold uppercase tracking-tight">eIDAS 2.0</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Native European Digital Identity (EUDI) Wallet framework integration for secure multi-user transaction authorization and pan-European verifiable credentials without centralized master keys.
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="font-headline-sm text-sm text-on-surface font-bold uppercase tracking-tight">NIS 2.0</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Institutional compliance with NIS 2.0 requirements for supply chain security and incident reporting, ensuring your cryptographic infrastructure meets European Union cybersecurity standards.
                  </p>
                </div>

                <a
                  href="https://sovcore.eu/legal/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-primary hover:text-primary-container font-bold text-sm transition-colors"
                >
                  Explore SovCore VDR
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

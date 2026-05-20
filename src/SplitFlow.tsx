import { useReducer, useRef, useState, useEffect } from 'react';
import { SplitSubState, splitReducer } from './fsm';
import * as wasm from './assets/sovcore_wasm_engine.js';

export default function SplitFlow({ onComplete }: { onComplete: () => void }) {
  const [subState, dispatch] = useReducer(splitReducer, SplitSubState.IDLE);
  
  // INV-1: Uncontrolled reference for secret input
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const secretRef = useRef<string>("");
  const [k, setK] = useState(3);
  const [n, setN] = useState(5);
  const [showConstraintWarning, setShowConstraintWarning] = useState(false);
  const [shares, setShares] = useState<string[]>([]);

  // Handle constraints (INV-4: k <= n)
  useEffect(() => {
    if (k > n) {
      setK(n);
      setShowConstraintWarning(true);
    } else {
      setShowConstraintWarning(false);
    }
  }, [k, n]);

  const handleIngest = () => {
    dispatch({ type: "INGEST_PAYLOAD" });
    
    // Memory hardening: Immediately store and zero the DOM node once ingested
    if (inputRef.current) {
      secretRef.current = inputRef.current.value;
      // Blank the DOM
      inputRef.current.value = "";
    }
    dispatch({ type: "CONFIRM_INGESTION" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    dispatch({ type: "INGEST_PAYLOAD" });

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        secretRef.current = content;
      } else if (content instanceof ArrayBuffer) {
        // Handle binary files if needed, for now converting to string or handling as bytes
        const decoder = new TextDecoder();
        secretRef.current = decoder.decode(content);
      }

      // Memory hardening: Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      dispatch({ type: "CONFIRM_INGESTION" });
    };

    // For now we read as text, but could be array buffer for raw bytes
    reader.readAsText(file);
  };

const handleMath = async () => {
  dispatch({ type: "EXECUTE_MATH" });
  
  let ptr = 0;
  let len = 0;
  let encodedSecret: Uint8Array | null = null;

  try {
    // 1. Transform the JavaScript string into raw UTF-8 bytes
    const encoder = new TextEncoder();
    encodedSecret = encoder.encode(secretRef.current);
    len = encodedSecret.length;

    // 2. Request a dedicated memory block on the WASM linear heap
    ptr = wasm.alloc_buffer(len);

    // 3. Extract the underlying WebAssembly Memory buffer and create a writeable view
    const wasmMemory = wasm.get_memory() as WebAssembly.Memory;
    const memoryView = new Uint8Array(wasmMemory.buffer, ptr, len);

    // 4. Stream the raw cleartext bytes directly across the boundary into WASM memory
    memoryView.set(encodedSecret);

    // 5. Execute the cryptographic split using the memory coordinates
    const generatedShares = wasm.split_secret_secure(ptr, len, k, n);
    setShares(Array.from(generatedShares));
    
    dispatch({ type: "MATH_SUCCESS" });
  } catch (e) {
    console.error("Split math failed", e);
    // Handle error states inside your FSM here
  } finally {
    // ── FORENSIC CLEANUP MATRIX ──
    
    // 1. Scrub the transient JavaScript byte array out of volatile browser RAM
    if (encodedSecret) {
      encodedSecret.fill(0);
    }
    
    // 2. Obliterate the temporary reference string
    secretRef.current = "";

    // 3. Reclaim the WASM heap window to prevent linear memory leaks
    if (ptr !== 0 && len !== 0) {
      wasm.dealloc_buffer(ptr, len);
    }
  }
};

  const handlePurge = () => {
    dispatch({ type: "PURGE_SHRED" });
    wasm.zeroize();
    setShares([]);
    onComplete();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const sharesHtml = shares.map((share, i) => `
      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; font-family: monospace;">
        <h3>SHARD #${i + 1}</h3>
        <p style="word-break: break-all;">${share}</p>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>SovCore Split - Paper Backup</title>
          <style>
            body { font-family: sans-serif; padding: 40px; }
            h1 { color: #000; }
          </style>
        </head>
        <body>
          <h1>SovCore Split - Paper Backup</h1>
          <p>Threshold (k): ${k}, Total Shards (n): ${n}</p>
          <hr/>
          ${sharesHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* State: IDLE / PAYLOAD_INGESTION */}
      {(subState === SplitSubState.IDLE || subState === SplitSubState.PAYLOAD_INGESTION) && (
        <>
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-surface-container-low border border-outline-variant/20 px-3 py-1 rounded-full font-code-md text-code-md text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">data_object</span>
              <span>Ingestion Phase</span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface">Secret Ingestion</h1>
            <p className="text-on-surface-variant">Provide the raw cryptographic material to be sharded. Data remains localized within the secure browser execution environment.</p>
          </div>

          <div className="flex p-1 bg-surface-container-low border border-outline-variant/20 rounded-lg inline-flex">
            <button className="px-6 py-2 bg-surface border border-outline-variant/30 shadow-sm rounded font-label-sm text-label-sm text-on-surface flex items-center space-x-2">
              <span className="material-symbols-outlined text-[18px]">text_fields</span>
              <span>Text String</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded font-label-sm text-label-sm flex items-center space-x-2"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>File Stream</span>
            </button>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/20 p-6 shadow-sm flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <label className="font-label-sm text-label-sm text-on-surface">Raw Material</label>
              <button className="text-on-surface-variant hover:text-primary transition-colors flex items-center space-x-1 font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px]">content_paste</span>
                <span>Paste from clipboard</span>
              </button>
            </div>
            {subState === SplitSubState.IDLE ? (
              <textarea 
                ref={inputRef}
                className="w-full h-48 bg-surface-container-low border border-outline-variant/30 p-4 font-code-md text-code-md text-on-surface resize-none focus:ring-0 focus:border-primary focus:border-2 transition-all" 
                placeholder="BEGIN RSA PRIVATE KEY..." 
                spellCheck="false"
              />
            ) : (
              <div className="w-full h-48 bg-surface-container-low border border-outline-variant/30 p-4 font-code-md text-code-md text-primary flex items-center justify-center">
                Data Sealed in Local Memory
              </div>
            )}
            <div className="flex justify-between items-center text-on-surface-variant font-code-md text-code-md text-[12px]">
              <span>Format: UTF-8 / Base64</span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-outline-variant/20">
            <button 
              onClick={handleIngest}
              disabled={subState !== SplitSubState.IDLE}
              className="bg-primary hover:bg-primary-container disabled:opacity-50 text-on-primary font-label-sm text-label-sm px-6 py-3 transition-colors flex items-center space-x-2 border-2 border-transparent"
            >
              <span className="material-symbols-outlined">security</span>
              <span>[Stage Cryptographic Split]</span>
            </button>
          </div>
        </>
      )}

      {/* State: CONFIGURING / PROCESSING */}
      {(subState === SplitSubState.CONFIGURING || subState === SplitSubState.PROCESSING) && (
        <>
          <div>
            <h1 className="font-display-lg text-display-lg text-on-background mb-2">Cryptographic Split Configuration</h1>
            <p className="text-on-surface-variant max-w-2xl">Define the threshold parameters for secret sharing. The system utilizes Shamir's Secret Sharing to distribute the payload across non-overlapping nodes.</p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 flex items-center gap-4">
            <div className="bg-[#e4e9ee] text-primary p-2 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>memory</span>
            </div>
            <div>
              <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">System Status</div>
              <div className="font-code-md text-code-md text-primary font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse"></span>
                {subState === SplitSubState.PROCESSING ? 'Computing Galois Field Matrices...' : 'Payload Loaded In Secured RAM'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* K Slider */}
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Threshold</h3>
                  <div className="font-code-md text-code-md text-on-surface">Minimum Shards to Reconstruct (k)</div>
                </div>
                <div className="bg-surface-container-low px-3 py-1 rounded font-code-md text-code-md text-primary font-bold border border-outline-variant/30">{k}</div>
              </div>
              <div className="mt-8">
                <input type="range" min="2" max="10" value={k} onChange={e => setK(parseInt(e.target.value))} disabled={subState !== SplitSubState.CONFIGURING} />
                <div className="flex justify-between mt-2 font-code-md text-code-md text-on-surface-variant/70 text-[10px]">
                  <span>2</span><span>10</span>
                </div>
              </div>
            </div>

            {/* N Slider */}
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Distribution</h3>
                  <div className="font-code-md text-code-md text-on-surface">Total Shards to Generate (n)</div>
                </div>
                <div className="bg-surface-container-low px-3 py-1 rounded font-code-md text-code-md text-primary font-bold border border-outline-variant/30">{n}</div>
              </div>
              <div className="mt-8">
                <input type="range" min="3" max="15" value={n} onChange={e => setN(parseInt(e.target.value))} disabled={subState !== SplitSubState.CONFIGURING} />
                <div className="flex justify-between mt-2 font-code-md text-code-md text-on-surface-variant/70 text-[10px]">
                  <span>3</span><span>15</span>
                </div>
              </div>
            </div>
          </div>

          {showConstraintWarning && (
            <div className="bg-error-container/30 border border-error/50 rounded-lg p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-error mt-0.5" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
              <div>
                <div className="font-code-md text-code-md text-error font-bold mb-1">Cryptographic Constraint</div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">Threshold (k) cannot exceed Total Shards (n). Values have been automatically adjusted.</div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-6 border-t border-outline-variant/20">
            <button 
              onClick={handleMath}
              disabled={subState !== SplitSubState.CONFIGURING}
              className="bg-primary text-on-primary font-code-md text-code-md px-6 py-3 rounded disabled:opacity-50 hover:bg-primary-container transition-colors active:scale-95 duration-150 flex items-center gap-2 border-2 border-transparent"
            >
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>terminal</span>
              Compute Secure Split
            </button>
          </div>
        </>
      )}

      {/* State: EXPORTING */}
      {subState === SplitSubState.EXPORTING && (
        <>
          <div className="mb-10 border-b border-outline-variant/20 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
              </div>
              <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface">Cryptographic Split Complete</h1>
            </div>
            <p className="text-on-surface-variant max-w-2xl mt-4">
              The master secret has been successfully fragmented into {n} independent shares. A threshold of {k} shares is required for reconstruction.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={handlePrint}
                className="bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/50 px-6 py-3 rounded-DEFAULT font-label-sm text-label-sm transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                Print Paper Backup Vault
              </button>
              <button onClick={handlePurge} className="bg-error hover:bg-error/90 text-on-error px-6 py-3 rounded-DEFAULT font-label-sm text-label-sm transition-colors flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-sm">delete_forever</span>
                Purge Memory & Clear Workspace
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-12">
            {shares.map((share, i) => {
              // Extract the y_hex part for display preview (sov1:x:y_hex:hash)
              let displayHex = "a7b8...c9d0";
              try {
                const parts = share.split(':');
                if (parts.length >= 3) {
                  displayHex = parts[2].substring(0, 16) + "...";
                }
              } catch (e) {}

              return (
                <div key={i} className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-lg relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-code-md text-code-md bg-surface-container px-2 py-1 rounded text-on-surface-variant border border-outline-variant/20">SHARD #{i+1}</span>
                    </div>
                    <span className="material-symbols-outlined text-outline-variant">vpn_key</span>
                  </div>
                  <div className="bg-surface-container-low border border-outline-variant/20 rounded p-4 mb-4 flex items-center justify-between">
                    <div className="font-code-md text-code-md text-on-surface tracking-widest opacity-70 filter blur-[2px] group-hover:blur-none transition-all duration-300">
                      {displayHex}
                    </div>
                    <button 
                      onClick={() => navigator.clipboard.writeText(share)}
                      className="text-primary hover:text-primary-container p-2 rounded hover:bg-primary/10 transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      <span className="font-label-sm text-label-sm">Copy</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

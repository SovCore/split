// Add this temporary gate at the top of your layout file or SplitFlow wrapper
import { useState } from 'react';

export function DemoGateWrapper({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState(false);

  // Simple demo PIN/Password check (e.g., "sovcore2026")
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "sovcore2026") { 
      setIsUnlocked(true);
    } else {
      setError(true);
      setPassword("");
    }
  };

  if (isUnlocked) return <>{children}</>;

  return (
    <div className="fixed inset-0 bg-[#0B0F19] flex items-center justify-center z-50 px-4">
      <form onSubmit={handleVerify} className="w-full max-w-md p-6 bg-surface-container-low border border-outline-variant/20 rounded-xl shadow-2xl">
        <h2 className="font-sans-lg text-title-lg text-on-surface mb-2">SovCore System Access</h2>
        <p className="font-sans-md text-body-md text-on-surface-variant mb-6">Enter environment token to initialize volatile workspace.</p>
        
        <input 
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false); }}
          className="w-full bg-[#040710] border border-outline-variant/30 rounded p-3 font-code-md text-primary focus:outline-none focus:border-primary mb-4"
          placeholder="••••••••"
          autoFocus
        />
        
        {error && <p className="text-error font-sans-sm text-label-md mb-4">Invalid credentials.</p>}
        
        <button type="submit" className="w-full bg-primary text-on-primary font-sans-md py-3 rounded hover:bg-primary-container transition-all">
          Initialize Workspace
        </button>
      </form>
    </div>
  );
}
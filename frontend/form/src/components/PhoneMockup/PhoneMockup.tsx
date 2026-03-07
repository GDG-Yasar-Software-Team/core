/**
 * PhoneMockup - iPhone frame component for mobile preview
 * 
 * Displays content inside a realistic iPhone X frame
 */

import type { ReactNode } from 'react';

interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
}

export function PhoneMockup({ children, className = '' }: PhoneMockupProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Phone Frame */}
      <div className="relative mx-auto" style={{ width: '340px' }}>
        {/* Outer frame - dark border */}
        <div 
          className="relative rounded-[40px] bg-gradient-to-b from-[#2d2d2d] to-[#1a1a1a] p-[8px] shadow-2xl"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255,255,255,0.1) inset'
          }}
        >
          {/* Inner frame - silver edge */}
          <div className="rounded-[32px] bg-gradient-to-b from-[#4a4a4a] to-[#3a3a3a] p-[2px]">
            {/* Screen bezel */}
            <div className="relative rounded-[30px] bg-black overflow-hidden">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                <div 
                  className="bg-black rounded-b-2xl flex items-center justify-center gap-2 px-6 py-1"
                  style={{ width: '120px', height: '22px' }}
                >
                  {/* Speaker */}
                  <div className="w-10 h-1 rounded-full bg-[#1a1a1a]" />
                  {/* Camera */}
                  <div className="w-2 h-2 rounded-full bg-[#1a1a3a] border border-[#2a2a4a]">
                    <div className="w-1 h-1 rounded-full bg-[#3a3a5a] m-auto mt-[1px]" />
                  </div>
                </div>
              </div>
              
              {/* Screen Content */}
              <div 
                className="relative bg-white overflow-y-auto overflow-x-hidden"
                style={{ 
                  width: '322px', 
                  height: '680px',
                  borderRadius: '28px'
                }}
              >
                {/* Status bar */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-2 bg-white/90 backdrop-blur-sm">
                  <span className="text-xs font-semibold text-black">9:41</span>
                  <div className="flex items-center gap-1">
                    {/* Signal */}
                    <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="1" y="14" width="4" height="6" rx="1" />
                      <rect x="7" y="10" width="4" height="10" rx="1" />
                      <rect x="13" y="6" width="4" height="14" rx="1" />
                      <rect x="19" y="2" width="4" height="18" rx="1" />
                    </svg>
                    {/* WiFi */}
                    <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.9-2.3l1.4 1.4C9.5 16.4 10.7 16 12 16s2.5.4 3.5 1.1l1.4-1.4C15.5 14.6 13.8 14 12 14s-3.5.6-4.9 1.7zm-2.8-2.8l1.4 1.4c2-1.7 4.6-2.6 7.3-2.6s5.3.9 7.3 2.6l1.4-1.4c-2.4-2-5.5-3.2-8.7-3.2s-6.3 1.2-8.7 3.2z"/>
                    </svg>
                    {/* Battery */}
                    <svg className="w-5 h-4 text-black" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="2" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      <rect x="4" y="9" width="14" height="6" rx="1" />
                      <rect x="20" y="10" width="2" height="4" rx="0.5" />
                    </svg>
                  </div>
                </div>
                
                {/* Content area */}
                <div className="pt-1">
                  {children}
                </div>
                
                {/* Home indicator */}
                <div className="sticky bottom-0 flex justify-center py-2 bg-white/90 backdrop-blur-sm">
                  <div className="w-32 h-1 rounded-full bg-black/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Side buttons */}
        {/* Volume buttons - left */}
        <div className="absolute left-[-2px] top-[100px] w-[3px] h-[25px] bg-[#2d2d2d] rounded-l-sm" />
        <div className="absolute left-[-2px] top-[135px] w-[3px] h-[45px] bg-[#2d2d2d] rounded-l-sm" />
        <div className="absolute left-[-2px] top-[190px] w-[3px] h-[45px] bg-[#2d2d2d] rounded-l-sm" />
        
        {/* Power button - right */}
        <div className="absolute right-[-2px] top-[140px] w-[3px] h-[60px] bg-[#2d2d2d] rounded-r-sm" />
      </div>
    </div>
  );
}

export default PhoneMockup;

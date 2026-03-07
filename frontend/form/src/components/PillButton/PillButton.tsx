import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import './PillButton.css';

interface PillButtonProps {
  to: string;
  label: string;
  className?: string;
  ease?: string;
}

export function PillButton({
  to,
  label,
  className = '',
  ease = 'power3.easeOut',
}: PillButtonProps) {
  const circleRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const activeTweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const layout = () => {
      const circle = circleRef.current;
      const button = buttonRef.current;
      if (!circle || !button) return;

      const rect = button.getBoundingClientRect();
      const { width: w, height: h } = rect;
      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      const originY = D - delta;

      circle.style.width = `${D}px`;
      circle.style.height = `${D}px`;
      circle.style.bottom = `-${delta}px`;

      gsap.set(circle, {
        xPercent: -50,
        scale: 0,
        transformOrigin: `50% ${originY}px`
      });

      const labelEl = button.querySelector('.pill-label') as HTMLElement;
      const white = button.querySelector('.pill-label-hover') as HTMLElement;

      if (labelEl) gsap.set(labelEl, { y: 0 });
      if (white) gsap.set(white, { y: h + 12, opacity: 0 });

      tlRef.current?.kill();
      const tl = gsap.timeline({ paused: true });

      tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

      if (labelEl) {
        tl.to(labelEl, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
      }

      if (white) {
        gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
        tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
      }

      tlRef.current = tl;
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    return () => window.removeEventListener('resize', onResize);
  }, [ease]);

  const handleEnter = () => {
    const tl = tlRef.current;
    if (!tl) return;
    activeTweenRef.current?.kill();
    activeTweenRef.current = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = () => {
    const tl = tlRef.current;
    if (!tl) return;
    activeTweenRef.current?.kill();
    activeTweenRef.current = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };

  return (
    <div className={`pill-button-wrapper ${className}`}>
      <Link
        ref={buttonRef}
        to={to}
        className="pill-button"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <span
          className="hover-circle"
          aria-hidden="true"
          ref={circleRef}
        />
        <span className="label-stack">
          <span className="pill-label">{label}</span>
          <span className="pill-label-hover" aria-hidden="true">
            {label}
          </span>
        </span>
      </Link>
    </div>
  );
}

export default PillButton;

'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// Cloudflare Turnstile, a privacy-friendly CAPTCHA. Most visitors never see a
// challenge: the widget stays hidden unless Cloudflare needs an interaction.
// When NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set the widget renders nothing and
// forms work without a token, so the site keeps working before keys exist.

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
export const TURNSTILE_ENABLED = TURNSTILE_SITE_KEY.length > 0;

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error('Turnstile failed to load'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

export interface TurnstileHandle {
  reset: () => void;
}

interface Props {
  onToken: (token: string) => void;
  action?: string;
  className?: string;
}

const Turnstile = forwardRef<TurnstileHandle, Props>(function Turnstile({ onToken, action, className }, ref) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useImperativeHandle(ref, () => ({
    reset() {
      onTokenRef.current('');
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    },
  }));

  useEffect(() => {
    if (!TURNSTILE_ENABLED) return;
    const el = container.current;
    if (!el) return;
    let cancelled = false;
    let started = false;

    // The challenge script is about 1 MB, so it only loads once the widget is
    // near the viewport or the visitor starts using the form.
    const start = () => {
      if (started) return;
      started = true;
      cleanupTriggers();
      loadScript()
        .then(() => {
          if (cancelled || !container.current || !window.turnstile) return;
          widgetId.current = window.turnstile.render(container.current, {
            sitekey: TURNSTILE_SITE_KEY,
            action,
            appearance: 'interaction-only',
            size: 'flexible',
            callback: (token: string) => onTokenRef.current(token),
            'expired-callback': () => onTokenRef.current(''),
            'error-callback': () => onTokenRef.current(''),
          });
        })
        .catch(() => onTokenRef.current(''));
    };

    // Visible widgets wait for the page to finish loading so the script never
    // competes with the first paint; focusing the form starts it right away.
    const whenIdle = (fn: () => void) => {
      const run = () => {
        const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
        if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 4000 });
        else setTimeout(fn, 2000);
      };
      if (document.readyState === 'complete') run();
      else window.addEventListener('load', run, { once: true });
    };

    const form = el.closest('form');
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) whenIdle(start);
      },
      { rootMargin: '300px' },
    );
    observer.observe(el);
    form?.addEventListener('focusin', start);
    function cleanupTriggers() {
      observer.disconnect();
      form?.removeEventListener('focusin', start);
    }

    return () => {
      cancelled = true;
      cleanupTriggers();
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [action]);

  if (!TURNSTILE_ENABLED) return null;
  return <div ref={container} className={className} />;
});

export default Turnstile;

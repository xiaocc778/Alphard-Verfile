import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mail, MessageCircle, Phone, X } from 'lucide-react';

export default function FloatingContact({
  t,
  salesPhone,
  salesPhoneDisplay,
  wechatId,
  email,
}) {
  const [open, setOpen] = useState(true);
  const [visible, setVisible] = useState(false);
  const lastYRef = useRef(0);
  const rafRef = useRef(0);
  const hideTimerRef = useRef(null);
  const hintTimerRef = useRef(null);

  const mailto = useMemo(() => {
    if (!email) return null;
    const subject = encodeURIComponent(t?.('[Best Auto] Enquiry', '[Best Auto] 咨询') || '[Best Auto] Enquiry');
    return `mailto:${email}?subject=${subject}`;
  }, [email, t]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return undefined;
    }

    lastYRef.current = window.scrollY || 0;

    const scheduleAutoHide = () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => {
        setVisible(false);
        setOpen(false);
      }, 4500);
    };

    // Hint on first load so users notice the dock exists.
    setVisible(true);
    scheduleAutoHide();
    hintTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      setOpen(false);
    }, 5200);

    const onScroll = () => {
      const y = window.scrollY || 0;
      const dy = y - lastYRef.current;
      lastYRef.current = y;

      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = window.requestAnimationFrame(() => {
        // Make it very easy to trigger: any meaningful scroll down shows the dock.
        if (dy > 1 && y > 10) {
          setVisible(true);
          setOpen(true);
          scheduleAutoHide();
        } else if (dy < -1) {
          setOpen(false);
          setVisible(false);
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.cancelAnimationFrame(rafRef.current);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
    };
  }, []);

  const handleCopyWechat = async () => {
    if (!wechatId) return;
    try {
      await navigator.clipboard.writeText(wechatId);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={`fixed right-4 bottom-4 z-50 transition-all duration-500 ease-out ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'
      }`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Panel */}
      <div
        className={`mb-3 w-[280px] rounded-2xl border border-black/10 bg-white/95 backdrop-blur-md shadow-xl transition-all duration-400 ease-out ${
          open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="text-sm font-black text-text-heading">{t?.('Contact', '联系') || 'Contact'}</div>
          <button
            type="button"
            className="h-9 w-9 rounded-full bg-surface border border-black/10 flex items-center justify-center hover:bg-black/5 transition-colors"
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pb-4 pt-3 space-y-2">
          <div className="w-full flex items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3">
            <span className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <Phone size={18} />
            </span>
            <div className="min-w-0">
              <div className="text-xs font-bold tracking-widest uppercase text-text-muted">
                {t?.('Call', '电话') || 'Call'}
              </div>
              <div className="text-sm font-black text-text-heading truncate">{salesPhoneDisplay || salesPhone}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyWechat}
            className="w-full flex items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 hover:bg-surface transition-colors text-left"
            title={t?.('Copy WeChat ID', '复制微信号') || 'Copy WeChat ID'}
          >
            <span className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <MessageCircle size={18} />
            </span>
            <div className="min-w-0">
              <div className="text-xs font-bold tracking-widest uppercase text-text-muted">
                {t?.('WeChat', '微信') || 'WeChat'}
              </div>
              <div className="text-sm font-black text-text-heading truncate">{wechatId || '-'}</div>
            </div>
          </button>

          {mailto && (
            <a
              href={mailto}
              className="w-full flex items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 hover:bg-surface transition-colors"
            >
              <span className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                <Mail size={18} />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-bold tracking-widest uppercase text-text-muted">
                  {t?.('Email', '邮箱') || 'Email'}
                </div>
                <div className="text-sm font-black text-text-heading truncate">{email}</div>
              </div>
            </a>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        type="button"
        onClick={() => {
          setVisible(true);
          setOpen((v) => !v);
        }}
        className="h-14 w-14 rounded-full bg-brand text-white shadow-lg shadow-brand/30 hover:bg-brand/90 transition-colors flex items-center justify-center"
        aria-label={t?.('Contact', '联系') || 'Contact'}
      >
        <Phone size={20} />
      </button>
    </div>
  );
}


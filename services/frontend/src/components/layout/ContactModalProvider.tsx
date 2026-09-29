"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ContactModalValue = {
  open: boolean;
  /** Pass the element that opened it; WebKit does not focus a button on tap. */
  openModal: (opener?: HTMLElement | null) => void;
  setOpen: (open: boolean) => void;
  /** Puts focus back on whatever opened the dialog. */
  restoreFocus: () => void;
};

const ContactModalContext = createContext<ContactModalValue | null>(null);

/**
 * One contact dialog exists for the whole site; the floating dock (and anything
 * else) opens it through this context rather than rendering its own.
 *
 * Because it is opened programmatically there is no Radix `Dialog.Trigger` to
 * hand focus back to, so the opener is remembered and the dialog restores it
 * from `onCloseAutoFocus` — otherwise a keyboard user would be dropped at the
 * top of the document.
 */
export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);

  const openModal = useCallback((from?: HTMLElement | null) => {
    // `document.activeElement` is unreliable here: WebKit leaves focus on the
    // body when a button is tapped, so the caller passes itself.
    opener.current = from ?? (document.activeElement as HTMLElement | null);
    setOpen(true);
  }, []);

  const restoreFocus = useCallback(() => {
    if (opener.current?.isConnected) opener.current.focus();
  }, []);

  const value = useMemo(
    () => ({ open, openModal, setOpen, restoreFocus }),
    [open, openModal, restoreFocus],
  );
  return <ContactModalContext.Provider value={value}>{children}</ContactModalContext.Provider>;
}

export function useContactModal(): ContactModalValue {
  const context = useContext(ContactModalContext);
  if (!context) throw new Error("useContactModal must be used inside ContactModalProvider");
  return context;
}

"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { ContactForm } from "@/components/forms/ContactForm";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import type { SiteSettings } from "@/lib/data";
import { useContactModal } from "./ContactModalProvider";

/**
 * The site-wide contact dialog (design-system §8). Radix supplies the focus
 * trap, Escape and focus return to whatever opened it.
 */
export function ContactModal({ settings }: { settings: SiteSettings["contactModal"] }) {
  const { open, setOpen, restoreFocus } = useContactModal();
  const dict = useDictionary();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-chrome-overlay/70 data-[state=open]:animate-in data-[state=open]:fade-in fixed inset-0 z-60 backdrop-blur-[2px]" />
        <Dialog.Content
          // Opened programmatically, so Radix has no trigger to hand focus back
          // to; put it back on whatever opened the dialog.
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            restoreFocus();
          }}
          data-chrome="modal"
          className="bg-chrome-modal data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-98 fixed top-1/2 left-1/2 z-60 max-h-[90vh] w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-(--chrome-modal-radius) p-8 shadow-(--chrome-modal-shadow)"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <Dialog.Title className="font-display text-h3 text-chrome-modal-text">
              {settings.title}
            </Dialog.Title>
            <Dialog.Close
              aria-label={dict.chrome.closeContactForm}
              className="text-chrome-modal-muted hover:bg-chrome-modal-close-hover hover:text-chrome-modal-close-hover-fg rounded-pill -mt-1 grid size-10 shrink-0 place-items-center transition-colors"
            >
              <X aria-hidden className="size-5" strokeWidth={1.5} />
            </Dialog.Close>
          </div>

          <ContactForm
            fields={settings.fields}
            submitLabel={settings.submitLabel}
            submittingLabel={settings.submittingLabel}
            successMessage={settings.successMessage}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

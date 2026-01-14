'use client';

import { usePopup } from "@/context/PopupProvider";
import { Popup } from "@/components/Popup";

export default function PopupWrapper() {
  const { popupVisible, popupMessage, popupOnConfirm, popupOnCancel, hidePopup, popupShowConfirm } = usePopup();

  return (
    <Popup
      isOpen={popupVisible}
      onConfirm={() => {
        if (popupOnConfirm) popupOnConfirm();
        hidePopup();
      }}
      onCancel={() => {
        if (popupOnCancel) popupOnCancel();
        hidePopup();
      }}
      content={popupMessage}
      showConfirm={popupShowConfirm}
    />
  );
}


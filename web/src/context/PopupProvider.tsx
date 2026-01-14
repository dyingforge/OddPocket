'use client';

import React, { createContext, useState, useContext, ReactNode } from "react";

interface PopupContextProps {
  showPopup: (
    onConfirm: () => void,
    onCancel: () => void,
    message: string,
    showConfirm?: boolean
  ) => void;
  hidePopup: () => void;
  popupVisible: boolean;
  popupMessage: string;
  popupOnConfirm: (() => void) | null;
  popupOnCancel: (() => void) | null;
  popupShowConfirm: boolean;
}

const PopupContext = createContext<PopupContextProps | undefined>(undefined);

export const PopupProvider = ({ children }: { children: ReactNode }) => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupOnConfirm, setPopupOnConfirm] = useState<(() => void) | null>(
    null
  );
  const [popupOnCancel, setPopupOnCancel] = useState<(() => void) | null>(null);
  const [popupShowConfirm, setPopupShowConfirm] = useState(true);

  const showPopup = (
    onConfirm: () => void,
    onCancel: () => void,
    message: string,
    showConfirm: boolean = true
  ) => {
    setPopupMessage(message);
    setPopupOnConfirm(() => onConfirm);
    setPopupOnCancel(() => onCancel);
    setPopupShowConfirm(showConfirm);
    setPopupVisible(true);
  };

  const hidePopup = () => {
    setPopupVisible(false);
    setPopupMessage("");
    setPopupOnConfirm(null);
    setPopupOnCancel(null);
  };

  return (
    <PopupContext.Provider
      value={{
        showPopup,
        hidePopup,
        popupVisible,
        popupMessage,
        popupOnConfirm,
        popupOnCancel,
        popupShowConfirm,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error("usePopup must be used within a PopupProvider");
  }
  return context;
};


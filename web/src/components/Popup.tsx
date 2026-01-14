"use client"

import { useEffect } from "react"
import { createPortal } from "react-dom"

interface PopupProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  content: string
  showConfirm?: boolean
}

export function Popup({ isOpen, onConfirm, onCancel, content, showConfirm = true }: PopupProps) {

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div
        className="relative flex flex-col items-center justify-center p-6 pt-8 bg-gradient-to-r from-red-600 to-purple-700 rounded-lg shadow-lg text-white"
        style={{
          width: "480px",
          minHeight: "300px",
          backgroundSize: "cover",
        }}
      >
        <p className="text-center text-2xl font-semibold font-DynaPuff mb-6">
          {content}
        </p>
        <div className="flex gap-4">
          {showConfirm && (
            <button
              onClick={() => {
                console.log("Confirmed!");
                onConfirm();
              }}
              className="px-6 py-2 bg-red-400 text-black font-DynaPuff rounded-lg hover:bg-red-500 transition-colors"
            >
              <p className="pb-2 text-lg">Yes</p>
            </button>
          )}

          <button
            onClick={() => {
              console.log("Cancelled!");
              onCancel();
            }}
            className="px-6 py-2 bg-gray-600 text-white font-DynaPuff rounded-lg hover:bg-gray-700 transition-colors"
          >
            <p className="pb-2 text-lg">{showConfirm ? "No" : "OK"}</p>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}


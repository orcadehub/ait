"use client";

import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
}

export function OTPInput({ length = 6, onComplete }: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newValues = [...values];
    newValues[index] = value.slice(-1);
    setValues(newValues);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    const otp = newValues.join("");
    if (otp.length === length && onComplete) {
      onComplete(otp);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pasted) {
      const newValues = Array(length).fill("");
      pasted.split("").forEach((char, i) => {
        newValues[i] = char;
      });
      setValues(newValues);
      const focusIndex = Math.min(pasted.length, length - 1);
      inputRefs.current[focusIndex]?.focus();

      if (pasted.length === length && onComplete) {
        onComplete(pasted);
      }
    }
  };

  // Hidden input for form submission
  const otpValue = values.join("");

  return (
    <div>
      <div className="flex justify-center gap-2 sm:gap-3">
        {values.map((val, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className="w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-white"
            autoComplete="off"
          />
        ))}
      </div>
      <input type="hidden" name="otp" value={otpValue} />
    </div>
  );
}

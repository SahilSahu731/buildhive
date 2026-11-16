"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";

export const OTP_LENGTH = 6;
export const emptyOtp = () => Array<string>(OTP_LENGTH).fill("");

export function OtpInput({
  value,
  onChange,
  disabled = false,
  invalid = false,
}: {
  value: string[];
  onChange: (digits: string[]) => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!disabled) inputs.current[0]?.focus();
  }, [disabled]);

  function focus(index: number) {
    inputs.current[Math.max(0, Math.min(index, OTP_LENGTH - 1))]?.focus();
  }

  function update(index: number, text: string) {
    const digits = text.replace(/\D/g, "");
    if (text && !digits) return;
    const next = [...value];
    if (!digits) {
      next[index] = "";
      onChange(next);
      return;
    }
    // Full-code paste and native email autofill work from any box.
    const start = digits.length >= OTP_LENGTH ? 0 : index;
    const incoming = digits.slice(0, OTP_LENGTH - start).split("");
    incoming.forEach((digit, offset) => {
      next[start + offset] = digit;
    });
    onChange(next);
    focus(Math.min(start + incoming.length, OTP_LENGTH - 1));
  }

  function keyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (disabled || event.nativeEvent.isComposing) return;
    switch (event.key) {
      case "Enter":
        event.preventDefault();
        event.currentTarget.form?.requestSubmit();
        break;
      case "Backspace": {
        event.preventDefault();
        const target = value[index] || index === 0 ? index : index - 1;
        const next = [...value];
        next[target] = "";
        onChange(next);
        focus(target);
        break;
      }
      case "Delete": {
        event.preventDefault();
        const next = [...value];
        next[index] = "";
        onChange(next);
        break;
      }
      case "ArrowLeft":
        event.preventDefault();
        focus(index - 1);
        break;
      case "ArrowRight":
        event.preventDefault();
        focus(index + 1);
        break;
      case "Home":
        event.preventDefault();
        focus(0);
        break;
      case "End":
        event.preventDefault();
        focus(OTP_LENGTH - 1);
        break;
    }
  }

  const description = `auth-otp-help${invalid ? " auth-error" : ""}`;
  return (
    <fieldset
      className="m-0 min-w-0 border-0 p-0"
      disabled={disabled}
      aria-describedby={description}
    >
      <legend className="mb-3 p-0 text-sm font-medium">
        Verification code
      </legend>
      <div className="grid grid-cols-6 gap-[clamp(6px,2vw,12px)]">
        {Array.from({ length: OTP_LENGTH }, (_, index) => (
          <input
            key={index}
            ref={(node) => {
              inputs.current[index] = node;
            }}
            data-filled={Boolean(value[index])}
            className="h-16 w-full min-w-0 rounded-[10px] bg-surface p-0 text-center font-sans text-[28px] font-medium text-ink caret-brand transition-[background,border-color] duration-180 data-[filled=true]:border-faint data-[filled=true]:bg-surface-raised aria-invalid:border-danger-text focus:border-brand focus:bg-surface-raised focus:outline-2 focus:outline-offset-[3px] focus:outline-brand disabled:cursor-wait disabled:opacity-55 max-[600px]:h-14 max-[600px]:rounded-lg max-[600px]:text-2xl"
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            enterKeyHint="done"
            // Do not truncate full-code autofill before the change handler sees it.
            maxLength={OTP_LENGTH}
            pattern="[0-9]"
            required
            name={`otp-digit-${index + 1}`}
            aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
            aria-invalid={invalid || undefined}
            aria-describedby={description}
            disabled={disabled}
            value={value[index] || ""}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) => update(index, event.target.value)}
            onKeyDown={(event) => keyDown(event, index)}
            onPaste={(event) => {
              event.preventDefault();
              update(index, event.clipboardData.getData("text"));
            }}
          />
        ))}
      </div>
      <p
        id="auth-otp-help"
        className="mt-4 text-[13px] leading-[1.7] text-muted"
      >
        Enter your code, then press{" "}
        <kbd className="rounded-sm border border-border-strong px-[5px] py-0.5 font-sans text-[11px] text-text">
          Enter
        </kbd>{" "}
        to verify.
      </p>
    </fieldset>
  );
}

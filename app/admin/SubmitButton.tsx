"use client";
import { useFormStatus } from "react-dom";
export default function SubmitButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return <button className="btn-sage btn-sm" disabled={disabled || pending}>{pending ? "저장 중…" : children}</button>;
}

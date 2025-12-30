export function LoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
        <div className="absolute inset-0 rounded-full border-4 border-stride-blue border-t-transparent animate-spin"></div>
      </div>
      {text && <p className="text-zinc-400 text-sm">{text}</p>}
    </div>
  );
}
const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText,
  confirmColor,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const colorStyles = {
    red: "bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 text-red-400",
    cyan: "bg-cyan-400 hover:bg-cyan-300 text-[#0a0f1e]",
    yellow:
      "bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/20 text-yellow-400",
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1424] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl">
        {/* Icon */}
        <div className="p-6 text-center">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
              confirmColor === "red"
                ? "bg-red-400/10 border border-red-400/20"
                : confirmColor === "yellow"
                  ? "bg-yellow-400/10 border border-yellow-400/20"
                  : "bg-cyan-400/10 border border-cyan-400/20"
            }`}
          >
            {confirmColor === "red" ? (
              <svg
                className="w-7 h-7 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            ) : confirmColor === "yellow" ? (
              <svg
                className="w-7 h-7 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            ) : (
              <svg
                className="w-7 h-7 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>

          <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${colorStyles[confirmColor] || colorStyles.red}`}
          >
            {confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

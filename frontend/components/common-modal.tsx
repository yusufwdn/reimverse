import React from "react";

interface ModalProps {
  show: boolean;
  title: string;
  children: React.ReactNode
  onClose: () => void;
}

const CommonModal = ({ show, onClose, title = 'Common Modal', children }: ModalProps) => {
  if (!show) {
    return null;
  }

  return (
    // Backdrop overlay
    <div
      id="default-modal"
      tabIndex={-1}
      aria-hidden="true"
      // Kelas CSS untuk memposisikan modal di tengah dan sebagai overlay
      className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-full max-h-full bg-black bg-opacity-50"
    >
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        {/* Konten Modal */}
        <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
          {/* Header Modal */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={onClose} // Panggil fungsi onClose saat diklik
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CommonModal;

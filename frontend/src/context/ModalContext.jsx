import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);

  // ALERT (only OK)
  const showAlert = (message) => {
    return new Promise((resolve) => {
      setModal({
        type: "alert",
        message,
        onConfirm: () => {
          resolve(true);
          setModal(null);
        },
      });
    });
  };

  // CONFIRM (OK + Cancel)
  const showConfirm = (message) => {
    return new Promise((resolve) => {
      setModal({
        type: "confirm",
        message,
        onConfirm: () => {
          resolve(true);
          setModal(null);
        },
        onCancel: () => {
          resolve(false);
          setModal(null);
        },
      });
    });
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl animate-fade-in">
            
            <h2 className="text-lg font-semibold text-[#3A332C] mb-6 text-center">
              {modal.message}
            </h2>

            <div className="flex justify-center gap-3">
              
              {modal.type === "confirm" && (
                <button
                  onClick={modal.onCancel}
                  className="px-5 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
              )}

              <button
                onClick={modal.onConfirm}
                className="px-5 py-2 rounded-lg bg-[#6B3151] text-white hover:opacity-90"
              >
                OK
              </button>

            </div>

          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}
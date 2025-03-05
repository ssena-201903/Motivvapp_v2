import React, { createContext, useContext, ReactNode } from "react";
import Toast from "react-native-toast-message";

interface ToastContextType {
  showToast: (type: "success" | "error" | "info", title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const showToast = (type: "success" | "error" | "info", title: string, message?: string) => {
    Toast.show({
      type,
      text1: title,
      text2: message,
    });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast />
    </ToastContext.Provider>
  );
};

// Hook ile kolay erişim sağlayalım:
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

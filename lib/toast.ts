import { toast } from "sonner";

type ToastOptions = {
  description?: string;
};

export const notifySuccess = (message: string, options?: ToastOptions) => {
  toast.success(message, {
    description: options?.description,
  });
};

export const notifyError = (message: string, options?: ToastOptions) => {
  toast.error(message, {
    description: options?.description,
  });
};

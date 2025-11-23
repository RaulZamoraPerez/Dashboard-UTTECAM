import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const confirmDialog = async (options: { title?: string; text?: string; confirmText?: string; cancelText?: string } = {}) => {
  const { title = '¿Estás seguro?', text = '', confirmText = 'Si', cancelText = 'Cancelar' } = options;
  const result = await MySwal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    customClass: {
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
      cancelButton: 'bg-gray-200 hover:bg-gray-300'
    }
  });
  return result.isConfirmed;
};

export const toastSuccess = (text: string, title?: string) => {
  MySwal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: title || 'Éxito',
    text,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
};

export const toastError = (text: string, title?: string) => {
  MySwal.fire({
    toast: true,
    position: 'top-end',
    icon: 'error',
    title: title || 'Error',
    text,
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
  });
};

export const showAlert = (title: string, text?: string, icon: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  return MySwal.fire({ title, text, icon });
};

export default MySwal;

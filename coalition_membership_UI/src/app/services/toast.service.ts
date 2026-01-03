import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";

export function successToast(message: string) {
  Swal.fire({
    title: 'Success!',
    text: message,
    icon: "success",
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });
}

export function errorToast(message: string, errorDetail?: string) {
  const html = errorDetail ? `
    <div style="text-align: left; margin-top: 10px;">
      <div style="font-weight: 600; margin-bottom: 8px;">${message}</div>
      <details style="margin-top: 10px;">
        <summary style="cursor: pointer; color: #f8f9fa; font-size: 12px; padding: 4px 8px; background: rgba(255,255,255,0.1); border-radius: 4px;">
          Show Error Details
        </summary>
        <div style="margin-top: 8px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; font-size: 11px; max-height: 100px; overflow-y: auto;">
          ${errorDetail}
        </div>
      </details>
    </div>
  ` : message;

  Swal.fire({
    title: 'Error!',
    html: html,
    icon: "error",
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 6000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });
}

export function warningToast(message: string) {
  Swal.fire({
    title: 'Warning!',
    text: message,
    icon: "warning",
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });
}

export function infoToast(message: string) {
  Swal.fire({
    title: 'Info!',
    text: message,
    icon: "info",
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });
}

export function confirmDialog(title: string, message: string): Promise<boolean> {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#dc3545',
    confirmButtonText: 'Yes',
    cancelButtonText: 'No'
  }).then((result) => {
    return result.isConfirmed;
  });
}

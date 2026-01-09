import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog = ({
  isOpen,
  title = '¿Confirmar acción?',
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'warning'
}: ConfirmDialogProps) => {
  
  const getIconByType = () => {
    switch (type) {
      case 'danger':
        return 'pi pi-exclamation-triangle';
      case 'warning':
        return 'pi pi-exclamation-circle';
      case 'info':
        return 'pi pi-info-circle';
      default:
        return 'pi pi-question-circle';
    }
  };

  const getSeverityClass = () => {
    switch (type) {
      case 'danger':
        return 'confirm-dialog-danger';
      case 'warning':
        return 'confirm-dialog-warning';
      case 'info':
        return 'confirm-dialog-info';
      default:
        return 'confirm-dialog-warning';
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onCancel();
  };

  return (
    <Dialog
      visible={isOpen}
      onHide={onCancel}
      className={`modern-confirm-dialog ${getSeverityClass()}`}
      style={{ width: '480px' }}
      modal
      draggable={false}
      resizable={false}
      showHeader={false}
      pt={{
        root: { className: 'modern-dialog-root' },
        mask: { className: 'modern-dialog-mask' }
      }}
    >
      <div className="modern-dialog-content">
        {/* Icon Circle */}
        <div className={`modern-icon-wrapper ${getSeverityClass()}`}>
          <i className={`${getIconByType()} modern-icon`} />
        </div>

        {/* Title */}
        <h3 className="modern-dialog-title">{title}</h3>
        
        {/* Message */}
        <p className="modern-dialog-message">{message}</p>
        
        {/* Actions */}
        <div className="modern-dialog-actions">
          <Button 
            label={cancelText}
            onClick={onCancel}
            className="modern-btn modern-btn-cancel"
            size="large"
          />
          <Button 
            label={confirmText}
            onClick={handleConfirm}
            className={`modern-btn modern-btn-confirm ${getSeverityClass()}`}
            size="large"
            autoFocus
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmDialog;

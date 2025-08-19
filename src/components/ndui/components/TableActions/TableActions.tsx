import React from 'react';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import Tooltip from '../Tooltip/Tooltip';

export type ActionType = 'view' | 'edit' | 'delete' | string;

interface CustomAction {
  /**
   * Unique identifier for the custom action
   */
  id: string;
  /**
   * Display label for the custom action
   */
  label: string;
  /**
   * Icon to display for the custom action
   */
  icon: React.ReactNode;
  /**
   * Handler function for the custom action
   */
  onClick: (row: any) => void;
  /**
   * CSS class for styling the custom action
   */
  className?: string;
  /**
   * Whether to show confirmation dialog for this action
   */
  confirmAction?: boolean;
  /**
   * Confirmation dialog title
   */
  confirmTitle?: string;
  /**
   * Confirmation dialog message
   */
  confirmMessage?: string;
  /**
   * Confirm button label
   */
  confirmLabel?: string;
  /**
   * Cancel button label
   */
  cancelLabel?: string;
}

interface TableActionsProps {
  /**
   * Array of action types to display
   */
  actions: ActionType[];
  /**
   * Row data to pass to action handlers
   */
  row: any;
  /**
   * Callback for view action
   */
  onView?: (row: any) => void;
  /**
   * Callback for edit action
   */
  onEdit?: (row: any) => void;
  /**
   * Callback for delete action
   */
  onDelete?: (row: any) => void;
  /**
   * Whether to show text labels alongside icons
   */
  showLabels?: boolean;
  /**
   * Size of action buttons
   */
  size?: 'xs' | 'sm' | 'md';
  /**
   * Custom class name
   */
  className?: string;
  /**
   * Custom labels for actions
   */
  labels?: {
    view?: string;
    edit?: string;
    delete?: string;
    deleteConfirm?: string;
    deleteCancel?: string;
    deleteTitle?: string;
    deleteMessage?: string;
  };
  /**
   * Custom icons for actions
   */
  icons?: {
    view?: React.ReactNode;
    edit?: React.ReactNode;
    delete?: React.ReactNode;
  };
  /**
   * Whether to show confirmation dialog for delete action
   */
  confirmDelete?: boolean;
  /**
   * Direction of action buttons
   */
  direction?: 'row' | 'column';
  /**
   * Custom actions to display
   */
  customActions?: CustomAction[];
}

const TableActions: React.FC<TableActionsProps> = ({
  actions,
  row,
  onView,
  onEdit,
  onDelete,
  showLabels = false,
  size = 'sm',
  className = '',
  labels = {
    view: 'View',
    edit: 'Edit',
    delete: 'Delete',
    deleteConfirm: 'Delete',
    deleteCancel: 'Cancel',
    deleteTitle: 'Confirm Delete',
    deleteMessage: 'Are you sure you want to delete this item?'
  },
  icons = {
    view: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    ),
    edit: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
    ),
    delete: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    )
  },
  confirmDelete = true,
  direction = 'row',
  customActions = []
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [confirmationState, setConfirmationState] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel: string;
    cancelLabel: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel'
  });

  const handleDelete = () => {
    if (confirmDelete) {
      setIsDeleteModalOpen(true);
    } else if (onDelete) {
      onDelete(row);
    }
  };

  const confirmDeleteAction = () => {
    if (onDelete) {
      onDelete(row);
    }
    setIsDeleteModalOpen(false);
  };

  const handleCustomAction = (action: CustomAction) => {
    if (action.confirmAction) {
      setConfirmationState({
        isOpen: true,
        title: action.confirmTitle || `Confirm ${action.label}`,
        message: action.confirmMessage || `Are you sure you want to ${action.label.toLowerCase()} this item?`,
        onConfirm: () => {
          action.onClick(row);
          setConfirmationState(prev => ({ ...prev, isOpen: false }));
        },
        confirmLabel: action.confirmLabel || 'Confirm',
        cancelLabel: action.cancelLabel || 'Cancel'
      });
    } else {
      action.onClick(row);
    }
  };

  // Find custom actions that are included in the actions array
  const activeCustomActions = customActions.filter(ca => actions.includes(ca.id));

  return (
    <>
      <div 
        className={`
          flex 
          ${direction === 'row' ? 'flex-row gap-2' : 'flex-col gap-1'} 
          ${className}
        `}
      >
        {actions.includes('view') && onView && (
          <Tooltip content={showLabels ? '' : labels.view || 'View'}>
            <Button
              size={size}
              variant="ghost"
              onClick={() => onView(row)}
              className="text-info"
              aria-label={labels.view || 'View'}
            >
              {icons.view}
              {showLabels && <span className="ml-1">{labels.view}</span>}
            </Button>
          </Tooltip>
        )}

        {actions.includes('edit') && onEdit && (
          <Tooltip content={showLabels ? '' : labels.edit || 'Edit'}>
            <Button
              size={size}
              variant="ghost"
              onClick={() => onEdit(row)}
              className="text-warning"
              aria-label={labels.edit || 'Edit'}
            >
              {icons.edit}
              {showLabels && <span className="ml-1">{labels.edit}</span>}
            </Button>
          </Tooltip>
        )}

        {actions.includes('delete') && onDelete && (
          <Tooltip content={showLabels ? '' : labels.delete || 'Delete'}>
            <Button
              size={size}
              variant="ghost"
              onClick={handleDelete}
              className="text-error"
              aria-label={labels.delete || 'Delete'}
            >
              {icons.delete}
              {showLabels && <span className="ml-1">{labels.delete}</span>}
            </Button>
          </Tooltip>
        )}

        {/* Render custom actions */}
        {activeCustomActions.map(action => (
          <Tooltip key={action.id} content={showLabels ? '' : action.label}>
            <Button
              size={size}
              variant="ghost"
              onClick={() => handleCustomAction(action)}
              className={action.className || ''}
              aria-label={action.label}
            >
              {action.icon}
              {showLabels && <span className="ml-1">{action.label}</span>}
            </Button>
          </Tooltip>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={labels.deleteTitle}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              {labels.deleteCancel}
            </Button>
            <Button
              variant="primary"
              className="bg-error text-error-content"
              onClick={confirmDeleteAction}
            >
              {labels.deleteConfirm}
            </Button>
          </>
        }
      >
        <p>{labels.deleteMessage}</p>
      </Modal>

      {/* Custom Action Confirmation Modal */}
      <Modal
        isOpen={confirmationState.isOpen}
        onClose={() => setConfirmationState(prev => ({ ...prev, isOpen: false }))}
        title={confirmationState.title}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setConfirmationState(prev => ({ ...prev, isOpen: false }))}
            >
              {confirmationState.cancelLabel}
            </Button>
            <Button
              variant="primary"
              onClick={confirmationState.onConfirm}
            >
              {confirmationState.confirmLabel}
            </Button>
          </>
        }
      >
        <p>{confirmationState.message}</p>
      </Modal>
    </>
  );
};

export default TableActions;
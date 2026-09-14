import { useCallback, useState } from 'react';
import { Keyboard } from 'react-native';

import type { ModalType } from '@/types/models';

type ModalState = {
  visible: boolean;
  type: ModalType;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  showCancel: boolean;
  onConfirm?: () => void;
};

const INITIAL_MODAL: ModalState = {
  visible: false,
  type: 'info',
  title: '',
  message: '',
  confirmText: 'U redu',
  cancelText: 'Odustani',
  showCancel: false,
};

export function useAppModal() {
  const [modal, setModal] = useState<ModalState>(INITIAL_MODAL);

  const closeModal = useCallback(() => {
    setModal((current) => ({
      ...current,
      visible: false,
      onConfirm: undefined,
    }));
  }, []);

  const showModal = useCallback(
    (
      type: ModalType,
      title: string,
      message: string,
      onConfirm?: () => void,
      options?: {
        confirmText?: string;
        cancelText?: string;
        showCancel?: boolean;
      }
    ) => {
      Keyboard.dismiss();

      setModal({
        visible: true,
        type,
        title,
        message,
        confirmText: options?.confirmText ?? 'U redu',
        cancelText: options?.cancelText ?? 'Odustani',
        showCancel: options?.showCancel ?? false,
        onConfirm,
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    const action = modal.onConfirm;
    closeModal();

    if (action) {
      setTimeout(action, 150);
    }
  }, [closeModal, modal.onConfirm]);

  return {
    showModal,
    closeModal,
    modalProps: {
      visible: modal.visible,
      type: modal.type,
      title: modal.title,
      message: modal.message,
      confirmText: modal.confirmText,
      cancelText: modal.cancelText,
      onConfirm: handleConfirm,
      onCancel: modal.showCancel ? closeModal : undefined,
    },
  };
}

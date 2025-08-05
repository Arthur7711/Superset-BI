import { useState } from 'react';
import { css, styled } from '@superset-ui/core';
import Modal from '../../components/Modal';

interface ModalProps {
  children: React.ReactNode;
}

const StyledModal = styled(Modal)`
  .ant-modal-body {
    min-height: 720px;
  }

  .ant-collapse > .ant-collapse-item {
    border-bottom: none;
  }

  .ant-modal-header {
    background: none;
    border-bottom: none;
  }
  .inline-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    &.wrap {
      flex-wrap: wrap;
    }

    > div {
      flex: 1 1 auto;
    }
  }
`;

export function ServiceModal({ children }: ModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const onClose = () => setIsOpen(false);
  return (
    <StyledModal show={isOpen} onHide={onClose} title="">
      {children}
    </StyledModal>
  );
}

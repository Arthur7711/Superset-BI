import { styled } from '@superset-ui/core';
import Modal from '../../components/Modal';

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const StyledModal = styled(Modal)`
  .ant-modal-body {
    min-height: 500px;
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

export function ServiceModal({ children, isOpen, onClose }: ModalProps) {
  return (
    <StyledModal
      show={isOpen}
      onHide={onClose}
      title=""
      hideFooter
      maskClosable={false}
    >
      {children}
    </StyledModal>
  );
}

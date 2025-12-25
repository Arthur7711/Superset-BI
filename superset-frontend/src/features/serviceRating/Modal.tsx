import { styled } from '@superset-ui/core';
import Modal from '../../components/Modal';

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  // buttonTitle: string;
  // onHandledPrimaryAction: () => void;
}

// .ant-modal-body {
//     min-height: 500px;
//   }
const StyledModal = styled(Modal)`
  .ant-modal-body {
    min-height: 300px;
    z-index: 10000;
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
  .ant-modal-footer {
    [data-test='modal-cancel-button'] {
      display: none;
    }
  }
`;

export function ServiceModal({
  children,
  isOpen,
  onClose,
  // buttonTitle,
  // onHandledPrimaryAction,
}: ModalProps) {
  return (
    <StyledModal
      show={isOpen}
      onHide={onClose}
      title=""
      maskClosable={false}
      disablePrimaryButton // remove primary button
      hideFooter // remove footer
      // primaryButtonName={buttonTitle}
      // onHandledPrimaryAction={onHandledPrimaryAction}
    >
      {children}
    </StyledModal>
  );
}

import { useState } from 'react';
import { ServiceModal } from './Modal';

export function ServiceRating() {
  const [isOpen, setIsOpen] = useState(true);
  const onClose = () => setIsOpen(false);
  return (
    <ServiceModal isOpen={isOpen} onClose={onClose}>
      <div>
        <h1>Service Rating</h1>
      </div>
    </ServiceModal>
  );
}

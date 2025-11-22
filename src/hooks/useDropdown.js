import { useState, useEffect, useRef } from 'react';

export function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const open = (buttonElement) => {
    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 5,
        left: rect.left,
        minWidth: rect.width
      });
    }
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const toggle = (buttonElement) => {
    if (isOpen) {
      close();
    } else {
      open(buttonElement);
    }
  };

  return {
    isOpen,
    position,
    dropdownRef,
    buttonRef,
    open,
    close,
    toggle
  };
}
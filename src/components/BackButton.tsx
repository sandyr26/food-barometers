import React from "react";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, label = "Retour" }) => {
  return (
    <button type="button" onClick={onClick} className="back-button" aria-label={label}>
      <ArrowLeft size={20} strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
};

export default BackButton;

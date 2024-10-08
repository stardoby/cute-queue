import { useContext } from "react";

import { ModalContext } from "@/contexts/modalContext";

export function useModals() {
    return useContext(ModalContext);
}

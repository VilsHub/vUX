import { ModalDisplayer } from "../../vUX-modalDisplayer.js";

const log = message => {
    document.getElementById("log").textContent += message + "\n";
};

const modal = new ModalDisplayer();

modal.config.className = "open-modal";          // click targets that open a modal
modal.config.formIdAttribute = "data-form";     // attribute holding the modal element's id
modal.config.closeButtonClass = "modal-close";  // any element with this class closes the modal
modal.config.modalWidthsAttribute = "data-widths";
modal.config.overlayStyle = "hsla(220, 40%, 10%, 0.55)";
modal.config.openProcessor = () => log("opened: " + (modal.mainForm ? modal.mainForm.id : "?"));
modal.config.closeProcessor = () => log("closed");
modal.initialize();

document.getElementById("effect").addEventListener("change", e => {
    modal.config.effect = e.target.value;
});

// exposed for the console / automated tests
window.demoModal = modal;

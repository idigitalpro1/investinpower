const placeholderMailto = document.querySelector("[data-placeholder-mailto]");
const contactStatus = document.querySelector("#contact-status");

if (placeholderMailto && contactStatus) {
  placeholderMailto.setAttribute("aria-disabled", "true");
  placeholderMailto.addEventListener("click", (event) => {
    event.preventDefault();
    contactStatus.textContent =
      "Contact is not active yet. Supply an approved email address or static form endpoint before launch.";
    contactStatus.focus?.();
  });
}

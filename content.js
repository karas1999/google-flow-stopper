(() => {
  "use strict";

  if (!window.navigation) return;

  window.navigation.addEventListener("navigate", (event) => {
    // Recheck the current route because this listener survives SPA navigation.
    if (
      location.hostname !== "labs.google" ||
      !/^\/fx\/(?:[^/]+\/)?tools\/flow(?:\/|$)/.test(location.pathname) ||
      !event.cancelable
    ) {
      return;
    }

    const destination = new URL(event.destination.url);
    if (destination.hostname === "flow.google.com") {
      // Cancel only this navigation. Do not stop CSS, fonts, images or fetches.
      event.preventDefault();
    }
  });
})();

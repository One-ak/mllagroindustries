(function () {
  "use strict";

  var VIDEO_SELECTOR = ".hero-product-video";
  var BRAND_LOGO_SELECTOR = '.avatar-img, img[alt="Vansh Logo"]';
  var BRAND_LOGO_URL = "./vansh-group-logo.png";
  var COMPANY_LOGO_HOLDER_SELECTOR = ".company-icon, .post-avatar, .link-icon-wrapper";
  var reducedMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var trackedVideos = new Set();
  var videoStates = new WeakMap();
  var activeDialog = null;
  var dialogReturnFocus = null;

  function styleCircularLogo(logo) {
    logo.classList.add("social-brand-logo");

    var holder = logo.closest(".company-icon, .post-avatar");
    if (holder) {
      holder.classList.add("social-brand-logo-holder");
    }
  }

  function enhanceBrandLogo(logo) {
    if (logo.classList.contains("social-brand-logo")) {
      return;
    }

    var company = logo.closest(".company-card, .post-card");
    var heading = company && company.querySelector("h3, h4");
    var isFishGold = heading && heading.textContent.trim() === "Fish Gold Industries";

    logo.src = BRAND_LOGO_URL;
    logo.alt = isFishGold ? "Fish Gold Industries logo" : "Vansh Group logo";
    styleCircularLogo(logo);
  }

  function enhanceCompanyLogo(holder) {
    if (holder.querySelector(".social-brand-logo")) {
      return;
    }

    var company = holder.closest(".company-card, .post-card");
    var heading = company && company.querySelector("h3, h4");
    var name = heading && heading.textContent.trim();

    if (name === "Gaon Dehat") {
      var logo = document.createElement("img");
      logo.src = "./gaon-dehat-logo.jpg";
      logo.alt = "Gaon Dehat logo";
      holder.replaceChildren(logo);
      styleCircularLogo(logo);
    } else if (name === "MLL Agro Industries" && holder.matches(".company-icon, .post-avatar")) {
      var mllLogo = holder.querySelector('img[alt="MLL Agro Logo"]');
      // Older cached company data still renders a leaf in these heading slots.
      if (!mllLogo) {
        mllLogo = document.createElement("img");
        mllLogo.src = "./mll-logo.png";
        mllLogo.alt = "MLL Agro Logo";
        holder.replaceChildren(mllLogo);
      }
      styleCircularLogo(mllLogo);
    }
  }

  function prefersReducedMotion() {
    return Boolean(reducedMotion && reducedMotion.matches);
  }

  function shouldSaveData() {
    return Boolean(connection && connection.saveData);
  }

  function pauseForPolicy(video, state) {
    if (!video.paused) {
      state.policyPause = true;
      video.pause();
    }
  }

  function syncVideo(video) {
    var state = videoStates.get(video);

    if (!state) {
      return;
    }

    var mayAutoplay =
      state.isNearViewport &&
      !state.userPaused &&
      !document.hidden &&
      !prefersReducedMotion() &&
      !shouldSaveData();

    if (!mayAutoplay) {
      pauseForPolicy(video, state);
      return;
    }

    if (video.paused) {
      state.policyPlay = true;
      var playRequest = video.play();

      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {
          state.policyPlay = false;
        });
      }
    }
  }

  function syncAllVideos() {
    trackedVideos.forEach(function (video) {
      if (!video.isConnected) {
        trackedVideos.delete(video);
        return;
      }

      syncVideo(video);
    });
  }

  var videoObserver = "IntersectionObserver" in window
    ? new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var state = videoStates.get(entry.target);

            if (!state) {
              return;
            }

            state.isNearViewport = entry.isIntersecting;
            syncVideo(entry.target);
          });
        },
        {
          root: null,
          rootMargin: "240px 0px",
          threshold: 0.01
        }
      )
    : null;

  function prepareVideo(video) {
    if (videoStates.has(video)) {
      return;
    }

    var state = {
      isNearViewport: false,
      policyPause: false,
      policyPlay: false,
      userPaused: false
    };

    videoStates.set(video, state);
    trackedVideos.add(video);

    video.autoplay = false;
    video.removeAttribute("autoplay");
    video.preload = "metadata";
    video.setAttribute("preload", "metadata");
    video.controls = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("aria-label", "Featured product video");

    video.addEventListener("play", function () {
      if (state.policyPlay) {
        state.policyPlay = false;
      } else {
        state.userPaused = false;
      }
    });

    video.addEventListener("pause", function () {
      if (state.policyPause) {
        state.policyPause = false;
      } else {
        state.userPaused = true;
      }
    });

    pauseForPolicy(video, state);

    // Restart source selection so the new metadata-only preload policy wins
    // even if React's original autoplay property already started a request.
    video.load();

    if (videoObserver) {
      videoObserver.observe(video);
    }
  }

  function enhanceQrTrigger(trigger) {
    if (trigger.dataset.socialA11yReady === "true") {
      return;
    }

    var link = trigger.closest(".post-link-item");
    var labelElement = link && link.querySelector(".link-left span");
    var destination = labelElement ? labelElement.textContent.trim() : "this social link";
    var label = "Show QR code for " + destination;
    var qrImage = trigger.querySelector('svg[role="img"]');

    trigger.dataset.socialA11yReady = "true";
    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("aria-label", label);
    trigger.setAttribute("title", label);

    if (qrImage) {
      qrImage.setAttribute("aria-label", "QR code for " + destination);
    }

    trigger.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      trigger.click();
    });
  }

  function getFocusableElements(container) {
    return Array.prototype.filter.call(
      container.querySelectorAll(
        'a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])'
      ),
      function (element) {
        return !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true";
      }
    );
  }

  function containDialogFocus(event, dialog) {
    if (event.key !== "Tab") {
      return;
    }

    var focusable = getFocusableElements(dialog);

    if (!focusable.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function enhanceDialog(dialog) {
    if (dialog.dataset.socialA11yReady === "true") {
      return;
    }

    var heading = dialog.querySelector("h3");
    var closeButton = dialog.querySelector(".qr-modal-close");
    var qrImage = dialog.querySelector('svg[role="img"]');
    var description = dialog.querySelector("p");

    dialog.dataset.socialA11yReady = "true";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("tabindex", "-1");

    if (heading) {
      heading.id = "qr-modal-title";
      dialog.setAttribute("aria-labelledby", heading.id);
    }

    if (description) {
      description.id = "qr-modal-description";
      dialog.setAttribute("aria-describedby", description.id);
    }

    if (closeButton) {
      closeButton.setAttribute("aria-label", "Close QR code dialog");
      closeButton.setAttribute("title", "Close");
    }

    if (qrImage) {
      qrImage.setAttribute(
        "aria-label",
        description ? description.textContent.trim() : "Social link QR code"
      );
    }

    dialogReturnFocus = document.activeElement;
    activeDialog = dialog;
    dialog.addEventListener("keydown", function (event) {
      containDialogFocus(event, dialog);
    });

    window.requestAnimationFrame(function () {
      (closeButton || dialog).focus();
    });
  }

  function restoreDialogFocusIfClosed() {
    if (!activeDialog || activeDialog.isConnected) {
      return;
    }

    var returnTarget = dialogReturnFocus;
    activeDialog = null;
    dialogReturnFocus = null;

    if (returnTarget && returnTarget.isConnected && typeof returnTarget.focus === "function") {
      window.requestAnimationFrame(function () {
        returnTarget.focus();
      });
    }
  }

  function enhanceLandmarks(scope) {
    var main = scope.querySelector && scope.querySelector("main.feed");
    var tabs = scope.querySelector && scope.querySelector("nav.tabs-container");

    if (main && !main.id) {
      main.id = "main-content";
      main.setAttribute("tabindex", "-1");
    }

    if (tabs && !tabs.hasAttribute("aria-label")) {
      tabs.setAttribute("aria-label", "Feed categories");
    }
  }

  function enhanceTree(root) {
    var scope = root && root.nodeType === 1 ? root : document;

    if (scope.matches && scope.matches(BRAND_LOGO_SELECTOR)) {
      enhanceBrandLogo(scope);
    }

    if (scope.matches && scope.matches(COMPANY_LOGO_HOLDER_SELECTOR)) {
      enhanceCompanyLogo(scope);
    }

    if (scope.matches && scope.matches(VIDEO_SELECTOR)) {
      prepareVideo(scope);
    }

    if (scope.matches && scope.matches(".qr-container")) {
      enhanceQrTrigger(scope);
    }

    if (scope.matches && scope.matches(".qr-modal-content")) {
      enhanceDialog(scope);
    }

    if (scope.querySelectorAll) {
      scope.querySelectorAll(BRAND_LOGO_SELECTOR).forEach(enhanceBrandLogo);
      scope.querySelectorAll(COMPANY_LOGO_HOLDER_SELECTOR).forEach(enhanceCompanyLogo);
      scope.querySelectorAll(VIDEO_SELECTOR).forEach(prepareVideo);
      scope.querySelectorAll(".qr-container").forEach(enhanceQrTrigger);
      scope.querySelectorAll(".qr-modal-content").forEach(enhanceDialog);
    }

    enhanceLandmarks(scope);
  }

  var domObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) {
          enhanceTree(node);
        }
      });
    });

    restoreDialogFocusIfClosed();
  });

  domObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  document.addEventListener("DOMContentLoaded", function () {
    enhanceTree(document);

    var skipLink = document.querySelector(".social-skip-link");

    if (skipLink) {
      skipLink.addEventListener("click", function () {
        var main = document.getElementById("main-content");

        if (main) {
          window.requestAnimationFrame(function () {
            main.focus({ preventScroll: true });
          });
        }
      });
    }
  });

  document.addEventListener("visibilitychange", syncAllVideos);
  window.addEventListener("pageshow", syncAllVideos);
  window.addEventListener("pagehide", function () {
    trackedVideos.forEach(function (video) {
      var state = videoStates.get(video);

      if (state) {
        pauseForPolicy(video, state);
      }
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && activeDialog && activeDialog.isConnected) {
      var closeButton = activeDialog.querySelector(".qr-modal-close");

      if (closeButton) {
        event.preventDefault();
        closeButton.click();
      }
    }
  });

  if (reducedMotion) {
    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", syncAllVideos);
    } else if (typeof reducedMotion.addListener === "function") {
      reducedMotion.addListener(syncAllVideos);
    }
  }

  if (connection && typeof connection.addEventListener === "function") {
    connection.addEventListener("change", syncAllVideos);
  }
})();

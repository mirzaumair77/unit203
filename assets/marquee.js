function handleMarquee() {
  const marquees = Array.prototype.slice.call(
    document.querySelectorAll(".marquee")
  );
  if (!marquees.length) return;

  for (const marquee of marquees) {
    const track = marquee.querySelector(".marquee__track");
    const viewport = marquee.querySelector(".marquee__viewport");
    if (!track || !viewport) return;

    const firstSegment = track.querySelector(".marquee__segment");
    if (!firstSegment) return;

    function rebuild() {
      // Read speed from the marquee element’s inline style
      const speedStr = getComputedStyle(marquee)
        .getPropertyValue("--marquee-speed-pps")
        .trim();
      const pixelsPerSecond = parseFloat(speedStr) || 120;

      // Reset to a single original segment
      while (track.children.length > 1) track.removeChild(track.lastChild);

      const segmentWidth = Math.ceil(
        firstSegment.getBoundingClientRect().width
      );
      const viewportWidth = Math.ceil(viewport.getBoundingClientRect().width);
      if (segmentWidth <= 0 || viewportWidth <= 0) return;

      // Ensure content covers viewport + 1 segment
      const needed = Math.max(
        1,
        Math.ceil((viewportWidth + segmentWidth) / segmentWidth) - 1
      );
      for (let i = 0; i < needed; i++) {
        const cloned = firstSegment.cloneNode(true);
        cloned.setAttribute("aria-hidden", "true");
        track.appendChild(cloned);
      }

      // Animate one segment width for a perfect loop
      track.style.setProperty("--shift", -segmentWidth + "px");
      const durationSeconds = segmentWidth / pixelsPerSecond;
      track.style.animationDuration = durationSeconds + "s";

      // Direction
      const dir = marquee.getAttribute("data-direction") || "left";
      track.style.animationDirection = dir === "right" ? "reverse" : "normal";
    }

    // Initial build
    rebuild();

    // Recompute on resize or font/content change
    if ("ResizeObserver" in window) {
      const ro = new ResizeObserver(function () {
        rebuild();
      });
      ro.observe(firstSegment);
      ro.observe(viewport);
    } else {
      window.addEventListener("resize", rebuild);
    }

    // Interaction behavior depending on pause mode
    const pauseMode = marquee.getAttribute("data-pause");
    if (pauseMode !== "hover") {
      [
        "mouseover",
        "mouseenter",
        "focus",
        "blur",
        "mouseout",
        "mouseleave",
      ].forEach(function (evt) {
        track.addEventListener(
          evt,
          function () {
            track.style.animationPlayState = "running";
          },
          true
        );
      });
    }
  }
}

function handleJSDrawer() {
  const details = document.getElementById("Details-menu-drawer-container");
  if (!details) return;

  const summary = details.getElementsByTagName("summary")[0];
  if (!summary) return;

  // close button in your HTML
  const closeBtn = details.querySelector(".mobile_menu_close_btn");

  function setAria(open) {
    summary.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function openDrawer() {
    details.setAttribute("open", "open"); // attribute form works broadly
    details.classList.add("menu-opening"); // keep your existing hook
    setAria(true);
    // If your CSS relies ONLY on [open], it will slide in now.
  }

  function closeDrawer() {
    details.classList.remove("menu-opening");
    details.removeAttribute("open");
    setAria(false);
  }

  function toggle(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (details.hasAttribute("open")) closeDrawer();
    else openDrawer();
  }

  // IMPORTANT: stop native <details> behavior, control it ourselves
  summary.onclick = toggle;

  if (closeBtn) {
    closeBtn.onclick = function (e) {
      if (e && e.preventDefault) e.preventDefault();
      closeDrawer();
    };
  }
}

// Marquee
document.addEventListener("DOMContentLoaded", function () {
  handleMarquee();

  handleJSDrawer();
});
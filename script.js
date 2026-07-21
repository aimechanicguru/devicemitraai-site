const workflowSteps = [
  {
    icon: "settings-2",
    kicker: "Step 1",
    title: "Choose the device",
    copy:
      "Select AC, fan, or motor bike so DeviceMitra can load the right evidence rules and safety checks.",
    points: [
      "Device-specific fault dictionaries",
      "Photo context priorities",
      "Safety lexicon matched to the device",
    ],
  },
  {
    icon: "message-square-text",
    kicker: "Step 2",
    title: "Describe the complaint",
    copy:
      "Pick the main problem or describe it in plain language. The app uses that complaint to choose the right question path.",
    points: ["Common symptoms", "Custom issue text", "Complaint-aware triage"],
  },
  {
    icon: "camera",
    kicker: "Step 3",
    title: "Add guided photos",
    copy:
      "Capture safe, useful views such as AC filter, fan mount, wiring, warning lights, tyres, battery, or leak areas.",
    points: ["Quality checks", "Detected evidence tags", "Next-best photo suggestions"],
  },
  {
    icon: "shield-alert",
    kicker: "Step 4",
    title: "Check safety signals",
    copy:
      "Report smoke, sparks, shocks, leaks, fuel smell, loose mounting, brake risk, or battery swelling before diagnosis continues.",
    points: ["S0-S3 safety class", "Hard-stop mode", "Professional-only framing"],
  },
  {
    icon: "list-checks",
    kicker: "Step 5",
    title: "Answer targeted questions",
    copy:
      "DeviceMitra asks short checks tailored to the complaint so the evidence can separate similar faults.",
    points: ["Dynamic questionnaire", "Contradiction handling", "Evidence readiness gate"],
  },
  {
    icon: "video",
    kicker: "Step 6",
    title: "Sound or video (planned)",
    copy:
      "Optional media will help identify motion clues, vibration, outdoor unit behavior, unusual sounds, and bike symptoms from a safe distance. This feature is currently unavailable and will be added in a future release.",
    points: ["Not available yet", "Planned audio clues", "Planned motion evidence"],
  },
  {
    icon: "ruler",
    kicker: "Step 7",
    title: "Add measurements",
    copy:
      "Measurements are accepted only when already visible, recorded, or provided by a service professional.",
    points: ["Role-aware prompts", "Technician measurements", "No unsafe live checks"],
  },
  {
    icon: "file-check-2",
    kicker: "Step 8",
    title: "Review and generate",
    copy:
      "Confirm evidence, then generate a safety-checked report with ranked faults, next actions, and technician notes.",
    points: ["Ranked likely faults", "Shareable summary", "Saved case history"],
  },
];

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function trackEvent(name, detail = {}) {
  const payload = {
    name,
    detail,
    path: window.location.pathname,
    hash: window.location.hash,
    timestamp: new Date().toISOString(),
  };
  window.deviceMitraEvents = window.deviceMitraEvents || [];
  window.deviceMitraEvents.push(payload);
  console.info("[DeviceMitra event]", payload);
}

function getContextValue(name) {
  const params = new URLSearchParams(window.location.search);
  const field = document.querySelector(`[name="${name}"]`);
  const pageValue = document.body?.dataset?.[name];
  return params.get(name) || (field && field.value) || pageValue || "";
}

function setupMenu() {
  const menuButton = document.querySelector(".menu-button");
  const navLinks = document.querySelector(".nav-links");
  if (!menuButton || !navLinks) return;

  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      navLinks.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

function setupWorkflow() {
  const buttons = [...document.querySelectorAll(".step-button")];
  const title = document.querySelector("[data-step-title]");
  const copy = document.querySelector("[data-step-copy]");
  const points = document.querySelector("[data-step-points]");
  const kicker = document.querySelector(".step-kicker");
  const icon = document.querySelector(".step-icon");

  if (!buttons.length || !title || !copy || !points || !kicker || !icon) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.step || 0);
      const step = workflowSteps[index];
      if (!step) return;

      buttons.forEach((item) => {
        item.classList.toggle("is-active", item === button);
        item.setAttribute("aria-selected", String(item === button));
      });

      icon.innerHTML = `<i data-lucide="${step.icon}" aria-hidden="true"></i>`;
      kicker.textContent = step.kicker;
      title.textContent = step.title;
      copy.textContent = step.copy;
      points.innerHTML = step.points.map((point) => `<li>${point}</li>`).join("");
      trackEvent("workflow_step_selected", { step: step.kicker, title: step.title });
      refreshIcons();
    });

    button.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) {
        return;
      }
      event.preventDefault();
      const currentIndex = buttons.indexOf(button);
      let nextIndex = currentIndex;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % buttons.length;
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = buttons.length - 1;
      }
      buttons[nextIndex].focus();
      buttons[nextIndex].click();
    });
  });
}

function setupSignup() {
  const form = document.querySelector(".signup-form");
  const input = document.querySelector("#email");
  const message = document.querySelector(".form-message");
  if (!form || !input || !message) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (!valid) {
      message.textContent = "Enter a valid email to join early access.";
      message.style.color = "#ffd4d1";
      input.focus();
      return;
    }

    const recipient = "devicemitraai@gmail.com";
    const subject = "DeviceMitra AI early access request";
    const device = getContextValue("device") || "Not specified";
    const symptom = getContextValue("symptom") || "Not specified";
    const role = getContextValue("role") || "Not specified";
    const body = [
      "Hello DeviceMitra AI team,",
      "",
      "I want to request early access to DeviceMitra AI.",
      "",
      `My email address is: ${value}`,
      `Device: ${device}`,
      `Problem or symptom: ${symptom}`,
      `Role: ${role}`,
      `Source page: ${window.location.href}`,
      "",
      "Please notify me when updates or early access are available.",
    ].join("\n");
    const gmailUrl =
      "https://mail.google.com/mail/?view=cm&fs=1" +
      `&to=${encodeURIComponent(recipient)}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
    const mailtoUrl =
      `mailto:${recipient}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    const composer = window.open(gmailUrl, "_blank");
    if (!composer) {
      window.location.href = mailtoUrl;
      trackEvent("fallback_email_client_opened", { device, symptom, role });
    } else {
      composer.opener = null;
      trackEvent("early_access_email_attempt", { device, symptom, role });
    }

    message.textContent = "Your email draft is opening. Review it and send it to request early access.";
    message.style.color = "#bdeecb";
  });
}

function setupTracking() {
  document.querySelectorAll("a[data-track], button[data-track]").forEach((element) => {
    element.addEventListener("click", () => {
      trackEvent(element.dataset.track || "tracked_click", {
        text: element.textContent.trim().replace(/\s+/g, " "),
        href: element.getAttribute("href") || "",
      });
    });
  });

  document.querySelectorAll("details").forEach((detail) => {
    detail.addEventListener("toggle", () => {
      if (detail.open) {
        const summary = detail.querySelector("summary")?.textContent?.trim() || "details";
        trackEvent("safety_or_faq_opened", { summary });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupMenu();
  setupWorkflow();
  setupSignup();
  setupTracking();
  refreshIcons();
});

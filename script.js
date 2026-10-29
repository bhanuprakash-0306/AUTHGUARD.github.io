
"use strict";

// ==========================================
// AUTHGUARD - PASSWORD SECURITY WORKBENCH
// ==========================================

const $ = (id) => document.getElementById(id);

const passwordForm = $("passwordForm");
const passwordInput = $("passwordInput");
const togglePassword = $("togglePassword");
const auditResult = $("auditResult");

const attemptCount = $("attemptCount");
const attemptTrack = $("attemptTrack");
const lockStatus = $("lockStatus");
const loginMessage = $("loginMessage");
const failedLoginBtn = $("failedLoginBtn");
const resetBtn = $("resetBtn");

const reportSummary = $("reportSummary");
const downloadReportBtn = $("downloadReportBtn");

const runTestsBtn = $("runTestsBtn");
const testResults = $("testResults");

const threatLevelElement = $("threatLevel");
const threatBadge = $("threatBadge");
const threatExplanation = $("threatExplanation");
const threatLog = $("threatLog");
const runScenarioBtn = $("runScenarioBtn");
const clearEventsBtn = $("clearEventsBtn");

const MAX_ATTEMPTS = 5;

let failedAttempts = 0;
let isLocked = false;
let latestAudit = null;
let threatEvents = [];

const report = {
    audit: "No password audit has been run.",
    login: "No failed login attempts simulated.",
    date: new Date().toLocaleString()
};

const commonPasswords = [
    "password",
    "password123",
    "123456",
    "12345678",
    "qwerty",
    "admin",
    "letmein",
    "welcome"
];

// ==========================================
// SHARED UTILITIES
// ==========================================

function updateReportSummary() {
    let summary = "";

    if (latestAudit) {
        summary =
            `Password audit: ${latestAudit.rating} ` +
            `(${latestAudit.score}/100). `;
    }

    summary += `Login simulation: ${failedAttempts}/${MAX_ATTEMPTS} failed attempts`;

    if (isLocked) {
        summary += " — LOCKED";
    }

    reportSummary.textContent = summary;

    report.date = new Date().toLocaleString();
}

function addFinding(container, passed, message) {
    const item = document.createElement("div");
    item.className = `finding ${passed ? "pass" : "fail"}`;

    const mark = document.createElement("span");
    mark.className = "finding-mark";
    mark.textContent = passed ? "✓" : "✕";

    const text = document.createElement("span");
    text.textContent = message;

    item.append(mark, text);
    container.appendChild(item);
}

// ==========================================
// 01. PASSWORD POLICY AUDIT
// ==========================================

togglePassword.addEventListener("click", () => {
    const currentlyHidden = passwordInput.type === "password";

    passwordInput.type = currentlyHidden ? "text" : "password";
    togglePassword.textContent = currentlyHidden ? "Hide" : "Show";
});

passwordForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const password = passwordInput.value;

    if (!password) {
        return;
    }

    // All checks are performed locally in this browser.
    const checks = [
        {
            name: "At least 12 characters",
            passed: password.length >= 12
        },
        {
            name: "Contains a lowercase letter",
            passed: /[a-z]/.test(password)
        },
        {
            name: "Contains an uppercase letter",
            passed: /[A-Z]/.test(password)
        },
        {
            name: "Contains a number",
            passed: /[0-9]/.test(password)
        },
        {
            name: "Contains a special character",
            passed: /[^A-Za-z0-9]/.test(password)
        },
        {
            name: "Not on the built-in common-password list",
            passed: !commonPasswords.includes(password.toLowerCase())
        },
        {
            name: "Avoids obvious sequences",
            passed: !/(?:0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|qwer|asdf)/i.test(password)
        },
        {
            name: "Avoids four or more repeated characters",
            passed: !/(.)\1{3,}/.test(password)
        }
    ];

    const passedCount = checks.filter(check => check.passed).length;
    const totalChecks = checks.length;
    const score = Math.round((passedCount / totalChecks) * 100);

    let rating = "WEAK";

    if (passedCount >= 7) {
        rating = "STRONGER";
    } else if (passedCount >= 5) {
        rating = "MODERATE";
    }

    latestAudit = {
        score,
        rating,
        passedCount,
        totalChecks,
        checks: checks.map(check => ({
            name: check.name,
            passed: check.passed
        }))
    };

    // Construct the results without displaying the password.
    auditResult.replaceChildren();

    const scoreLine = document.createElement("div");
    scoreLine.className = "score-line";

    const scoreText = document.createElement("span");
    scoreText.className = "score";
    scoreText.textContent = `${score}/100`;

    const ratingText = document.createElement("span");
    ratingText.className = "score-label";
    ratingText.textContent = rating;

    scoreLine.append(scoreText, ratingText);

    const meter = document.createElement("div");
    meter.className = "meter";

    const meterFill = document.createElement("div");
    meterFill.className = "meter-fill";
    meterFill.style.width = `${score}%`;

    if (score < 50) {
        meterFill.style.background = "var(--red)";
    } else if (score < 88) {
        meterFill.style.background = "var(--yellow)";
    }

    meter.appendChild(meterFill);

    const heading = document.createElement("p");
    heading.className = "muted";
    heading.textContent =
        `${passedCount} of ${totalChecks} policy checks passed`;

    const findingList = document.createElement("div");
    findingList.className = "finding-list";

    checks.forEach(check => {
        addFinding(findingList, check.passed, check.name);
    });

    auditResult.append(scoreLine, meter, heading, findingList);

    // Only store the findings, not the password itself.
    report.audit =
        `Password policy audit: ${rating} (${score}/100). ` +
        `${passedCount} of ${totalChecks} checks passed. ` +
        checks.map(check =>
            `${check.passed ? "PASS" : "FAIL"}: ${check.name}`
        ).join("; ");

    // Clear the input after the audit.
    passwordInput.value = "";
    passwordInput.type = "password";
    togglePassword.textContent = "Show";

    updateReportSummary();
});

// ==========================================
// 02. LOGIN LOCKOUT SIMULATOR
// ==========================================

function updateLoginDisplay() {
    attemptCount.textContent = failedAttempts;

    const bars = attemptTrack.querySelectorAll("span");

    bars.forEach((bar, index) => {
        bar.classList.toggle("used", index < failedAttempts);
    });

    failedLoginBtn.disabled = isLocked;
}

function resetLoginSimulation() {
    failedAttempts = 0;
    isLocked = false;

    lockStatus.textContent = "UNLOCKED";
    lockStatus.classList.remove("locked");

    loginMessage.textContent =
        "Simulator reset. You can test again.";

    updateLoginDisplay();
}

failedLoginBtn.addEventListener("click", () => {
    if (isLocked) {
        return;
    }

    failedAttempts++;

    if (failedAttempts >= MAX_ATTEMPTS) {
        isLocked = true;

        lockStatus.textContent = "LOCKED";
        lockStatus.classList.add("locked");

        loginMessage.textContent =
            "Lockout triggered after five simulated failed attempts.";
    } else {
        loginMessage.textContent =
            `Failed attempt recorded. ` +
            `${MAX_ATTEMPTS - failedAttempts} attempt(s) remain before lockout.`;
    }

    updateLoginDisplay();
    updateReportSummary();
});

resetBtn.addEventListener("click", () => {
    resetLoginSimulation();

    report.login =
        "Simulator reset. No active simulated failed attempts.";

    updateReportSummary();

    if (typeof addThreatEvent === "function") {
        addThreatEvent("Login simulator reset.", "normal");
        updateThreatRadar();
    }
});

// ==========================================
// 03. DOWNLOADABLE SECURITY REPORT
// ==========================================

downloadReportBtn.addEventListener("click", () => {
    const content = [
        "AUTHGUARD SECURITY REPORT",
        "=========================",
        `Generated: ${report.date}`,
        "",
        "PASSWORD POLICY AUDIT",
        report.audit,
        "",
        "LOGIN LOCKOUT SIMULATION",
        report.login,
        "",
        "THREAT RADAR",
        `Current threat level: ${threatLevelElement.textContent}`,
        `Events recorded: ${threatEvents.length}`,
        ...threatEvents.map(event =>
            `[${event.time}] ${event.message}`
        ),
        "",
        "PRIVACY NOTE",
        "The tested password is not included in this report.",
        "",
        "LIMITATIONS",
        "This is an educational client-side demonstration.",
        "It does not implement real authentication or server-side lockout.",
        "The password checks use a small built-in list and simple pattern rules."
    ].join("\n");

    const file = new Blob([content], {
        type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "authguard-security-report.txt";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
});

// ==========================================
// 04. AUTOMATED SELF-TEST LAB
// ==========================================

runTestsBtn.addEventListener("click", () => {
    const results = [];

    function recordTest(name, passed) {
        results.push({ name, passed });
    }

    // Test 1: A clearly weak fictional password.
    passwordInput.value = "123456";

    passwordForm.dispatchEvent(
        new Event("submit", { cancelable: true })
    );

    recordTest(
        "Weak password is identified",
        latestAudit !== null && latestAudit.rating === "WEAK"
    );

    // Test 2: A fictional password designed to pass the current rules.
    passwordInput.value = "Violet!Cedar9";

    passwordForm.dispatchEvent(
        new Event("submit", { cancelable: true })
    );

    recordTest(
        "Policy-compliant test password passes all checks",
        latestAudit !== null &&
        latestAudit.passedCount === latestAudit.totalChecks
    );

    // Test 3: Five failed attempts trigger the simulated lockout.
    resetBtn.click();

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        failedLoginBtn.click();
    }

    recordTest(
        "Lockout triggers after five failed attempts",
        isLocked &&
        failedAttempts === MAX_ATTEMPTS &&
        failedLoginBtn.disabled
    );

    // Test 4: Reset clears the lockout.
    resetBtn.click();

    recordTest(
        "Reset unlocks the simulator",
        !isLocked &&
        failedAttempts === 0 &&
        !failedLoginBtn.disabled
    );

    testResults.replaceChildren();

    const passed = results.filter(result => result.passed).length;
    const summary = document.createElement("p");

    summary.className = passed === results.length ? "pass" : "fail";
    summary.textContent =
        `RESULT: ${passed}/${results.length} tests passed`;

    testResults.appendChild(summary);

    const list = document.createElement("div");
    list.className = "finding-list";

    results.forEach(result => {
        addFinding(list, result.passed, result.name);
    });

    testResults.appendChild(list);

    addThreatEvent(
        `Self-tests completed: ${passed}/${results.length} passed.`,
        passed === results.length ? "normal" : "warning"
    );

    updateThreatRadar();
});

// ==========================================
// 05. THREAT RADAR AND EVENT LOG
// ==========================================

function addThreatEvent(message, severity = "normal") {
    threatEvents.unshift({
        time: new Date().toLocaleTimeString(),
        message,
        severity
    });

    // Keep the event log bounded.
    threatEvents = threatEvents.slice(0, 20);

    renderThreatEvents();
}

function renderThreatEvents() {
    threatLog.replaceChildren();

    if (threatEvents.length === 0) {
        const empty = document.createElement("p");
        empty.className = "muted";
        empty.textContent = "Waiting for simulated events...";
        threatLog.appendChild(empty);
        return;
    }

    threatEvents.forEach(event => {
        const row = document.createElement("div");
        row.className = `threat-event ${event.severity}`;

        const time = document.createElement("span");
        time.className = "threat-time";
        time.textContent = event.time;

        const message = document.createElement("span");
        message.className = "threat-event-message";
        message.textContent = event.message;

        row.append(time, message);
        threatLog.appendChild(row);
    });
}

function updateThreatRadar() {
    let level = "LOW";
    let badge = "MONITORING";
    let explanation =
        "No elevated risk in this simulation. Continue monitoring login activity.";

    if (isLocked) {
        level = "LOCKED";
        badge = "DEFENSE ACTIVE";
        explanation =
            "Five failed attempts triggered the simulated lockout. " +
            "Further attempts are disabled until reset.";
    } else if (failedAttempts >= 4) {
        level = "HIGH";
        badge = "WARNING";
        explanation =
            "Repeated failures indicate elevated risk. " +
            "The next failed attempt will trigger lockout.";
    } else if (failedAttempts >= 2) {
        level = "ELEVATED";
        badge = "CAUTION";
        explanation =
            "Multiple failures detected. Appropriate monitoring " +
            "and rate limiting can help reduce login abuse.";
    }

    threatLevelElement.textContent = level;
    threatBadge.textContent = badge;
    threatExplanation.textContent = explanation;

    threatLevelElement.classList.remove("elevated", "high");
    threatBadge.classList.remove("elevated", "high");

    if (level === "ELEVATED") {
        threatLevelElement.classList.add("elevated");
        threatBadge.classList.add("elevated");
    }

    if (level === "HIGH" || level === "LOCKED") {
        threatLevelElement.classList.add("high");
        threatBadge.classList.add("high");
    }
}

// Observe events from the existing login simulator.
failedLoginBtn.addEventListener("click", () => {
    const severity = isLocked || failedAttempts >= 4
        ? "danger"
        : failedAttempts >= 2
            ? "warning"
            : "normal";

    const message = isLocked
        ? `Lockout activated after ${failedAttempts} failed attempts.`
        : `Simulated failed login ${failedAttempts}/${MAX_ATTEMPTS}.`;

    addThreatEvent(message, severity);
    updateThreatRadar();
});

// Run a complete simulated scenario.
runScenarioBtn.addEventListener("click", () => {
    resetBtn.click();

    addThreatEvent(
        "Scenario started using fictional login events.",
        "normal"
    );

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        failedLoginBtn.click();
    }

    addThreatEvent(
        "Scenario complete: lockout defense was triggered.",
        "danger"
    );

    updateThreatRadar();
    updateReportSummary();
});

// Clear only the event log, not the login attempt count.
clearEventsBtn.addEventListener("click", () => {
    threatEvents = [];
    renderThreatEvents();

    addThreatEvent("Event log cleared by the user.", "normal");
});

// ==========================================
// INITIAL STATE
// ==========================================

updateLoginDisplay();
updateThreatRadar();
updateReportSummary();

/* AuthGuard Adaptive Login Risk Engine */
(() => {
  "use strict";

  const attemptsInput = document.getElementById("riskFailedAttempts");
  const unknownDeviceInput = document.getElementById("riskUnknownDevice");
  const unusualLocationInput = document.getElementById("riskUnusualLocation");
  const newBrowserInput = document.getElementById("riskNewBrowser");
  const analyzeButton = document.getElementById("analyzeRiskBtn");
  const results = document.getElementById("riskResults");

  // Exit safely if the new HTML section is not present.
  if (
    !attemptsInput ||
    !unknownDeviceInput ||
    !unusualLocationInput ||
    !newBrowserInput ||
    !analyzeButton ||
    !results
  ) {
    return;
  }

  function analyzeLoginRisk() {
    const attempts = Number(attemptsInput.value);
    const unknownDevice = unknownDeviceInput.checked;
    const unusualLocation = unusualLocationInput.checked;
    const newBrowser = newBrowserInput.checked;

    let score = 0;
    const findings = [];

    // Illustrative weights for a learning demonstration.
    if (attempts >= 1) {
      score += Math.min(attempts * 10, 50);
      findings.push(
        `${attempts} failed login attempt(s): +${Math.min(attempts * 10, 50)} points`
      );
    } else {
      findings.push("No failed login attempts selected.");
    }

    if (unknownDevice) {
      score += 20;
      findings.push("Unrecognized device: +20 points");
    }

    if (unusualLocation) {
      score += 20;
      findings.push("Unusual location: +20 points");
    }

    if (newBrowser) {
      score += 10;
      findings.push("New browser: +10 points");
    }

    score = Math.min(score, 100);

    let level;
    let levelClass;
    let recommendation;

    if (score >= 75) {
      level = "CRITICAL";
      levelClass = "risk-critical";
      recommendation =
        "For a real system, consider blocking the attempt temporarily, requiring strong verification, and reviewing the event. This demo does not block a real login.";
    } else if (score >= 50) {
      level = "HIGH";
      levelClass = "risk-high";
      recommendation =
        "Require additional verification in a real authentication system and review the suspicious indicators.";
    } else if (score >= 25) {
      level = "MEDIUM";
      levelClass = "risk-medium";
      recommendation =
        "Consider additional verification and review the login context before allowing access in a real system.";
    } else {
      level = "LOW";
      levelClass = "risk-low";
      recommendation =
        "No major risk indicators were selected. A real system must still apply its normal authentication checks.";
    }

    const findingItems = findings
      .map(item => `<li>${item}</li>`)
      .join("");

    results.innerHTML = `
      <div class="risk-result-card">
        <div class="risk-score-row">
          <div>
            <p>Calculated risk score</p>
            <div class="risk-score">${score}<span style="font-size:16px"> / 100</span></div>
          </div>
          <span class="risk-level ${levelClass}">${level}</span>
        </div>

        <div
          class="risk-meter"
          role="progressbar"
          aria-label="Simulated login risk score"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="${score}">
          <div class="risk-meter-fill" style="width:${score}%"></div>
        </div>

        <h3>Why this score?</h3>
        <ul class="risk-findings">${findingItems}</ul>

        <div class="risk-recommendation">
          <strong>Recommended response</strong>
          <p>${recommendation}</p>
        </div>
      </div>
    `;
  }

  analyzeButton.addEventListener("click", analyzeLoginRisk);
})();

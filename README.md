# AuthGuard — Cybersecurity Awareness Dashboard

## 1. Project Overview

AuthGuard is a browser-based cybersecurity awareness and security testing dashboard. It demonstrates basic password security rules, failed-login lockout mechanisms, automated self-testing, security report generation, and simulated threat monitoring.

The project is designed to help students understand important cybersecurity concepts through an interactive demonstration.

## 2. Objectives

- Evaluate passwords against eight basic security rules.
- Demonstrate account lockout after five failed login attempts.
- Generate a downloadable security report.
- Perform automated self-tests.
- Display simulated security events using a Threat Radar dashboard.
- Improve awareness of common authentication security practices.

## 3. Technologies Used

- HTML — webpage structure
- CSS — styling and responsive dashboard design
- JavaScript — validation, simulation, and interactive functionality
- Web Browser — running the application

## 4. Main Features

### Password Security Audit
Checks a password against eight basic rules and displays the audit result.

### Login Lockout Simulation
Demonstrates a lockout state after five simulated failed login attempts. A reset option allows the demonstration to be repeated.

### Security Report
Allows users to download a text report containing security audit and simulation information.

### Automated Self-Test
Runs four automated checks to demonstrate that key application features are functioning.

### Threat Radar
Displays simulated security events and indicates the current demonstration risk level.

## 5. System Architecture

User Interaction → HTML Interface → JavaScript Logic → Security Checks and Simulations → Dashboard Results and Downloadable Report

## 6. How to Run the Project

1. Open the `authguard` folder in Visual Studio Code.
2. Ensure `index.html`, `style.css`, and `script.js` are present.
3. Open `index.html` in a web browser.
4. Test the password audit, login lockout, self-test, report download, and Threat Radar.
5. Reset the login simulator before repeating the demonstration.

## 7. Limitations

AuthGuard is an educational, client-side prototype. It does not implement real user accounts, server-side authentication, a production database, or live intrusion detection. Its failed-login events and Threat Radar activity are simulated.

Password checks run in the browser. Do not enter real passwords or reuse personal passwords during demonstrations.

## 8. Future Enhancements

- Add secure server-side authentication.
- Integrate a database for user account management.
- Use secure password hashing on the server.
- Add multi-factor authentication.
- Store security events securely on the backend.
- Integrate real monitoring and alerting systems.

## 9. Conclusion

AuthGuard demonstrates fundamental cybersecurity concepts through an interactive dashboard. It provides a simple way to learn about password policies, login lockouts, security testing, event monitoring, and security reporting.

**Project type:** Cybersecurity Mini Project  
**Purpose:** Educational demonstration and cybersecurity awareness

# Financial Wellbeing Assessment Platform (MVP)

Welcome to the MVP source code. This project is built using a clean, scalable, and fully static frontend (HTML5, Vanilla JS, CSS3) and is designed to interact with a Google Apps Script backend and Google Sheets database.

## 🚀 Features Implemented
- **Phase 1-2**: Premium SaaS Design System, Landing Page, Login Page.
- **Phase 3**: Authentication and generic API handlers built to securely talk to Apps Script.
- **Phase 4**: Dynamic User Dashboard to track pending assessments and progress.
- **Phase 5**: Assessment Engine (calculates progress, supports single/multiple choice, validates required fields, auto-saves to local storage).
- **Phase 6 & 7**: Scoring and Profile Engine (calculates scores, maps scores to profiles, generates tailored recommendations based on risk).
- **Phase 8**: Admin & HR Dashboard (provides an overview of organizational wellbeing and completion metrics).

## 🛠️ How to Test Locally
Because this project relies on vanilla JavaScript structure without a build step, you can simply open the files in your browser!
1. Double click `index.html` to start.
2. Click **Login**.
3. Use the credentials:
   - **Username**: `admin`
   - **Password**: `admin`
4. This mock user is an "Admin", meaning you will see the **Admin Panel** link on the dashboard sidebar!

## 📦 Deployment Instructions (GitHub Pages)
1. Initialize a Git repository in this folder.
2. Commit all files.
3. Push to a new GitHub repository.
4. Go to repository Settings > Pages.
5. Select the `main` branch as the source and click Save.
6. The platform is now live!

## 🔗 Connecting the Backend (Google Apps Script)
1. Create a new Google Sheet.
2. In the Google Sheet, go to **Extensions > Apps Script**.
3. Copy the contents of `apps-script/Code.gs` from this project into the Apps Script editor.
4. Replace `SPREADSHEET_ID` at the top of the file with your actual Google Sheet ID.
5. Click **Deploy > New deployment**.
6. Select **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Click Deploy and copy the Web App URL provided.
8. Open `config/apiEndpoints.js` in this project.
9. Replace the `APPS_SCRIPT_WEB_APP_URL` string with your newly copied URL.
10. The frontend is now connected to your backend!

## 🎨 Design System
The UI is styled using CSS Variables (`assets/css/variables.css`). It employs a modern Apple/Linear-inspired SaaS aesthetic with glassmorphism, soft layered shadows, and high-contrast typography. 
- Edit `variables.css` to change the global color scheme instantly.
- Fonts use Google's `Inter`.

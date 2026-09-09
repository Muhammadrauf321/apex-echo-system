# Deployment & Execution Rules

- **DO NOT RUN ON LOCALHOST**: Never launch dev servers or run the application locally on `localhost`.
- **ALWAYS DEPLOY TO FIREBASE**: Build and deploy updates directly to Firebase Hosting (`npm run build && firebase deploy` or `npx -y firebase-tools deploy`).
- **ALWAYS SYNC TO GITHUB**: Whenever changes are made, commit and push them to the GitHub repository (`origin main`).
- **PROVIDE FIREBASE LINK**: Whenever asked to "run", view, or test the app, provide the live Firebase hosting URL:
  - **Live URL**: https://apex-education-forum.web.app
  - Alternative: https://apex-education-forum.firebaseapp.com

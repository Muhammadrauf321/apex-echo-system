# Agent Instructions & Workflow Rules

- **No Localhost Execution**: Do not run dev servers (`localhost`).
- **Always Update Firebase**: Build and deploy updates to Firebase (`npm run build && firebase deploy` / `npx -y firebase-tools deploy`).
- **Always Update GitHub**: Commit and push all changes to GitHub (`git add .`, `git commit -m "..."`, `git push origin main`).
- **Provide Firebase Link**: Whenever asked to run or preview the project, provide the live Firebase URL:
  - **Firebase App**: https://apex-education-forum.web.app

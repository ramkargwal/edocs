# DocuHub Enterprise — Official Corporate Document Archive & Repository Portal

**DocuHub Enterprise** is a modern, full-width corporate document repository, circular registry, and public disclosure portal built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**. Designed with the **Fresh Aqua Gradient – Modern Minimalist UI** theme, it enables organizations to publish, categorize, search, preview, export, and synchronize official records with GitHub repositories—allowing stakeholders to view and download documents with zero login required.

---

## Key Features

### 1. Structured Corporate Document Ledger & Grid Views
- **Full-Width Responsive Table**: Displays corporate records without horizontal scrollbars, featuring sortable columns for **Ref No. & Date**, **Subject & Authority**, **Category**, **Description**, and **Size & Actions**.
- **Table & Grid Switcher**: Toggle seamlessly between the high-density **Corporate Ledger Table** and the **Executive Card Grid** view.
- **Format & Division Badges**: Automatic color-coded chips for file formats (`Pdf`, `Docx`, `Xlsx`, `Csv`) and Corporate Divisions.
- **Compact Pagination**: Configurable rows-per-page selector (`10`, `25`, `50`, `All`) with instant page navigation.

### 2. Advanced Search & Multi-Dimensional Filtering
- **Instant Global Search**: Filter records in real time by Reference Number, Issuance Date, Subject, Issuing Authority, Description, File Name, or Classification Tags.
- **Corporate Division / Folder Selector**: Filter documents by division or create custom division folders on the fly.
- **Date Range & Financial Year Filter**: Built-in presets for `All Dates / FY`, `FY 2026–27`, `FY 2025–26`, `Calendar Year 2026`, `Calendar Year 2025`, `Last 90 Days`, and a **Custom Date Range** (`From` – `To`) picker.
- **Interactive Quick Filters**:
  - **One-Click Copy Ref No.**: Click any Reference Number badge to copy it directly to the clipboard.
  - **One-Click Authority Filter**: Click any Issuing Authority in a row to filter all circulars issued by that department.
  - **Tag Filtering**: Filter records by classification tags (`#Policy`, `#Compliance`, `#Budget`, etc.).

### 3. Inline PDF / Image Viewer & Official Transcript Modal
- **Embedded PDF Viewer**: Renders uploaded PDF files—or dynamically generates a formatted official corporate PDF on the fly—directly inside the preview modal.
- **Interactive Image Viewer**: Built-in `Zoom In`, `Zoom Out`, and `Reset Zoom` controls for image records (`PNG`, `JPG`, `WEBP`, `SVG`).
- **Official Transcript & Cryptographic Verification**: Switch to the formatted letterhead transcript view with SHA-256 checksum verification and one-click hash/link copying.

### 4. Automated Executive PDF Catalog & Excel/CSV Export
- **Vector PDF Report Generator (`jsPDF` + `jspdf-autotable`)**:
  - Generate landscape A4 Executive PDF Catalogs for the **Current Division View**, **Selected Records**, or the **Entire Corporate Repository**.
  - Live interactive PDF preview inside the report modal before downloading or printing.
- **One-Click Excel / CSV Export**: Export all filtered records or selected batch records to a UTF-8 BOM Excel-compatible `.csv` spreadsheet.

### 5. Table Productivity, Row Editing & Batch Operations
- **Publish & Edit Records**: Drag-and-drop file upload with automatic filename metadata parsing (`YYYY-MM-DD_REF-NO_Subject.pdf`) and full in-place editing of existing records.
- **Batch Selection Action Bar**: Select multiple records via checkboxes to perform bulk actions:
  - **Batch Download** all selected files
  - **Batch Export CSV**
  - **Batch Executive PDF Report**
  - **Batch Delete**

### 6. Two-Way GitHub Repository Sync & Direct Commit
- **Pull & Auto-Discovery from GitHub**: Connects to any public GitHub repository (e.g., `sudarshan8555/public-documents`) to automatically discover folders, parse filenames, and stream downloads via GitHub's global CDN (`raw.githubusercontent.com`) with zero login required.
- **Direct GitHub Upload & Commit (Two-Way Sync)**:
  - Provide a GitHub Personal Access Token (`repo` / `contents:write` scope) to push newly uploaded files (or auto-generated official PDFs) directly to `${folderPath}/${category}/${fileName}` in your GitHub repository.
  - Automatically updates and commits `catalog.json` to your repository so all custom metadata, categories, and descriptions stay permanently synchronized across all devices.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`)
- **Icons**: Lucide React (`lucide-react`)
- **PDF Generation**: `jspdf` & `jspdf-autotable`
- **Build Tool**: Vite (`base: './'` pre-configured for relative asset paths on GitHub Pages)
- **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`) with `actions/deploy-pages@v4`

---

## Local Development

1. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start the development server** (runs on `http://localhost:3000`):
   ```bash
   npm run dev
   ```

3. **Type-check and build for production**:
   ```bash
   npm run lint
   npm run build
   ```

---

## Deploying to GitHub Pages

This project is pre-configured for zero-configuration deployment to **GitHub Pages**:

1. **`vite.config.ts`**: Includes `base: './'` so all compiled JS/CSS assets resolve cleanly on both root domains and subpath repositories (`https://<username>.github.io/<repo-name>/`).
2. **GitHub Actions Workflow (`.github/workflows/deploy.yml`)**:
   - Triggers automatically on every push to `main` (or manually via `workflow_dispatch`).
   - Uses `ubuntu-latest`, Node.js 20, `npm install --legacy-peer-deps`, and `actions/deploy-pages@v4`.
3. **Enable GitHub Pages in Repository Settings**:
   - Go to your GitHub repository **Settings → Pages**.
   - Under **Build and deployment → Source**, select **GitHub Actions**.
   - Push to the `main` branch and your live portal will be published automatically.

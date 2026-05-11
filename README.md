# ResumeAI

An AI-powered resume analysis and enhancement tool built with Next.js 14. Upload your resume as a PDF or DOCX and get instant, intelligent feedback powered by Claude (Anthropic) and Gemini (Google).

**Live Demo:** [resume-ai-amber-tau.vercel.app](https://resume-ai-amber-tau.vercel.app)

---

## Features

- **PDF & DOCX Parsing** — Upload your resume in PDF or Word format; the app extracts and processes the text client-side
- **AI-Powered Analysis** — Leverages Anthropic's Claude and Google's Gemini to review, score, and suggest improvements
- **Resume Enhancement** — Get rewritten bullet points, better phrasing, and ATS-friendly suggestions
- **Export** — Download the improved resume or capture it as an image via `html2canvas`
- **Interactive UI** — Smooth animations with Framer Motion, drag-and-drop upload via React Dropzone, and data visualizations via Recharts

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI | Anthropic Claude (`@anthropic-ai/sdk`), Google Gemini (`@google/generative-ai`) |
| File Parsing | `pdf-parse`, `mammoth` (DOCX) |
| Animations | Framer Motion |
| Charts | Recharts |
| Upload | React Dropzone |
| Export | html2canvas |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)
- A [Google Gemini API key](https://aistudio.google.com/)

### Installation

```bash
git clone https://github.com/HJhaRSh/ResumeAI.git
cd ResumeAI
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

# Personal Finance Calculators

## Live Demo

[https://mahendrahegde.github.io/personal-finance-calculators/](https://mahendrahegde.github.io/personal-finance-calculators/)

A collection of interactive Personal finance calculators built with React, TypeScript, and Vite. The project currently includes a Retirement Calculator and is designed for easy extension with additional calculators in the future.

## Features

- **Retirement Calculator**: Estimate your retirement savings and plan for the future.
- **Modern Tech Stack**: Built with React, TypeScript, Vite, and Tailwind CSS for fast development and a great user experience.
- **Responsive Design**: Works well on both desktop and mobile devices.
- **Easy Deployment**: Automatically deployed to GitHub Pages on every push to `main`.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/personal-finance-calculators.git
cd personal-finance-calculators
npm install
```

### Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the app.

### Building for Production

To build the app for production:

```bash
npm run build
```

The output will be in the `dist` directory.

### Deployment

This project is automatically deployed to GitHub Pages using a GitHub Actions workflow (`.github/workflows/deploy.yml`). The site is published from the `dist` directory to the `gh-pages` branch.

To deploy manually:

```bash
npm run deploy
```

## Project Structure

- `src/components/retirement_calculator.tsx` – Main Retirement Calculator component
- `src/types/retirement.ts` – TypeScript types for retirement calculations
- `src/utils/` – Utility functions for calculations and storage

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

# OncoSafeRx Frontend

A modern React TypeScript frontend for the OncoSafeRx oncology drug interaction and pharmacogenomics platform.

## Features

- **Drug Search**: Search comprehensive drug databases (RxNorm, FDA DailyMed)
- **Interaction Checker**: Check for drug-drug interactions with severity analysis
- **Genomics Analysis**: Explore pharmacogenomic guidelines and gene-drug interactions
- **Clinical Protocols**: Access oncology treatment protocols and clinical trials
- **Modern UI**: Clean, responsive design with Tailwind CSS

## Technology Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication

## Getting Started

### Prerequisites

- Node.js (>= 16.0.0)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your API URL:
```env
REACT_APP_API_URL=http://localhost:3000/api
```

### Development

Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

### Building

Build for production:
```bash
npm run build
```

### Testing

Run tests:
```bash
npm test
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── DrugSearch/     # Drug search components
│   ├── Interactions/   # Drug interaction components
│   ├── Genomics/       # Pharmacogenomics components
│   ├── Layout/         # Layout components (Header, Layout)
│   └── UI/             # Basic UI components (Card, Alert, etc.)
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── DrugSearch.tsx  # Drug search page
│   └── Protocols.tsx   # Clinical protocols page
├── services/           # API services
│   └── api.ts          # Axios configuration and API calls
├── types/              # TypeScript type definitions
│   └── index.ts        # All application types
└── App.tsx             # Main application component
```

## API Integration

The frontend connects to the OncoSafeRx backend API. Key services include:

- **Drug Service**: Search drugs, get details, check interactions
- **Interaction Service**: Check multi-drug interactions
- **Genomics Service**: Get CPIC guidelines, analyze drug genomics

## Components

### Layout Components
- `Header`: Navigation and branding
- `Layout`: Main page layout wrapper

### UI Components
- `Card`: Container component
- `Alert`: Status and error messages
- `LoadingSpinner`: Loading indicators

### Feature Components
- `DrugSearchBar`: Drug search input
- `DrugCard`: Drug information display
- `InteractionChecker`: Multi-drug interaction analysis
- `GenomicsAnalysis`: Pharmacogenomic guidelines and analysis

## Styling

The application uses Tailwind CSS for styling with:
- Custom color palette for medical/pharmaceutical themes
- Responsive design for mobile and desktop
- Consistent spacing and typography
- Component-based styling patterns

## Environment Variables

- `REACT_APP_API_URL`: Backend API base URL
- `REACT_APP_VERSION`: Application version

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new components
3. Add proper error handling
4. Include loading states for async operations
5. Ensure responsive design

## Available Scripts

- `npm start`: Start development server
- `npm run build`: Build for production
- `npm test`: Run test suite
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier
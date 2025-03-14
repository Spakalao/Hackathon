# Budget Travel Planner

An AI-powered travel planning application that helps budget-conscious travelers create optimized itineraries based on their preferences, budget constraints, and travel dates.

![Budget Travel Planner](public/screenshot.png)

## Features

- **AI-Powered Planning**: Enter your travel preferences in natural language and get personalized itineraries
- **Budget Optimization**: Find the best travel options that fit your budget constraints
- **Interactive Maps**: Visualize your itinerary with Google Maps integration
- **Weather Forecasts**: Get weather information for your travel dates
- **Flight & Accommodation Search**: Find affordable flights and accommodation options
- **Mobile Responsive**: Fully responsive design that works on all devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI API
- **Maps**: Google Maps API
- **State Management**: React Hooks & Context API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- OpenAI API key
- Google Maps API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/budget-travel-planner.git
   cd budget-travel-planner
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your API keys and other configuration
   ```bash
   cp .env.local.example .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

### Deploying to Vercel (Recommended)

The easiest way to deploy the Budget Travel Planner is to use Vercel:

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. From your project directory, run:
   ```bash
   vercel
   ```
4. Follow the prompts to link your project to Vercel.
5. Set up environment variables in the Vercel dashboard.

### Alternative Deployment Options

#### AWS Amplify

1. Create an AWS account if you don't have one
2. Install the AWS Amplify CLI:
   ```bash
   npm install -g @aws-amplify/cli
   amplify configure
   ```
3. Initialize Amplify in your project:
   ```bash
   amplify init
   ```
4. Deploy to Amplify:
   ```bash
   amplify publish
   ```

#### Netlify

1. Create a Netlify account
2. Create a `netlify.toml` file in your project root:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```
3. Deploy to Netlify:
   ```bash
   npx netlify-cli deploy --prod
   ```

## Environment Variables

The following environment variables are required:

- `OPENAI_API_KEY`: Your OpenAI API key for AI planning features
- `GOOGLE_MAPS_API_KEY`: Your Google Maps API key for maps features
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Same as above but exposed to the client

Optional environment variables:

- `SKYSCANNER_API_KEY`: For flight search (if using production Skyscanner API)
- `WEATHERAPI_KEY`: For weather forecasts (if using production Weather API)
- `BOOKING_API_KEY`: For accommodation search (if using a production booking API)

## API Rate Limiting

This application includes built-in rate limiting for API routes:

- Standard API routes: 60 requests per minute per IP
- AI API routes: 10 requests per minute per IP

These limits can be adjusted in `app/middleware.ts`.

## Caching Strategy

To optimize performance and reduce API calls:

- API responses are cached in memory with configurable TTL
- Weather and location data are cached for longer periods
- AI responses are cached where appropriate

Cache settings can be adjusted in `app/utils/apiCache.ts`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- OpenAI for their powerful AI models
- Google for their Maps API
- Next.js team for the amazing framework
- All the contributors who have helped with this project

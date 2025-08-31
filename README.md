# AI Calorie Counter

A comprehensive nutrition tracking application built with Next.js, Prisma, and NextAuth.js. Track your daily food intake, set calorie goals, and monitor your nutrition with an intuitive interface.

## Features

- 🔐 **Google Authentication** - Secure login with NextAuth.js
- 🔍 **Food Search** - Search through a comprehensive food database
- 🤖 **AI-Powered Food Search** - Use Gemini 2.0 Flash to find nutritional info for foods not in the database
- 📊 **Daily Tracking** - Log meals by type (breakfast, lunch, dinner, snacks)
- 🎯 **Calorie Goals** - Set and track daily calorie targets based on BMR/TDEE
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **AI**: Google Gemini 2.0 Flash API
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google OAuth credentials
- Google Gemini API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd ai-calorie-counter
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:

   ```env
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/ai_calorie_counter"

   # Gemini AI API Key
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   **To get a Gemini API key:**

   1. Go to [Google AI Studio](https://aistudio.google.com/)
   2. Sign in with your Google account
   3. Click "Get API key" and create a new API key
   4. Copy the key and paste it in your `.env.local` file

4. **Set up the database**

   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Import food data**

   ```bash
   npm run add-food
   ```

6. **Start the development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy the Client ID and Client Secret to your `.env.local`

## Usage

### Adding Foods

1. Click on the "Add Food" tab
2. Search for foods using the search bar
3. Click on a food item to open the add dialog
4. Specify quantity (in grams) and meal type
5. Click "Add Food" to log it

### AI-Powered Food Search

When a food isn't found in the database:

1. Search for any food item in the search bar
2. If no results are found, you'll see an "AI-powered search" option
3. Click "Search with AI" to use Gemini 2.0 Flash
4. The AI will generate nutritional information for the food
5. Review the AI-generated data and add it to your meal
6. The food will be automatically added to the database for future use

**Note**: AI-generated nutritional data is marked with a ⚡ symbol and should be used as an estimate.

### Viewing Daily Log

1. The "Today" tab shows your daily food intake
2. Foods are grouped by meal type
3. Click the trash icon to remove entries
4. View total calories consumed

### Setting Goals

1. Go to the "Goals" tab
2. Click "Update Profile & Goals"
3. Enter your age, weight, height, gender, and activity level
4. Choose your goal (lose/maintain/gain weight)
5. The app calculates your target calories using BMR and TDEE

## Database Schema

### User

- Personal information and authentication data
- Optional height, weight, age for calorie calculations

### Food

- Comprehensive nutrition information per 100g
- Calories, protein, carbs, fat, fiber, sugar, sodium

### UserDiet

- Links users to foods with quantity and meal type
- Tracks consumption date and time

## API Endpoints

### Foods

- `GET /api/food?q=search_term` - Search foods
- `PUT /api/food?id=food_id` - Update food information

### User Diets

- `GET /api/user-diets?date=YYYY-MM-DD` - Get daily food log
- `POST /api/user-diets` - Add food to log
- `DELETE /api/user-diets?id=entry_id` - Remove food entry

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [NextAuth.js](https://next-auth.js.org/) for authentication
- [Prisma](https://www.prisma.io/) for database management
- [Tailwind CSS](https://tailwindcss.com/) for styling


## Future Scope
- Monthly report with charts and insights
- Make the Home page server side rendered for better SEO and make a different page for dashboard
- Instead of tabs for Today, Add Food, Goals - create a navbar for navigation


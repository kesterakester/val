# Valentine's Day Proposal App 💖

A romantic, full-screen interactive web experience to ask that special someone to be your Valentine.

## Features
- 🌸 **Romantic Intro**: Personalized welcome with name capture.
- 💌 **Questions Flow**: 3 Playful questions to set the mood.
- ✨ **Poetic Message**: A beautiful generated message.
- 💍 **The Big Question**: "Will you be my Valentine?" with a tricker "No" button.
- 🎉 **Celebration**: Confetti and hearts on "Yes".
- 🕵️ **Silent Tracking**: Responses are saved to Supabase (Database).

## Setup Instructions

### 1. Supabase Setup
This app uses Supabase to store responses.
1. Create a new project at [Supabase](https://supabase.com).
2. Go to the **SQL Editor** and run the query found in `supabase/schema.sql`.
3. Go to **Project Settings -> API** and copy:
   - Project URL
   - `anon` public key

### 2. Environment Variables
Create a `.env.local` file in the root of the project:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy to Vercel
1. Push this code to GitHub.
2. Import project in Vercel.
3. Add the Environment Variables in Vercel Project Settings.
4. Deploy! 🚀

## Customization
- **Questions**: Edit `components/ValentineApp.tsx` lines 10-15.
- **Colors**: Edit `app/globals.css` or `tailwind.config.ts`.

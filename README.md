# ApplyFlow

A full-stack job application tracker built with React, TypeScript, and Supabase.

## Live Demo

https://applyflow-delta.vercel.app/

## About

ApplyFlow helps you manage your job search in one place. You can track applications across different stages, drag and drop cards between columns, save jobs to a wishlist before applying, and everything is tied to your account so your data is always there when you log in.

## Features

- Kanban board to track applications by status (Applied, Interview, Offer, Rejected)
- Drag and drop cards between columns
- Search and filter applications by company or position
- Track the date you applied for each job
- Wishlist to save jobs you want to apply to later, with expiry date warnings
- User authentication so each person sees only their own data
- Real database powered by Supabase

## Tech Stack

- React with TypeScript
- Vite
- Supabase (PostgreSQL database and authentication)
- React Router DOM
- @dnd-kit/core for drag and drop

## Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/applyflow.git
cd applyflow
npm install
```

Create a `.env` file in the root of the project:

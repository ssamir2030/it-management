# IT Management System

A comprehensive Full Stack IT Management System built with Next.js, Tailwind CSS, and Prisma.

## Features
- **Dashboard**: Overview of assets, tickets, and employees.
- **Inventory Management**: Track stock levels and procurement.
- **Asset Management**: Lifecycle tracking for hardware and software.
- **Helpdesk**: Support ticket system.
- **Employee Portal**: Self-service for requests.

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Initialize the database:
    ```bash
    npx prisma db push
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS, Shadcn/ui
- **Database**: SQLite (via Prisma)
- **Icons**: Lucide React

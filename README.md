# Research Opportunity Portal

## Project Overview
A full-stack web application for managing and displaying research opportunities for university students. Faculty members can create, update, and manage open positions, while students can view the available opportunities.

## Prerequisites
- Python 3.8+
- MySQL Server
- Web Browser (Chrome, Firefox, Safari)
- Git

## Database Setup
1. Open your MySQL client or terminal.
2. Execute the commands found in `database/schema.sql` to create the database, tables, and seed data:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   *(Ensure you update `.env` with your actual database credentials).*

## Backend Setup & Execution
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your database credentials:
   ```bash
   cp .env.example .env
   ```
5. Run the Flask server:
   ```bash
   python app.py
   ```
   The backend API will be available at `http://localhost:5000`.

## Frontend Execution
1. Navigate to the `frontend` directory.
2. The frontend is built with vanilla HTML/JS/CSS. You can run it by opening `index.html` directly in your browser.
3. For a better development experience, you can serve it via a simple HTTP server:
   ```bash
   npx serve .
   # OR
   python -m http.server 8000
   ```
   Then navigate to `http://localhost:8000` (or whichever port is provided).

## GitHub Repository
[GitHub Repository Link - Placeholder](https://github.com/placeholder-repo)

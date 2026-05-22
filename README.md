# ExpenseAI - Bank Statement Analyzer

A full stack web application that parses bank statement PDFs, categorizes transactions automatically, and shows spending insights with charts and budget alerts.


## Tech Stack

Frontend: React.js, Recharts, Axios
Backend: Node.js, Express.js, pdf-parse, Multer

## Features

- Upload any bank statement PDF
- Automatic transaction parsing using regex
- Smart categorization: Food, Travel, Shopping, Entertainment, Health, Utilities, Education
- Pie chart and bar chart for spending breakdown
- Budget alerts when a category exceeds 30% of total spending
- Transaction table with search and filter
- Demo mode without uploading any file

## Project Structure

expense-tracker/
  backend/
    src/
      index.js          - Express server entry point
      routes/upload.js  - PDF upload and parse API
      utils/parser.js   - PDF text extraction and transaction parsing
      utils/categorizer.js - Keyword-based transaction categorization
    package.json
  frontend/
    src/
      App.js            - Full React application with all components
      index.js          - React entry point
    package.json

## Setup and Run Locally

Step 1 - Clone the repository

git clone https://github.com/surajyadavcoder/expense-tracker-bank-analyzer
cd expense-tracker

Step 2 - Start Backend

cd backend
npm install
npm run dev

Backend runs on http://localhost:5000

Step 3 - Start Frontend

cd frontend
npm install
npm start

Frontend runs on http://localhost:3000

## API Endpoints

POST /api/upload - Upload PDF bank statement, returns parsed transactions and analysis
GET /api/demo   - Returns sample transaction data for demo

## Deployment

Frontend: Deploy the frontend folder to Vercel
Backend: Deploy the backend folder to Render or Railway

Set REACT_APP_API_URL in Vercel environment variables to your backend URL.

## Author

Suraj Yadav
LinkedIn: https://linkedin.com/in/iamsurajyadav
GitHub: https://github.com/surajyadavcoder

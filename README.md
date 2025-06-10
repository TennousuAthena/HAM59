# Project Summary
The project is an interactive practice platform designed for amateur radio enthusiasts, offering a comprehensive question bank to enhance knowledge and skills. It features various practice modes, progress tracking, and answer reviews within a modern web interface built with advanced web technologies.

# Project Module Description
The project consists of several functional modules:
- **Data Processing**: Manages the parsing and structuring of question bank files into JSON format.
- **User Interface**: Developed using React and Tailwind CSS, delivering a responsive design.
- **Question Bank Management**: Enables users to practice questions, track progress, log errors, and take notes.
- **Routing and State Management**: Employs React Router for navigation and state management across components.

# Directory Tree
```
.
├── code.ipynb                  # Jupyter notebook for data processing
├── processed_questions.json     # JSON file containing processed question data
├── react_template/              # React application files
│   ├── README.md                # Project documentation
│   ├── eslint.config.js         # ESLint configuration
│   ├── index.html               # Main HTML file
│   ├── package.json             # Project dependencies and scripts
│   ├── postcss.config.js        # PostCSS configuration
│   ├── public/data/             # Directory for public data files
│   │   ├── example.json         # Example data file
│   │   └── processed_questions.json # Processed question data
│   ├── src/                     # Source code directory
│   │   ├── App.jsx              # Main application component
│   │   ├── components/          # React components
│   │   │   ├── ErrorLog.jsx     # Component for tracking wrong answers
│   │   │   ├── Header.jsx        # Navigation header with updated functionality
│   │   │   ├── NotesSection.jsx  # Notes functionality
│   │   │   ├── ProgressBar.jsx   # Progress indicator
│   │   │   ├── QuestionBank.jsx   # Core question display component
│   │   │   ├── QuestionCard.jsx   # Individual question component
│   │   │   ├── ResultsModal.jsx   # Modal for displaying results
│   │   ├── index.css            # CSS styles
│   │   ├── main.jsx             # Entry point for the React application
│   │   └── utils/utils.js       # Utility functions
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   └── vite.config.js           # Vite configuration
└── uploads/                     # Directory for uploaded files
    └── TXT题库包(v20211022)/  # Question bank files
        ├── A类题库(v20211022).txt
        ├── B类题库(v20211022).txt
        ├── C类题库(v20211022).txt
        └── 总题库(v20211022).txt
```

# File Description Inventory
- **code.ipynb**: Jupyter notebook for data processing and analysis of question bank files.
- **processed_questions.json**: JSON file containing structured question data after processing.
- **react_template/**: Contains all files related to the React application for the practice platform.

# Technology Stack
- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js (for development server)
- **Data Handling**: JSON for question data structure
- **Build Tool**: Vite

# Usage
1. **Install Dependencies**:
   ```bash
   pnpm install
   ```
2. **Build the Project**:
   ```bash
   pnpm run build
   ```
3. **Run the Application**:
   ```bash
   pnpm run dev
   ```

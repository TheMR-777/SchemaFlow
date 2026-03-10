# SchemaFlow 🌊

**SchemaFlow** is a modern, interactive visual SQL schema explorer and query builder. It allows developers and data architects to transform raw SQL dumps into dynamic, draggable diagrams, enabling intuitive query construction through a visual interface.

![SchemaFlow Interface](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## ✨ Features

-   **Visual Schema Mapping**: Import your SQL `CREATE TABLE` dumps and instantly visualize your database structure.
-   **Interactive Canvas**: Powered by [React Flow](https://reactflow.dev/), featuring draggable nodes, zoomable workspace, and smooth transitions.
-   **Smart SQL Parsing**: Automatically detects table relationships, primary keys, and foreign keys (with built-in heuristics for implicit relations).
-   **Drag-and-Drop Query Building**: Link tables visually to define joins and select columns to generate complex SQL queries in real-time.
-   **Live Query Preview**: See your SQL query being built as you interact with the canvas, formatted and ready to copy.
-   **Modern Dark UI**: A sleek, high-performance interface built with Tailwind CSS and Framer Motion.

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or higher recommended)
-   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/TheMR-777/SchemaFlow.git
    cd SchemaFlow
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

4.  **Open your browser:**
    Navigate to `http://localhost:3000` to start building.

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript
-   **State Management**: Zustand
-   **Visualization**: @xyflow/react (React Flow)
-   **Styling**: Tailwind CSS 4
-   **Animations**: Framer Motion
-   **Icons**: Lucide React
-   **SQL Formatting**: sql-formatter

## 📖 Usage

1.  **Import**: Paste your SQL DDL (Data Definition Language) into the sidebar.
2.  **Visualize**: Drag tables from the sidebar onto the canvas.
3.  **Connect**: Draw lines between table columns to create `JOIN` relationships.
4.  **Select**: Click on column names within the table nodes to include them in your `SELECT` statement.
5.  **Export**: Copy the generated SQL from the bottom panel.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request if you have ideas for improvements or new features.

---

Built with ❤️ by [TheMR-777](https://github.com/TheMR-777)

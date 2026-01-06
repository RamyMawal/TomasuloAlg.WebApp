# Tomasulo Algorithm Simulator - Setup Guide

This guide will walk you through setting up and running the Tomasulo Algorithm Simulator on Windows.

## Prerequisites

### 1. Install Node.js

Node.js includes npm (Node Package Manager) which is required to install dependencies and run the project.

1. Go to the official Node.js website: https://nodejs.org/
2. Download the **LTS (Long Term Support)** version for Windows
3. Run the downloaded installer (`.msi` file)
4. Follow the installation wizard:
   - Accept the license agreement
   - Keep the default installation path
   - **Important**: Make sure "Add to PATH" is checked
   - Click "Install"
5. Restart your computer (recommended)

### 2. Verify Installation

Open **Command Prompt** or **PowerShell** and run:

```bash
node --version
```

You should see something like `v20.x.x` or `v22.x.x`

Then verify npm:

```bash
npm --version
```

You should see something like `10.x.x`

If both commands show version numbers, you're ready to proceed.

---

## Project Setup

### 1. Navigate to the Project Folder

Open **Command Prompt** or **PowerShell** and navigate to the project directory:

```bash
cd path\to\tomasulo-web-app
```

For example, if the project is on your Desktop:

```bash
cd C:\Users\YourUsername\Desktop\tomasulo-web-app
```

### 2. Install Dependencies

Run the following command to install all required packages:

```bash
npm install
```

This will:
- Read the `package.json` file
- Download all required libraries (React, TypeScript, Tailwind CSS, etc.)
- Create a `node_modules` folder with all dependencies

This may take 1-2 minutes depending on your internet connection.

---

## Running the Project

### Start the Development Server

```bash
npm run dev
```

You should see output similar to:

```
VITE v6.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Open in Browser

Open your web browser and go to:

```
http://localhost:5173/
```

The Tomasulo Algorithm Simulator should now be running!

### Stop the Server

To stop the development server, press `Ctrl + C` in the terminal.

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |

---

## Troubleshooting

### "npm is not recognized as a command"

- Node.js was not added to PATH during installation
- Solution: Reinstall Node.js and ensure "Add to PATH" is checked, then restart your computer

### "EACCES permission denied"

- Run Command Prompt or PowerShell as Administrator

### Port 5173 is already in use

- Another application is using that port
- Solution: Close the other application, or the dev server will automatically try the next available port (5174, 5175, etc.)

### Dependencies failed to install

- Check your internet connection
- Try running `npm cache clean --force` then `npm install` again

---

## Project Structure

```
tomasulo-web-app/
├── src/                  # Source code
│   ├── components/       # React UI components
│   ├── context/          # State management
│   ├── core/             # Tomasulo algorithm logic
│   └── types/            # TypeScript type definitions
├── package.json          # Project dependencies
├── index.html            # Entry HTML file
└── vite.config.ts        # Build configuration
```

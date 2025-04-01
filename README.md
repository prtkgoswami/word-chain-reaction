# Word Chain Reaction

A multiplayer word game where players take turns creating a chain of words, with each word starting with the last letter of the previous word. Built with React, TypeScript, and Firebase.

## Features

- Real-time multiplayer gameplay
- Room-based game sessions
- Score tracking
- Word validation
- Beautiful and responsive UI
- Game rules and instructions

## Tech Stack

- React
- TypeScript
- Firebase Realtime Database
- Styled Components

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/prtkgoswami/word-chain-reaction.git
cd word-chain-reaction
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project and enable Realtime Database

4. Create a `.env` file in the root directory with your Firebase configuration:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_DATABASE_URL=your_database_url
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

5. Start the development server:
```bash
npm start
```

## How to Play

1. Create a room or join an existing room using a room code
2. Wait for all players to join
3. Host starts the game
4. Players take turns entering words that:
   - Start with the last letter of the previous word
   - Haven't been used before
   - Contain only letters (no numbers or special characters)
5. Score points based on:
   - Word length
   - Chain length
   - Circle bonus (if the word connects back to the first word)
6. Game ends when:
   - A circle is formed (3+ words)
   - Chain reaches 10 words
   - A player can't think of a valid word

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
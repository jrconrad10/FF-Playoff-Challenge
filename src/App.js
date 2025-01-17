import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

// Hardcoded usernames
const USERS = ['user1', 'user2', 'user3'];

// List of NFL players (can be expanded)
const PLAYERS = [
  'Patrick Mahomes',
  'Aaron Rodgers',
  'Tom Brady',
  'Josh Allen',
  'Davante Adams',
  'Travis Kelce',
];

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [playerSelections, setPlayerSelections] = useState({});

  // Initialize player selections for all users
  React.useEffect(() => {
    const initialSelections = USERS.reduce((acc, user) => {
      acc[user] = [];
      return acc;
    }, {});
    setPlayerSelections(initialSelections);
  }, []);

  const handleLogin = (username) => {
    setCurrentUser(username);
  };

  const handlePlayerSelect = (player) => {
    if (currentUser) {
      setPlayerSelections((prevSelections) => {
        const updatedSelections = { ...prevSelections };
        updatedSelections[currentUser] = [...updatedSelections[currentUser], player];
        return updatedSelections;
      });
    }
  };

  const getAvailablePlayers = () => {
    const selectedPlayers = Object.values(playerSelections).flat();
    return PLAYERS.filter((player) => !selectedPlayers.includes(player));
  };

  return (
    <div style={{ padding: '20px' }}>
      {!currentUser ? (
        <div>
          <h1>Login</h1>
          <ul>
            {USERS.map((user) => (
              <li key={user}>
                <button onClick={() => handleLogin(user)}>Login as {user}</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h1>Welcome, {currentUser}!</h1>
          <button onClick={() => setCurrentUser(null)}>Logout</button>

          <h2>Select a Player</h2>
          <select onChange={(e) => handlePlayerSelect(e.target.value)} defaultValue="">
            <option value="" disabled>
              Select a player
            </option>
            {getAvailablePlayers().map((player) => (
              <option key={player} value={player}>
                {player}
              </option>
            ))}
          </select>

          <h3>Your Selected Players:</h3>
          <ul>
            {playerSelections[currentUser].map((player, index) => (
              <li key={index}>{player}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

export default App;
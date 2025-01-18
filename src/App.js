import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// Hardcoded usernames for simplicity
const USERS = ['Carson', 'Jack', 'Rishank', 'Jake'];

// Player positions required
const REQUIRED_POSITIONS = {
  QB: 1,
  RB: 2,
  WR: 2,
  TE: 1,
  FLEX: 1,
  'D/ST': 1,
  K: 1,
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [playerSelections, setPlayerSelections] = useState({
    QB: null,
    RB: [],
    WR: [],
    TE: null,
    FLEX: null,
    'D/ST': null,
    K: null,
  });

  // Fetch players.json and initialize available players
  useEffect(() => {
    fetch('/players.json') // Ensure players.json is in the public folder
      .then((response) => response.json())
      .then((data) => {
        const allPlayers = Object.values(data)
          .flat()
          .map((player) => ({ ...player, label: `${player.position}: ${player.name}` }));
        setAvailablePlayers(allPlayers);
        setFilteredPlayers(allPlayers);
      });
  }, []);

  // Filter players based on search query
  useEffect(() => {
    setFilteredPlayers(
      availablePlayers.filter((player) =>
        player.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, availablePlayers]);

  const handleLogin = (username) => {
    setCurrentUser(username);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handlePlayerSelect = (player) => {
    const newSelections = { ...playerSelections };
    const { position } = player;

    // Prevent overwriting QB selection
    if (position === 'QB' && newSelections.QB !== null) {
      return; // Do nothing if QB is already selected
    }

    // Handle selection for each position, making sure the count doesn't exceed the required number
    if (position === 'RB' || position === 'WR' || position === 'TE') {
      const positionCount = REQUIRED_POSITIONS[position];

      // If the position (RB/WR/TE) is already full, assign to FLEX or discard selection
      if (newSelections[position] === null) newSelections[position] = player;
      else if (newSelections[position].length < positionCount) {
        newSelections[position].push(player);
      } else {
        // If FLEX is full, discard the selection
        if (newSelections['FLEX'] === null) {
          newSelections['FLEX'] = player;
        } else {
          return
        }
      }
    } else {
      // Handle for other positions (D/ST, K)
      if(newSelections[position] === null) newSelections[position] = player;
      else return
    }

    // Remove selected player from available players
    setPlayerSelections(newSelections);
    setAvailablePlayers((prevPlayers) =>
      prevPlayers.filter((p) => p.label !== player.label)
    );
  };

  // Remove selected player and add them back to available players
  const handleRemovePlayer = (player, position) => {
    const newSelections = { ...playerSelections };
    const updatedAvailablePlayers = [...availablePlayers, player];
  
    // If position is an array (e.g., RB, WR), filter out the player from the array
    if (Array.isArray(newSelections[position])) {
      newSelections[position] = newSelections[position].filter((p) => p.label !== player.label);
    } else {
      // For positions like QB, TE, D/ST, or K, set the position to null
      newSelections[position] = null;
    }
  
    setPlayerSelections(newSelections);
    setAvailablePlayers(updatedAvailablePlayers);
  };

  const renderSelectedPlayers = () => {
    return Object.keys(REQUIRED_POSITIONS).map((position) => {
      const selected = playerSelections[position];
      if (REQUIRED_POSITIONS[position] > 1) {
        return (
          <div key={position}>
            <h4>{position}:</h4>
            {selected.length === 0
              ? 'Not selected'
              : selected.map((player, idx) => (
                  <div key={idx}>
                    {player.label}
                    <button onClick={() => handleRemovePlayer(player, position)}>Remove</button>
                  </div>
                ))}
          </div>
        );
      } else {
        return (
          <div key={position}>
            <h4>{position}:</h4>
            {selected ? (
              <>
                {selected.label}
                <button onClick={() => handleRemovePlayer(selected, position)}>Remove</button>
              </>
            ) : (
              'Not selected'
            )}
          </div>
        );
      }
    });
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

          <h2>Search and Select Players</h2>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for players..."
            style={{ marginBottom: '10px', padding: '5px' }}
          />

          <div>
            <h3>Available Players:</h3>
            {filteredPlayers.length === 0 ? (
              <p>No players found</p>
            ) : (
              <ul>
                {filteredPlayers.map((player) => (
                  <li key={player.label}>
                    <button onClick={() => handlePlayerSelect(player)}>
                      Select {player.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <h2>Your Selected Players</h2>
          {renderSelectedPlayers()}
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

export default App;

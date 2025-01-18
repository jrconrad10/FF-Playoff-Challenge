import requests
from bs4 import BeautifulSoup
import json

playoff_teams = {
    "Teams": [
        {
            "Team": "Baltimore Ravens",
            "Abbreviation": "bal"
        },
        {
            "Team": "Buffalo Bills",
            "Abbreviation": "buf"
        },
        {
            "Team": "Kansas City Chiefs",
            "Abbreviation": "kc"
        },
        {
            "Team": "Houston Texans",
            "Abbreviation": "hou"
        },
        {
            "Team": "Detroit Lions",
            "Abbreviation": "det"
        },
        {
            "Team": "Washington Commanders",
            "Abbreviation": "was"
        },
        {
            "Team": "Los Angeles Rams",
            "Abbreviation": "lar"
        },
        {
            "Team": "Philadelphia Eagles",
            "Abbreviation": "phi"
        }
    ]
}

# Example structure for storing player data
team_players = {}

for team in playoff_teams['Teams']:
    # URL for the team's depth chart
    url = f'https://www.ourlads.com/nfldepthcharts/depthchart/{team["Abbreviation"].upper()}'
    response = requests.get(url)

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")

        # Define the positions to scrape
        positions_to_scrape = {"QB", "RB", "FB", "LWR", "SWR", "RWR", "TE", "PK"}

        # Locate the table containing the depth chart
        table = soup.find("table", class_="table table-bordered")

        if table:
            team_players[team["Team"]] = []  # Initialize the team player list
            team_players[team["Team"]].append({
                                    "position": "D/ST",
                                    "name": team["Team"]
                                })
            for row in table.find_all("tr"):
                cells = row.find_all("td")
                if len(cells) > 0:
                    position = cells[0].text.strip()
                    if position in positions_to_scrape:
                        for i in range(2, len(cells), 2):  # Player names
                            player_name = cells[i].get_text(strip=True)
                            last_space_index = player_name.rfind(' ')
                            player_name = player_name[:last_space_index].title()
                            if player_name:
                                if position in {"LWR", "SWR", "RWR"}:
                                    position = "WR"
                                if position == "PK":
                                    position = "K"
                                team_players[team["Team"]].append({
                                    "position": position,
                                    "name": player_name
                                })

# Save the data to a JSON file
with open("../public/players.json", "w", encoding="utf-8") as f:
    json.dump(team_players, f, indent=4)

print("Player data saved to players.json!")
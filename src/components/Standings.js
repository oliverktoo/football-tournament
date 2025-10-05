import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export default function Standings() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTournaments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('name');
      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  }, []);

  const calculateStandings = useCallback(async () => {
    if (!selectedTournament) return;
    
    setLoading(true);
    try {
      // Get all completed matches for selected tournament
      const { data: matches, error } = await supabase
        .from('matches')
        .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
        .eq('tournament_id', selectedTournament)
        .eq('status', 'completed');

      if (error) throw error;

      // Get teams in this tournament
      const { data: tournamentTeams } = await supabase
        .from('tournament_teams')
        .select('team_id, teams(*)')
        .eq('tournament_id', selectedTournament);

      const teamStats = {};

      // Initialize all teams
      tournamentTeams.forEach(({ team_id, teams }) => {
        teamStats[team_id] = {
          team: teams,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0
        };
      });

      // Calculate stats from matches
      matches.forEach(match => {
        const homeId = match.home_team_id;
        const awayId = match.away_team_id;
        const homeScore = match.home_score || 0;
        const awayScore = match.away_score || 0;

        // Update home team stats
        teamStats[homeId].played++;
        teamStats[homeId].goalsFor += homeScore;
        teamStats[homeId].goalsAgainst += awayScore;

        // Update away team stats
        teamStats[awayId].played++;
        teamStats[awayId].goalsFor += awayScore;
        teamStats[awayId].goalsAgainst += homeScore;

        // Determine result
        if (homeScore > awayScore) {
          teamStats[homeId].wins++;
          teamStats[homeId].points += 3;
          teamStats[awayId].losses++;
        } else if (awayScore > homeScore) {
          teamStats[awayId].wins++;
          teamStats[awayId].points += 3;
          teamStats[homeId].losses++;
        } else {
          teamStats[homeId].draws++;
          teamStats[awayId].draws++;
          teamStats[homeId].points += 1;
          teamStats[awayId].points += 1;
        }
      });

      // Convert to array and sort by points, then goal difference
      const standingsArray = Object.values(teamStats).map(team => ({
        ...team,
        goalDifference: team.goalsFor - team.goalsAgainst
      })).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.goalDifference - a.goalDifference;
      });

      setStandings(standingsArray);
    } catch (error) {
      console.error('Error calculating standings:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTournament]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  useEffect(() => {
    calculateStandings();
  }, [calculateStandings]);

  const getSelectedTournamentName = () => {
    const tournament = tournaments.find(t => t.id === selectedTournament);
    return tournament ? tournament.name : '';
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <h3>Tournament Standings</h3>
      
      {/* Tournament Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label>Select Tournament: </label>
        <select
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(e.target.value)}
          style={{ width: '300px', padding: '10px', marginLeft: '10px' }}
        >
          <option value="">Choose a tournament</option>
          {tournaments.map(tournament => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Calculating standings...</p>}

      {selectedTournament && standings.length > 0 && (
        <div>
          <h4>Standings for {getSelectedTournamentName()}</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
              <thead>
                <tr style={{ background: '#3498db', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Pos</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Team</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>MP</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>W</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>D</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>L</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>GF</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>GA</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>GD</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team, index) => (
                  <tr key={team.team.id} style={{ background: index < 3 ? '#e8f6ef' : 'white' }}>
                    <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                      {team.team.name}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {team.played}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center', color: '#2ecc71' }}>
                      {team.wins}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center', color: '#f39c12' }}>
                      {team.draws}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center', color: '#e74c3c' }}>
                      {team.losses}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {team.goalsFor}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {team.goalsAgainst}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', color: team.goalDifference > 0 ? '#2ecc71' : team.goalDifference < 0 ? '#e74c3c' : '#666' }}>
                      {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', background: '#2c3e50', color: 'white' }}>
                      {team.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Legend */}
          <div style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '5px', fontSize: '14px' }}>
            <strong>Legend:</strong> 
            <span style={{ color: '#2ecc71', marginLeft: '10px' }}>¦ Wins</span>
            <span style={{ color: '#f39c12', marginLeft: '10px' }}>¦ Draws</span>
            <span style={{ color: '#e74c3c', marginLeft: '10px' }}>¦ Losses</span>
            <span style={{ background: '#e8f6ef', marginLeft: '10px', padding: '2px 5px' }}>Top 3 Teams</span>
          </div>
        </div>
      )}

      {selectedTournament && standings.length === 0 && !loading && (
        <div style={{ padding: '20px', textAlign: 'center', background: '#fff3cd', borderRadius: '5px' }}>
          <p>No completed matches found for {getSelectedTournamentName()}.</p>
          <p>Update match scores in the Scores tab to generate standings.</p>
        </div>
      )}
    </div>
  );
}

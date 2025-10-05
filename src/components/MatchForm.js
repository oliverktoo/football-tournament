import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function MatchForm({ onMatchCreated }) {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [tournamentTeams, setTournamentTeams] = useState([]);
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [venue, setVenue] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchTournamentTeams();
    } else {
      setTournamentTeams([]);
    }
  }, [selectedTournament]);

  const fetchTournaments = async () => {
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
  };

  const fetchTournamentTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_teams')
        .select('team_id, teams(*)')
        .eq('tournament_id', selectedTournament);

      if (error) throw error;
      
      const teams = data ? data.map(item => item.teams) : [];
      setTournamentTeams(teams);
      
      // Reset team selections when tournament changes
      setHomeTeam('');
      setAwayTeam('');
    } catch (error) {
      console.error('Error fetching tournament teams:', error);
      setTournamentTeams([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTournament) {
      setMessage('Please select a tournament first');
      return;
    }

    if (!homeTeam || !awayTeam) {
      setMessage('Please select both home and away teams');
      return;
    }

    if (homeTeam === awayTeam) {
      setMessage('Home and away teams cannot be the same');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase
        .from('matches')
        .insert([
          { 
            tournament_id: selectedTournament,
            home_team_id: homeTeam,
            away_team_id: awayTeam,
            match_date: matchDate,
            match_time: matchTime,
            venue: venue,
            status: 'scheduled'
          }
        ])
        .select();

      if (error) throw error;

      setMessage('Match scheduled successfully!');
      // Reset form
      setSelectedTournament('');
      setHomeTeam('');
      setAwayTeam('');
      setMatchDate('');
      setMatchTime('');
      setVenue('');
      
      if (onMatchCreated) {
        onMatchCreated();
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedTournamentName = () => {
    const tournament = tournaments.find(t => t.id === selectedTournament);
    return tournament ? tournament.name : '';
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '10px', marginBottom: '20px' }}>
      <h3>Schedule Match</h3>
      <form onSubmit={handleSubmit}>
        {/* Tournament Selection */}
        <div style={{ marginBottom: '15px' }}>
          <label>Tournament: </label>
          <select
            value={selectedTournament}
            onChange={(e) => setSelectedTournament(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          >
            <option value="">Select Tournament</option>
            {tournaments.map(tournament => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
        </div>

        {selectedTournament && (
          <>
            {/* Team Selection - Only shows teams in selected tournament */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label>Home Team: </label>
                <select
                  value={homeTeam}
                  onChange={(e) => setHomeTeam(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                >
                  <option value="">Select Home Team</option>
                  {tournamentTeams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Away Team: </label>
                <select
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                >
                  <option value="">Select Away Team</option>
                  {tournamentTeams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Match Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label>Match Date: </label>
                <input
                  type="date"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                />
              </div>
              <div>
                <label>Match Time: </label>
                <input
                  type="time"
                  value={matchTime}
                  onChange={(e) => setMatchTime(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Venue: </label>
              <input
                type="text"
                placeholder="Match venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                style={{ width: '100%', padding: '10px', marginTop: '5px' }}
              />
            </div>

            {/* Tournament Info */}
            <div style={{ 
              background: '#e8f4fc', 
              padding: '10px', 
              borderRadius: '5px', 
              marginBottom: '15px',
              fontSize: '14px'
            }}>
              <strong>Tournament:</strong> {getSelectedTournamentName()} 
              <br />
              <strong>Available Teams:</strong> {tournamentTeams.length} teams
            </div>
          </>
        )}

        <button 
          type="submit" 
          disabled={loading || !selectedTournament}
          style={{ 
            width: '100%', 
            padding: '10px', 
            background: loading || !selectedTournament ? '#ccc' : '#3498db', 
            color: 'white', 
            border: 'none',
            borderRadius: '5px'
          }}
        >
          {loading ? 'Scheduling...' : 'Schedule Match'}
        </button>
      </form>

      {message && (
        <p style={{ 
          color: message.includes('success') ? 'green' : 'red', 
          marginTop: '10px',
          padding: '10px',
          background: message.includes('success') ? '#e8f6ef' : '#fde8e8',
          borderRadius: '5px'
        }}>
          {message}
        </p>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export default function TournamentTeams({ onTeamAdded }) {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [availableTeams, setAvailableTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch tournaments
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

  // Fetch available teams (not yet in the tournament)
  const fetchAvailableTeams = useCallback(async () => {
    if (!selectedTournament) {
      setAvailableTeams([]);
      return;
    }

    try {
      // Get all teams
      const { data: allTeams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (teamsError) throw teamsError;

      // Get teams already in this tournament
      const { data: tournamentTeams, error: tournamentError } = await supabase
        .from('tournament_teams')
        .select('team_id')
        .eq('tournament_id', selectedTournament);

      if (tournamentError) throw tournamentError;

      const existingTeamIds = new Set(tournamentTeams.map(item => item.team_id));
      
      // Filter out teams already in the tournament
      const available = allTeams.filter(team => !existingTeamIds.has(team.id));
      
      setAvailableTeams(available);
      setSelectedTeams([]);
    } catch (error) {
      console.error('Error fetching available teams:', error);
      setAvailableTeams([]);
    }
  }, [selectedTournament]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  useEffect(() => {
    fetchAvailableTeams();
  }, [fetchAvailableTeams]);

  const handleTeamToggle = (teamId) => {
    setSelectedTeams(prev => 
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTournament) {
      setMessage('Please select a tournament first');
      return;
    }

    if (selectedTeams.length === 0) {
      setMessage('Please select at least one team');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Add selected teams to tournament
      const tournamentTeamsData = selectedTeams.map(teamId => ({
        tournament_id: selectedTournament,
        team_id: teamId
      }));

      const { error } = await supabase
        .from('tournament_teams')
        .insert(tournamentTeamsData);

      if (error) throw error;

      setMessage(selectedTeams.length + ' team(s) added to tournament successfully!');
      setSelectedTeams([]);
      
      // Refresh available teams
      fetchAvailableTeams();
      
      if (onTeamAdded) {
        onTeamAdded();
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
      <h3>Add Teams to Tournament</h3>
      <form onSubmit={handleSubmit}>
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
            <div style={{ marginBottom: '15px' }}>
              <label>Available Teams: </label>
              <div style={{ 
                border: '1px solid #ddd', 
                borderRadius: '5px', 
                padding: '10px', 
                maxHeight: '200px', 
                overflowY: 'auto',
                marginTop: '5px'
              }}>
                {availableTeams.length > 0 ? (
                  availableTeams.map(team => (
                    <div key={team.id} style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedTeams.includes(team.id)}
                          onChange={() => handleTeamToggle(team.id)}
                          style={{ marginRight: '10px' }}
                        />
                        {team.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>
                    No available teams to add. All teams are already in this tournament.
                  </p>
                )}
              </div>
            </div>

            <div style={{ 
              background: '#e8f4fc', 
              padding: '10px', 
              borderRadius: '5px', 
              marginBottom: '15px',
              fontSize: '14px'
            }}>
              <strong>Tournament:</strong> {getSelectedTournamentName()} 
              <br />
              <strong>Available Teams:</strong> {availableTeams.length}
              <br />
              <strong>Selected Teams:</strong> {selectedTeams.length}
            </div>
          </>
        )}

        <button 
          type="submit" 
          disabled={loading || !selectedTournament || selectedTeams.length === 0}
          style={{ 
            width: '100%', 
            padding: '10px', 
            background: loading || !selectedTournament || selectedTeams.length === 0 ? '#ccc' : '#3498db', 
            color: 'white', 
            border: 'none',
            borderRadius: '5px'
          }}
        >
          {loading ? 'Adding Teams...' : 'Add Selected Teams to Tournament'}
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

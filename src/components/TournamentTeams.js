import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export default function TournamentTeams({ onTeamsAssigned }) {
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTournaments();
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchTournamentTeams();
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

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchTournamentTeams = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_teams')
        .select('team_id')
        .eq('tournament_id', selectedTournament);

      if (error) throw error;
      
      const teamIds = data ? data.map(item => item.team_id) : [];
      setSelectedTeams(teamIds);
    } catch (error) {
      console.error('Error fetching tournament teams:', error);
      setSelectedTeams([]);
    }
  };

  const handleTeamToggle = (teamId) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleAssignTeams = async () => {
    if (!selectedTournament) {
      setMessage('Please select a tournament first');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // First, remove all existing team assignments for this tournament
      const { error: deleteError } = await supabase
        .from('tournament_teams')
        .delete()
        .eq('tournament_id', selectedTournament);

      if (deleteError) {
        // If delete fails due to RLS, try to continue (might be no records)
        console.warn('Delete operation failed, continuing...');
      }

      // Then add the selected teams
      if (selectedTeams.length > 0) {
        const assignments = selectedTeams.map(teamId => ({
          tournament_id: selectedTournament,
          team_id: teamId
        }));

        const { error: insertError } = await supabase
          .from('tournament_teams')
          .insert(assignments);

        if (insertError) {
          if (insertError.message.includes('row-level security policy')) {
            setMessage('Permission denied. Please check database policies or contact administrator.');
          } else {
            throw insertError;
          }
        } else {
          setMessage('Teams assigned successfully!');
          // Refresh the view
          if (onTeamsAssigned) {
            onTeamsAssigned();
          }
        }
      } else {
        setMessage('No teams selected. All teams removed from tournament.');
        // Refresh the view
        if (onTeamsAssigned) {
          onTeamsAssigned();
        }
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
      <h3>Assign Teams to Tournament</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Select Tournament: </label>
        <select
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(e.target.value)}
          style={{ width: '100%', padding: '10px', marginTop: '5px' }}
        >
          <option value="">Choose a tournament</option>
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
            <h4>Select Teams for {getSelectedTournamentName()}:</h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px' }}>
              {teams.map(team => (
                <div key={team.id} style={{ marginBottom: '10px' }}>
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
              ))}
            </div>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              Selected: {selectedTeams.length} teams
            </p>
          </div>

          <button 
            onClick={handleAssignTeams}
            disabled={loading}
            style={{ width: '100%', padding: '10px', background: '#2ecc71', color: 'white', border: 'none' }}
          >
            {loading ? 'Assigning...' : 'Assign Selected Teams'}
          </button>
        </>
      )}

      {message && (
        <p style={{ 
          color: message.includes('success') ? 'green' : message.includes('denied') ? 'orange' : 'red', 
          marginTop: '10px',
          padding: '10px',
          background: message.includes('success') ? '#e8f6ef' : message.includes('denied') ? '#fff3cd' : '#fde8e8',
          borderRadius: '5px'
        }}>
          {message}
        </p>
      )}
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ScoreUpdate() {
  const [matches, setMatches] = useState([]);
  const [editingMatch, setEditingMatch] = useState(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*, tournaments(name), home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)')
        .order('match_date', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const startEditing = (match) => {
    setEditingMatch(match.id);
    setHomeScore(match.home_score || 0);
    setAwayScore(match.away_score || 0);
  };

  const cancelEditing = () => {
    setEditingMatch(null);
    setHomeScore('');
    setAwayScore('');
  };

  const updateScore = async (matchId) => {
    if (homeScore === '' || awayScore === '') {
      setMessage('Please enter both scores');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('matches')
        .update({
          home_score: parseInt(homeScore),
          away_score: parseInt(awayScore),
          status: 'completed'
        })
        .eq('id', matchId);

      if (error) throw error;

      setMessage('Score updated successfully!');
      setEditingMatch(null);
      fetchMatches();
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <h3>Update Match Scores</h3>
      {matches.length === 0 ? (
        <p>No matches found. Schedule matches first.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {matches.map((match) => (
            <div key={match.id} style={{ 
              border: '1px solid #ddd', 
              padding: '15px', 
              borderRadius: '10px',
              background: match.status === 'completed' ? '#e8f6ef' : 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px 0' }}>
                    {match.home_team?.name} vs {match.away_team?.name}
                  </h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    ?? {match.tournaments?.name} • {match.match_date && new Date(match.match_date).toLocaleDateString()}
                  </p>
                </div>
                
                {editingMatch === match.id ? (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={homeScore}
                      onChange={(e) => setHomeScore(e.target.value)}
                      style={{ width: '50px', padding: '5px' }}
                    />
                    <span> - </span>
                    <input
                      type="number"
                      value={awayScore}
                      onChange={(e) => setAwayScore(e.target.value)}
                      style={{ width: '50px', padding: '5px' }}
                    />
                    <button 
                      onClick={() => updateScore(match.id)}
                      disabled={loading}
                      style={{ padding: '5px 10px', background: '#2ecc71', color: 'white', border: 'none' }}
                    >
                      Save
                    </button>
                    <button 
                      onClick={cancelEditing}
                      style={{ padding: '5px 10px', background: '#95a5a6', color: 'white', border: 'none' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      {match.home_score ?? 0} - {match.away_score ?? 0}
                    </div>
                    <button 
                      onClick={() => startEditing(match)}
                      style={{ padding: '5px 10px', background: '#3498db', color: 'white', border: 'none' }}
                    >
                      Update
                    </button>
                  </div>
                )}
              </div>
              <div style={{ 
                display: 'inline-block',
                background: match.status === 'completed' ? '#2ecc71' : '#f39c12',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '12px',
                marginTop: '10px'
              }}>
                {match.status?.toUpperCase() || 'SCHEDULED'}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {message && (
        <div style={{ 
          color: message.includes('success') ? 'green' : 'red',
          padding: '10px',
          background: message.includes('success') ? '#e8f6ef' : '#fde8e8',
          borderRadius: '5px',
          marginTop: '10px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

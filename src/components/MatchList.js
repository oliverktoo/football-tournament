import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function MatchList() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*, tournaments(name), home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)')
        .order('match_date', { ascending: true })
        .order('match_time', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'TBD';
    return timeString.substring(0, 5);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#f39c12';
      case 'live': return '#e74c3c';
      case 'completed': return '#2ecc71';
      case 'cancelled': return '#95a5a6';
      default: return '#3498db';
    }
  };

  if (loading) return <div>Loading matches...</div>;

  return (
    <div style={{ margin: '20px 0' }}>
      <h3>Scheduled Matches ({matches.length})</h3>
      {matches.length === 0 ? (
        <p>No matches scheduled yet. Schedule your first match!</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {matches.map((match) => (
            <div 
              key={match.id}
              style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                borderRadius: '10px',
                background: 'white'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
                    {match.home_team?.name} vs {match.away_team?.name}
                  </h4>
                  <p style={{ margin: '0', color: '#7f8c8d', fontSize: '14px' }}>
                    ?? {match.tournaments?.name}
                  </p>
                </div>
                <div style={{ 
                  background: getStatusColor(match.status),
                  color: 'white',
                  padding: '3px 10px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {match.status?.toUpperCase()}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '14px', color: '#666' }}>
                <div>
                  <strong>?? Date:</strong> {formatDate(match.match_date)}
                </div>
                <div>
                  <strong>? Time:</strong> {formatTime(match.match_time)}
                </div>
                <div>
                  <strong>??? Venue:</strong> {match.venue || 'TBD'}
                </div>
                <div>
                  <strong>? Score:</strong> {match.home_score} - {match.away_score}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

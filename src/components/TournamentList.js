import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function TournamentList() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) return <div>Loading tournaments...</div>;

  return (
    <div style={{ margin: '20px 0' }}>
      <h3>Your Tournaments ({tournaments.length})</h3>
      {tournaments.length === 0 ? (
        <p>No tournaments created yet. Create your first tournament!</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {tournaments.map((tournament) => (
            <div 
              key={tournament.id}
              style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                borderRadius: '8px',
                background: '#f9f9f9'
              }}
            >
              <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                ?? {tournament.name}
              </h4>
              {tournament.description && (
                <p style={{ margin: '5px 0', color: '#7f8c8d' }}>
                  {tournament.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#666' }}>
                <div>
                  <strong>Start:</strong> {formatDate(tournament.start_date)}
                </div>
                <div>
                  <strong>End:</strong> {formatDate(tournament.end_date)}
                </div>
                <div>
                  <strong>Created:</strong> {formatDate(tournament.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

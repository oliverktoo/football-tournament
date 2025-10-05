import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function TeamList() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading teams...</div>;

  return (
    <div style={{ margin: '20px 0' }}>
      <h3>Your Teams ({teams.length})</h3>
      {teams.length === 0 ? (
        <p>No teams created yet. Create your first team!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
          {teams.map((team) => (
            <div 
              key={team.id}
              style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                borderRadius: '8px',
                background: 'white',
                textAlign: 'center'
              }}
            >
              {team.logo_url ? (
                <img 
                  src={team.logo_url} 
                  alt={team.name}
                  style={{ width: '50px', height: '50px', borderRadius: '50%', marginBottom: '10px' }}
                />
              ) : (
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  background: '#3498db', 
                  margin: '0 auto 10px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>
                  ?
                </div>
              )}
              <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                {team.name}
              </h4>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Created: {new Date(team.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

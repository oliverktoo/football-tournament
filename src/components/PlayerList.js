import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function PlayerList() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*, teams(name)')
        .order('name');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading players...</div>;

  return (
    <div style={{ margin: '20px 0' }}>
      <h3>Players ({players.length})</h3>
      {players.length === 0 ? (
        <p>No players added yet. Add your first player!</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Player</th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Position</th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Team</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <strong>{player.name}</strong>
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {player.position || 'Not specified'}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {player.teams?.name || 'No team'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

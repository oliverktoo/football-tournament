import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function TournamentTeamsView() {
  const [tournamentTeams, setTournamentTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournamentTeams();
  }, []);

  const fetchTournamentTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*, tournament_teams(team_id, teams(*))')
        .order('name');

      if (error) throw error;
      
      // Transform the data to make it easier to display
      const transformedData = data.map(tournament => ({
        ...tournament,
        teams: tournament.tournament_teams ? tournament.tournament_teams.map(tt => tt.teams) : []
      }));
      
      setTournamentTeams(transformedData || []);
    } catch (error) {
      console.error('Error fetching tournament teams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading tournament teams...</div>;

  return (
    <div style={{ margin: '20px 0' }}>
      <h3>Tournament Teams Overview</h3>
      {tournamentTeams.length === 0 ? (
        <p>No tournament team assignments found. Assign teams to tournaments first.</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {tournamentTeams.map((tournament) => (
            <div 
              key={tournament.id}
              style={{ 
                border: '1px solid #ddd', 
                padding: '20px', 
                borderRadius: '10px',
                background: '#f9f9f9'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
                    ?? {tournament.name}
                  </h4>
                  {tournament.description && (
                    <p style={{ margin: '0', color: '#7f8c8d' }}>
                      {tournament.description}
                    </p>
                  )}
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                    <strong>Dates:</strong> {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ 
                  background: tournament.teams.length > 0 ? '#2ecc71' : '#e74c3c', 
                  color: 'white', 
                  padding: '5px 10px', 
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  {tournament.teams.length} {tournament.teams.length === 1 ? 'team' : 'teams'}
                </div>
              </div>

              {tournament.teams.length > 0 ? (
                <div>
                  <h5 style={{ margin: '15px 0 10px 0', color: '#2c3e50' }}>Assigned Teams:</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {tournament.teams.map((team) => (
                      <div 
                        key={team.id}
                        style={{ 
                          background: 'white',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0',
                          textAlign: 'center'
                        }}
                      >
                        {team.logo_url ? (
                          <img 
                            src={team.logo_url} 
                            alt={team.name}
                            style={{ width: '30px', height: '30px', borderRadius: '50%', marginBottom: '5px' }}
                          />
                        ) : (
                          <div style={{ 
                            width: '30px', 
                            height: '30px', 
                            borderRadius: '50%', 
                            background: '#3498db', 
                            margin: '0 auto 5px auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px'
                          }}>
                            ?
                          </div>
                        )}
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>
                          {team.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ 
                  background: '#fff3cd', 
                  color: '#856404', 
                  padding: '10px', 
                  borderRadius: '5px',
                  textAlign: 'center'
                }}>
                  No teams assigned to this tournament yet.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

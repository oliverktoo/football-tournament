import React, { useState } from 'react';
import TournamentForm from './TournamentForm';
import TournamentList from './TournamentList';
import TeamForm from './TeamForm';
import TeamList from './TeamList';
import PlayerForm from './PlayerForm';
import PlayerList from './PlayerList';
import TournamentTeams from './TournamentTeams';
import TournamentTeamsView from './TournamentTeamsView';
import MatchForm from './MatchForm';
import MatchList from './MatchList';
import ScoreUpdate from './ScoreUpdate';
import Standings from './Standings';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('tournaments');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        <button onClick={() => setActiveTab('tournaments')} style={{ padding: '10px 15px', background: activeTab === 'tournaments' ? '#3498db' : 'transparent', color: activeTab === 'tournaments' ? 'white' : '#333', border: 'none', borderRadius: '5px 5px 0 0', fontSize: '12px' }}>?? Tournaments</button>
        <button onClick={() => setActiveTab('teams')} style={{ padding: '10px 15px', background: activeTab === 'teams' ? '#9b59b6' : 'transparent', color: activeTab === 'teams' ? 'white' : '#333', border: 'none', borderRadius: '5px 5px 0 0', fontSize: '12px' }}>? Teams</button>
        <button onClick={() => setActiveTab('players')} style={{ padding: '10px 15px', background: activeTab === 'players' ? '#e67e22' : 'transparent', color: activeTab === 'players' ? 'white' : '#333', border: 'none', borderRadius: '5px 5px 0 0', fontSize: '12px' }}>?? Players</button>
        <button onClick={() => setActiveTab('assign-teams')} style={{ padding: '10px 15px', background: activeTab === 'assign-teams' ? '#2ecc71' : 'transparent', color: activeTab === 'assign-teams' ? 'white' : '#333', border: 'none', borderRadius: '5px 5px 0 0', fontSize: '12px' }}>?? Assign Teams</button>
        <button onClick={() => setActiveTab('view-teams')} style={{ padding: '10px 15px', background: activeTab === 'view-teams' ? '#e74c3c' : 'transparent', color: activeTab === 'view-teams' ? 'white' : '#333', border: 'none', borderRadius: '5px 5px 0 0', fontSize: '12px' }}>?? View Assignments</button>
        <button onClick={() => setActiveTab('matches')} style={{ padding: '10px 15px', background: activeTab === 'matches' ? '#f39c12' : 'transparent', color: activeTab === 'matches' ? 'white' : '#333', border: 'none', borderRadius: '5px 5px 0 0', fontSize: '12px' }}>?? Matches</button>
        <button onClick={() => setActiveTab('scores')} style={{ padding: '10px 15px', background: activeTab === 'scores' ? '#e74c3c' : 'transparent', color: activeTab === 'scores' ? 'white' : '#333', border: 'none', borderRadius: '5px 5px 0 0', fontSize: '12px' }}>?? Scores</button>
        <button onClick={() => setActiveTab('standings')} style={{ padding: '10px 15px', background: activeTab === 'standings' ? '#2c3e50' : 'transparent', color: activeTab === 'standings' ? 'white' : '#333', border: 'none', borderRadius: '5px 5px 0 0', fontSize: '12px' }}>?? Standings</button>
      </div>

      {/* Tab Content */}
      {activeTab === 'tournaments' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          <div><TournamentForm onTournamentCreated={handleDataCreated} /></div>
          <div><TournamentList key={refreshKey} /></div>
        </div>
      )}

      {activeTab === 'teams' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          <div><TeamForm onTeamCreated={handleDataCreated} /></div>
          <div><TeamList key={refreshKey} /></div>
        </div>
      )}

      {activeTab === 'players' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          <div><PlayerForm onPlayerCreated={handleDataCreated} /></div>
          <div><PlayerList key={refreshKey} /></div>
        </div>
      )}

      {activeTab === 'assign-teams' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          <div><TournamentTeams onTeamsAssigned={handleDataCreated} /></div>
          <div><p>Assign teams to tournaments here.</p></div>
        </div>
      )}

      {activeTab === 'view-teams' && <TournamentTeamsView key={refreshKey} />}

      {activeTab === 'matches' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          <div><MatchForm onMatchCreated={handleDataCreated} /></div>
          <div><MatchList key={refreshKey} /></div>
        </div>
      )}

      {activeTab === 'scores' && <ScoreUpdate key={refreshKey} />}

      {activeTab === 'standings' && <Standings key={refreshKey} />}
    </div>
  );
}

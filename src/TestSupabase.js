import React, { useEffect } from 'react';
import { supabase } from './supabaseClient';

function TestSupabase() {
  useEffect(() => {
    // Test connection
    supabase.from('test').select('*').then(response => {
      console.log('Supabase connection test:', response);
    });
  }, []);

  return (
    <div style={{ padding: '20px', background: 'green', color: 'white' }}>
      ? Supabase Connected Successfully!
    </div>
  );
}

export default TestSupabase;

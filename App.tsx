import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { User, Band, InstrumentType } from './types';
import { Home } from './components/Home';
import { Registration } from './components/Registration';
import { AdminDashboard } from './components/AdminDashboard';
import { ProjectorView } from './components/ProjectorView';
import { generateDemoData } from './services/jamLogic';
import { supabase } from './services/supabase';

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [bands, setBands] = useState<Band[]>([]);
  const [pastBands, setPastBands] = useState<Band[]>([]);
  
  // Refs to prevent sync loops
  const lastSyncedUsers = useRef<string>('');
  const lastSyncedBands = useRef<string>('');
  const lastSyncedHistory = useRef<string>('');
  const isInitialLoad = useRef(true);

  const navigate = useNavigate(); // Get navigate hook once

  // 1. Initial Fetch from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from('app_storage').select('*');
        if (error) throw error;
        
        let loadedUsers = false;

        if (data) {
          data.forEach(row => {
            if (row.key === 'users') {
               setUsers(row.value);
               lastSyncedUsers.current = JSON.stringify(row.value);
               if (row.value.length > 0) loadedUsers = true;
            }
            if (row.key === 'bands') {
               setBands(row.value);
               lastSyncedBands.current = JSON.stringify(row.value);
            }
            if (row.key === 'history') {
               setPastBands(row.value);
               lastSyncedHistory.current = JSON.stringify(row.value);
            }
          });
        }

        // Fallback if empty DB
        if (!loadedUsers) {
           const demo = generateDemoData();
           setUsers(demo);
           // We will save this in the next effect
        }

      } catch (e) {
        console.error("Supabase load failed, falling back to local or demo", e);
        // Fallback logic could be LocalStorage here if desired
        const demo = generateDemoData();
        setUsers(demo);
      } finally {
        isInitialLoad.current = false;
      }
    };

    fetchData();
  }, []);

  // 2. Realtime Subscription (Listen to changes from other devices)
  useEffect(() => {
    const channel = supabase.channel('jam-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_storage' },
        (payload) => {
          const { key, value } = payload.new as { key: string, value: any };
          
          if (key === 'users') {
             const str = JSON.stringify(value);
             if (str !== lastSyncedUsers.current) {
                lastSyncedUsers.current = str;
                setUsers(value);
             }
          }
          if (key === 'bands') {
             const str = JSON.stringify(value);
             if (str !== lastSyncedBands.current) {
                lastSyncedBands.current = str;
                setBands(value);
             }
          }
          if (key === 'history') {
             const str = JSON.stringify(value);
             if (str !== lastSyncedHistory.current) {
                lastSyncedHistory.current = str;
                setPastBands(value);
             }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // 3. Save Changes to Supabase (Debounced/Check logic)
  // Helper to save data
  const saveData = useCallback(async (key: string, value: any, ref: React.MutableRefObject<string>) => {
      const str = JSON.stringify(value);
      if (str !== ref.current && !isInitialLoad.current) {
          ref.current = str;
          await supabase.from('app_storage').upsert({ key, value });
      }
  }, []);

  useEffect(() => { saveData('users', users, lastSyncedUsers); }, [users, saveData]);
  useEffect(() => { saveData('bands', bands, lastSyncedBands); }, [bands, saveData]);
  useEffect(() => { saveData('history', pastBands, lastSyncedHistory); }, [pastBands, saveData]);


  // --- SHARED HANDLERS ---
  const handleRegister = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleBandComplete = () => {
    setBands(prev => {
        if (prev.length === 0) return prev;
        const finishedBand = prev[0];
        const archivedBand = { ...finishedBand, endTime: new Date().toISOString() };
        setPastBands(history => [...history, archivedBand]);
        return prev.slice(1);
    });
  };

  const handleAddMemberToCurrentBand = (user: User, role: InstrumentType) => {
    setBands(prev => {
      if (prev.length === 0) return prev;
      const currentBand = { ...prev[0] };
      if (currentBand.members.find(m => m.id === user.id)) return prev;
      const newMember = { ...user, assignedRole: role };
      currentBand.members = [...currentBand.members, newMember];
      return [currentBand, ...prev.slice(1)];
    });
  };

  const handleRemoveMemberFromCurrentBand = (userId: string) => {
    setBands(prev => {
      if (prev.length === 0) return prev;
      const newBands = [...prev];
      const currentBand = { ...newBands[0] };
      currentBand.members = currentBand.members.filter(m => m.id !== userId);
      newBands[0] = currentBand;
      return newBands;
    });
  };

  const handleUpdateBandName = (bandId: string, newName: string) => {
    setBands(prev => prev.map(b => b.id === bandId ? { ...b, name: newName } : b));
  };

  return (
    <div className="antialiased">
      <Routes>
        <Route path="/" element={<Home navigate={navigate} />} />
        <Route path="/register" element={<Registration navigate={navigate} onRegister={handleRegister} />} />
        <Route 
          path="/admin" 
          element={<AdminDashboard 
            users={users} 
            setUsers={setUsers} 
            navigate={navigate} 
            bands={bands} 
            setBands={setBands}
            pastBands={pastBands} 
          />} 
        />
        <Route 
          path="/projector-preview" 
          element={<ProjectorView 
            bands={bands} 
            allUsers={users}
            navigate={navigate} 
            onNextBand={handleBandComplete} 
            onAddMember={handleAddMemberToCurrentBand}
            onRemoveMember={handleRemoveMemberFromCurrentBand}
            onUpdateBandName={handleUpdateBandName}
            isStandalone={false}
          />} 
        />
        {/* Standalone Projector View (Tablet) */}
        <Route path="/live" element={
           <ProjectorView 
              bands={bands} 
              allUsers={users}
              navigate={() => {}} // No-op for standalone
              onNextBand={handleBandComplete}
              onAddMember={handleAddMemberToCurrentBand}
              onRemoveMember={handleRemoveMemberFromCurrentBand}
              onUpdateBandName={handleUpdateBandName}
              isStandalone={true}
           />
        } />
        {/* Catch-all route for unknown paths */}
        <Route path="*" element={<Home navigate={navigate} />} />
      </Routes>
    </div>
  );
};

export default App;
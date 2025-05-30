import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';
import LogoutButton from '../components/LogoutButton';

export default function BrowsePage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [currentUserGender, setCurrentUserGender] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [religionFilter, setReligionFilter] = useState('');

  useEffect(() => {
    const checkProfileCompletion = async () => {
      await new Promise(res => setTimeout(res, 2000));

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !data) {
        console.error('Error fetching user profile', error);
        router.push('/profile');
        return;
      }

      if (!data.full_name || !data.age || !data.budget || !data.area) {
        alert('Please complete your profile to browse.');
        router.push('/profile');
        return;
      }

      setCurrentUserGender(data.gender);
      setCheckingProfile(false);
    };

    checkProfileCompletion();
  }, []);

  useEffect(() => {
    if (currentUserGender) {
      fetchFilteredUsers();
    }
  }, [currentUserGender, budgetFilter, areaFilter, languageFilter, religionFilter]);

  const fetchFilteredUsers = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth');
      return;
    }

    let query = supabase.from('users').select('*').neq('id', session.user.id);
    query = query.eq('gender', currentUserGender);

    if (budgetFilter) {
      query = query.lte('budget', parseInt(budgetFilter));
    }

    if (areaFilter) {
      query = query.ilike('area', `%${areaFilter}%`);
    }

    if (languageFilter) {
      query = query.eq('language', languageFilter);
    }

    if (religionFilter) {
      query = query.eq('religion', religionFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching filtered users:', error.message);
    } else {
      setUsers(data || []);
    }

    setLoading(false);
  };

  if (checkingProfile) {
    return <p className="text-primary text-lg p-4">Checking your profile...</p>;
  }

  if (loading) return <p className="text-muted text-lg p-4">Loading roommates...</p>;

  return (
    <div className="bg-background p-8 max-w-4xl mx-auto rounded-2xl shadow space-y-6">
      <h1 className="text-3xl font-heading text-primary mb-4">Browse Roommates</h1>
      <LogoutButton />

      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="number"
          placeholder="Max Budget"
          value={budgetFilter}
          onChange={(e) => setBudgetFilter(e.target.value)}
          className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Area"
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Languages</option>
          <option value="English">English</option>
          <option value="Mandarin">Mandarin</option>
          <option value="Hindi">Hindi</option>
          <option value="Spanish">Spanish</option>
          <option value="Arabic">Arabic</option>
          <option value="Bengali">Bengali</option>
          <option value="French">French</option>
          <option value="Russian">Russian</option>
          <option value="Portuguese">Portuguese</option>
          <option value="Urdu">Urdu</option>
        </select>
        <select
          value={religionFilter}
          onChange={(e) => setReligionFilter(e.target.value)}
          className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Religions</option>
          <option value="Christianity">Christianity</option>
          <option value="Islam">Islam</option>
          <option value="Hinduism">Hinduism</option>
          <option value="Buddhism">Buddhism</option>
          <option value="Judaism">Judaism</option>
          <option value="No Religion">No Religion</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="grid gap-6">
        {users.map((user) => (
          <div key={user.id} className="p-6 border rounded-2xl shadow bg-white space-y-2">
            <h2 className="text-xl font-heading text-primary">{user.full_name}</h2>
            <p><strong>Gender:</strong> {user.gender}</p>
            <p><strong>Age:</strong> {user.age}</p>
            <p><strong>Budget:</strong> €{user.budget}</p>
            <p><strong>Area:</strong> {user.area}</p>
            <p><strong>Language:</strong> {user.language}</p>
            <p><strong>Religion:</strong> {user.religion}</p>
            <p><strong>Bio:</strong> {user.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
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
  const [filters, setFilters] = useState({
    budget: '',
    area: '',
    language: '',
    religion: '',
    profession: '',
    smoker: false,
    pets: false,
    cleanliness: '',
  });

  useEffect(() => {
    const checkProfileCompletion = async () => {
      await new Promise((res) => setTimeout(res, 2000));

      const {
        data: { session },
      } = await supabase.auth.getSession();
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
  }, [currentUserGender, filters]);

  const fetchFilteredUsers = async () => {
  setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth');
      return;
    }

    let query = supabase.from('users').select('*').neq('id', session.user.id);
    query = query.eq('gender', currentUserGender);

    if (filters.budget) query = query.lte('budget', parseInt(filters.budget));
    if (filters.area) query = query.ilike('area', `%${filters.area}%`);
    if (filters.language) query = query.eq('language', filters.language);
    if (filters.religion) query = query.eq('religion', filters.religion);
    if (filters.profession) query = query.ilike('profession', `%${filters.profession}%`);
    if (filters.smoker) query = query.eq('smoker', false);
    if (filters.pets) query = query.eq('pets', true);
    if (filters.cleanliness) query = query.gte('cleanliness', parseInt(filters.cleanliness));

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching filtered users:', error.message);
    } else {
      setUsers(data || []);
    }

    setLoading(false);
  };

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value, type } = e.target;

  if (type === 'checkbox') {
    const checked = (e.target as HTMLInputElement).checked;
    setFilters((prev) => ({ ...prev, [name]: checked }));
  } else {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }
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
        <input name="budget" type="number" placeholder="Max Budget" value={filters.budget} onChange={handleChange} className="input-style" />
        <input name="area" type="text" placeholder="Area" value={filters.area} onChange={handleChange} className="input-style" />
        <input name="profession" type="text" placeholder="Profession" value={filters.profession} onChange={handleChange} className="input-style" />
        <select name="language" value={filters.language} onChange={handleChange} className="input-style">
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
        <select name="religion" value={filters.religion} onChange={handleChange} className="input-style">
          <option value="">All Religions</option>
          <option value="Christianity">Christianity</option>
          <option value="Islam">Islam</option>
          <option value="Hinduism">Hinduism</option>
          <option value="Buddhism">Buddhism</option>
          <option value="Judaism">Judaism</option>
          <option value="No Religion">No Religion</option>
          <option value="Other">Other</option>
        </select>
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="smoker" checked={filters.smoker} onChange={handleChange} />
          <span>No Smokers</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="pets" checked={filters.pets} onChange={handleChange} />
          <span>Pet Friendly</span>
        </label>
        <label className="w-full">
          Minimum Cleanliness
          <input type="range" name="cleanliness" min={1} max={5} value={filters.cleanliness} onChange={handleChange} className="w-full" />
        </label>
      </div>

      <div className="grid gap-6">
        {users.map((user) => (
          <div key={user.id} className="p-6 border rounded-2xl shadow bg-white space-y-2 text-center">
  {user.profile_photo_url ? (
    <img
      src={user.profile_photo_url}
      alt={`${user.full_name}'s profile`}
      className="w-32 h-32 object-cover rounded-full mx-auto mb-2"
    />
  ) : (
    <div className="w-32 h-32 bg-muted text-white flex items-center justify-center rounded-full mx-auto mb-2 text-sm">
      No Photo
    </div>
  )}
  <h2 className="text-xl font-heading text-primary">{user.full_name}</h2>

            <p><strong>Gender:</strong> {user.gender}</p>
            <p><strong>Age:</strong> {user.age}</p>
            <p><strong>Budget:</strong> €{user.budget}</p>
            <p><strong>Area:</strong> {user.area}</p>
            <p><strong>Profession:</strong> {user.profession}</p>
            <p><strong>Smoker:</strong> {user.smoker ? 'Yes' : 'No'}</p>
            <p><strong>Pets:</strong> {user.pets ? 'Yes' : 'No'}</p>
            <p><strong>Cleanliness:</strong> {user.cleanliness}/5</p>
            <p><strong>Language:</strong> {user.language}</p>
            <p><strong>Religion:</strong> {user.religion}</p>
            <p><strong>Bio:</strong> {user.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

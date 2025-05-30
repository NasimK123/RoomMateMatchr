import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';

export default function Profile() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [genderLocked, setGenderLocked] = useState(false);

  const [profile, setProfile] = useState({
    full_name: '',
    age: '',
    gender: '',
    budget: '',
    area: '',
    language: '',
    religion: '',
    bio: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
      } else {
        setSession(session);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          age: data.age || '',
          gender: data.gender || '',
          budget: data.budget || '',
          area: data.area || '',
          language: data.language || '',
          religion: data.religion || '',
          bio: data.bio || '',
        });
        setGenderLocked(data.gender_locked || false);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!profile.full_name || !profile.age || !profile.budget || !profile.area) {
      alert('Please fill in all required fields.');
      return;
    }

    if (isNaN(Number(profile.age)) || Number(profile.age) < 18 || Number(profile.age) > 120) {
      alert('Age must be a number between 18 and 120.');
      return;
    }

    if (isNaN(Number(profile.budget)) || Number(profile.budget) <= 0) {
      alert('Budget must be a positive number.');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email,
      ...profile,
      gender_locked: true,
    });
    setSaving(false);

    if (error) {
      alert('Error saving: ' + error.message);
    } else {
      alert('Profile saved successfully!');
      router.push('/browse');
    }
  };

  if (!session) {
    return <p className="text-primary text-lg p-4">Loading session...</p>;
  }

  if (loading) return <p className="text-muted text-lg p-4">Loading profile...</p>;

  return (
    <div className="bg-background p-8 max-w-2xl mx-auto rounded-2xl shadow space-y-6">
      <h1 className="text-3xl font-heading text-primary mb-4">Your Profile</h1>
      <LogoutButton />

      <p className="text-muted"><strong>Email:</strong> {user?.email}</p>
      <p className="text-muted"><strong>ID:</strong> {user?.id}</p>

      <input
        name="full_name"
        placeholder="Full Name"
        value={profile.full_name}
        onChange={handleChange}
        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <input
        name="age"
        placeholder="Age"
        type="number"
        value={profile.age}
        onChange={handleChange}
        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <select
        name="gender"
        value={profile.gender}
        onChange={handleChange}
        disabled={genderLocked}
        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      <input
        name="budget"
        placeholder="Budget (€)"
        type="number"
        value={profile.budget}
        onChange={handleChange}
        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <select
        name="area"
        value={profile.area}
        onChange={handleChange}
        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Select Area</option>
        <option value="Blanchardstown">Blanchardstown</option>
        <option value="Tallaght">Tallaght</option>
        <option value="Finglas">Finglas</option>
        <option value="Clondalkin">Clondalkin</option>
        <option value="Lucan">Lucan</option>
        <option value="Swords">Swords</option>
        <option value="Ballyfermot">Ballyfermot</option>
        <option value="Raheny">Raheny</option>
        <option value="Donnybrook">Donnybrook</option>
        <option value="Rathmines">Rathmines</option>
      </select>
      <select
        name="language"
        value={profile.language}
        onChange={handleChange}
        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Select Language</option>
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
        name="religion"
        value={profile.religion}
        onChange={handleChange}
        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Select Religion</option>
        <option value="Christianity">Christianity</option>
        <option value="Islam">Islam</option>
        <option value="Hinduism">Hinduism</option>
        <option value="Buddhism">Buddhism</option>
        <option value="Judaism">Judaism</option>
        <option value="No Religion">No Religion</option>
        <option value="Other">Other</option>
      </select>
      <textarea
        name="bio"
        placeholder="Write something about yourself..."
        value={profile.bio}
        onChange={handleChange}
        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
        rows={5}
      />

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-primary text-white py-3 rounded-xl hover:bg-secondary transition"
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
}
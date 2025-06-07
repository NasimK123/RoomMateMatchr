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
    profession: '',
    smoker: false,
    pets: false,
    cleanliness: 3,
    move_in_date: '',
    contact_email: '',
    profile_photo_url: '',
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
          profession: data.profession || '',
          smoker: data.smoker || false,
          pets: data.pets || false,
          cleanliness: data.cleanliness || 3,
          move_in_date: data.move_in_date || '',
          contact_email: data.contact_email || '',
          profile_photo_url: data.profile_photo_url || '',
        });
        setGenderLocked(data.gender_locked || false);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setProfile({ ...profile, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      return;
    }

    const { data } = supabase.storage.from('profile-photos').getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_photo_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      alert('Failed to save photo URL: ' + updateError.message);
    } else {
      alert('Photo uploaded!');
      setProfile((prev) => ({ ...prev, profile_photo_url: publicUrl }));
    }
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

      <input name="full_name" placeholder="Full Name" value={profile.full_name} onChange={handleChange} className="input-style" />
      <input name="age" placeholder="Age" type="number" value={profile.age} onChange={handleChange} className="input-style" />
      <select name="gender" value={profile.gender} onChange={handleChange} disabled={genderLocked} className="input-style">
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      <input name="budget" placeholder="Budget (€)" type="number" value={profile.budget} onChange={handleChange} className="input-style" />
      <select name="area" value={profile.area} onChange={handleChange} className="input-style">
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
      <select name="language" value={profile.language} onChange={handleChange} className="input-style">
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
      <select name="religion" value={profile.religion} onChange={handleChange} className="input-style">
        <option value="">Select Religion</option>
        <option value="Christianity">Christianity</option>
        <option value="Islam">Islam</option>
        <option value="Hinduism">Hinduism</option>
        <option value="Buddhism">Buddhism</option>
        <option value="Judaism">Judaism</option>
        <option value="No Religion">No Religion</option>
        <option value="Other">Other</option>
      </select>
      <textarea name="bio" placeholder="Write something about yourself..." value={profile.bio} onChange={handleChange} className="input-style" rows={5} />

      <input name="profession" placeholder="Profession" value={profile.profession} onChange={handleChange} className="input-style" />
      <label className="flex items-center space-x-2">
        <input name="smoker" type="checkbox" checked={profile.smoker} onChange={handleChange} />
        <span>Do you smoke?</span>
      </label>
      <label className="flex items-center space-x-2">
        <input name="pets" type="checkbox" checked={profile.pets} onChange={handleChange} />
        <span>Do you have pets?</span>
      </label>
      <label>
        Cleanliness (1 = Messy, 5 = Very Tidy):
        <input name="cleanliness" type="range" min={1} max={5} value={profile.cleanliness} onChange={handleChange} className="w-full" />
      </label>
      <input name="move_in_date" type="date" value={profile.move_in_date} onChange={handleChange} className="input-style" />
      <input name="contact_email" placeholder="Contact Email" value={profile.contact_email} onChange={handleChange} className="input-style" />

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="w-full border p-3 rounded-xl"
      />

      <input name="profile_photo_url" placeholder="Profile Photo URL" value={profile.profile_photo_url} onChange={handleChange} className="input-style" />

      <button onClick={handleSave} disabled={saving} className="w-full bg-primary text-white py-3 rounded-xl hover:bg-secondary transition">
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
}

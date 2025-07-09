import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../supabaseClient';
import LogoutButton from '../../components/LogoutButton';
import Image from 'next/image';

// Types
interface ProfileData {
  full_name: string;
  age: string;
  gender: string;
  budget: string;
  area: string;
  language: string;
  religion: string;
  bio: string;
  profession: string;
  smoker: boolean;
  pets: boolean;
  cleanliness: number;
  move_in_date: string;
  contact_email: string;
  profile_photo_url: string;
}

export default function Profile() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [genderLocked, setGenderLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
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

  // Dublin areas for dropdown
  const dublinAreas = [
    'Blanchardstown', 'Tallaght', 'Finglas', 'Clondalkin', 
    'Lucan', 'Swords', 'Ballyfermot', 'Raheny', 
    'Donnybrook', 'Rathmines'
  ];

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/auth');
      setSession(session);
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (!session) return;

    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfile({
            full_name: data.full_name || '',
            age: data.age?.toString() || '',
            gender: data.gender || '',
            budget: data.budget?.toString() || '',
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
          setGenderLocked(!!data.gender_locked);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
  };

  // FIXED: Updated image upload function
  // inside your Profile component, replace handleImageUpload with this:
const handleImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploading(true);
  try {
    // 1️⃣ Re-fetch the logged-in user right before uploading
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (!user) {
      console.error('Upload aborted: user not authenticated', userError);
      alert('You must be logged in to upload a photo.');
      return;
    }

    // 2️⃣ Validate file
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      alert('Please upload a JPG, JPEG, or PNG file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    // 3️⃣ Build a user-scoped path and upload
    const ext = file.name.split('.').pop();
    const path = `${user.id}/profile-photo.${ext}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(path, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw uploadError;

    // 4️⃣ Grab the public URL
    const {
      data: { publicUrl }
    } = supabase.storage.from('profile-photos').getPublicUrl(path);

    // 5️⃣ Persist it in your users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_photo_url: publicUrl })
      .eq('id', user.id);
    if (updateError) throw updateError;

    // 6️⃣ Reflect it in local state
    setProfile(prev => ({ ...prev, profile_photo_url: publicUrl }));
    console.log('Upload & DB update successful', uploadData);
  } catch (err: any) {
    console.error('Upload failed:', err);
    alert(`Upload failed: ${err.message}`);
  } finally {
    setUploading(false);
  }
};

  const validateProfile = (): boolean => {
    if (!profile.full_name.trim()) {
      alert('Full name is required');
      return false;
    }

    const ageNum = Number(profile.age);
    if (isNaN(ageNum)) {
      alert('Age must be a number');
      return false;
    }

    if (ageNum < 18 || ageNum > 120) {
      alert('Age must be between 18 and 120');
      return false;
    }

    if (!profile.gender) {
      alert('Please select your gender');
      return false;
    }

    if (!profile.area) {
      alert('Please select your area');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateProfile()) return;

    try {
      setSaving(true);
      const { error } = await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        ...profile,
        age: Number(profile.age),
        budget: Number(profile.budget),
        gender_locked: true,
      });

      if (error) throw error;

      router.push('/browse');
    } catch (error: any) {
      console.error('Save failed:', error);
      alert(`Save failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!session || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                name="full_name"
                value={profile.full_name}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
              <input
                name="age"
                type="number"
                min="18"
                max="120"
                value={profile.age}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                disabled={genderLocked}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Living Preferences */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Living Preferences</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget (€) *</label>
              <input
                name="budget"
                type="number"
                min="0"
                step="100"
                value={profile.budget}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Area *</label>
              <select
                name="area"
                value={profile.area}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Area</option>
                {dublinAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Move-in Date</label>
              <input
                name="move_in_date"
                type="date"
                value={profile.move_in_date}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lifestyle */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Lifestyle</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                name="language"
                value={profile.language}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Language</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
              <select
                name="religion"
                value={profile.religion}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Religion</option>
                <option value="Christianity">Christianity</option>
                <option value="Islam">Islam</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="smoker"
                checked={profile.smoker}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">Smoker</label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="pets"
                checked={profile.pets}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">Have Pets</label>
            </div>
          </div>

          {/* Profile Photo - FIXED SECTION */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Profile Photo</h2>
            
            {profile.profile_photo_url ? (
              <div className="flex items-center space-x-4">
                <Image
                  src={profile.profile_photo_url}
                  alt={`${profile.full_name || 'User'}'s profile`}
                  width={80}
                  height={80}
                  className="rounded-full object-cover border-2 border-gray-200"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Change Photo
                  </label>
                  <label
                    htmlFor="profile-photo-upload"
                    className={`cursor-pointer text-sm px-3 py-1 rounded border ${
                      uploading 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'text-blue-600 border-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {uploading ? 'Uploading...' : 'Upload new photo'}
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="profile-photo-upload"
                    disabled={uploading}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label 
                  htmlFor="dropzone-file"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg ${
                    uploading 
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG (MAX. 2MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">About You</h2>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Tell potential roommates about yourself..."
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
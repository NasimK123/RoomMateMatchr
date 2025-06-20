import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';
import Image from 'next/image';
import Link from 'next/link';

// Types
interface UserProfile {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  budget: number;
  area: string;
  language: string;
  religion: string;
  profession: string;
  smoker: boolean;
  pets: boolean;
  cleanliness: number;
  bio?: string;
  profile_photo_url?: string;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserGender, setCurrentUserGender] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      if (!id) return;

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth');
        return;
      }

      // Get current user's gender for validation
      const { data: currentUser } = await supabase
        .from('users')
        .select('gender')
        .eq('id', session.user.id)
        .single();

      if (!currentUser) {
        router.push('/profile');
        return;
      }

      setCurrentUserGender(currentUser.gender);

      // Fetch the profile being viewed
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError || !profileData) {
        setError('Profile not found');
        setLoading(false);
        return;
      }

      // Check if trying to view opposite gender profile (Islamic guidelines)
      if (profileData.gender !== currentUser.gender) {
        setError('Access restricted - profiles of opposite gender are not viewable');
        setLoading(false);
        return;
      }

      // Check if trying to view own profile
      if (profileData.id === session.user.id) {
        router.push('/profile');
        return;
      }

      setProfile(profileData);
      setLoading(false);
    };

    checkAuthAndFetchProfile();
  }, [id, router]);

  const handleContactInterest = async () => {
    if (!profile) return;

    // In a real app, you might want to implement a messaging system
    // For now, we'll show contact information or redirect to a contact form
    alert(`To contact ${profile.full_name}, please use the messaging system or contact through the platform.`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/browse"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">The profile you&apos;re looking for doesn&apos;t exist.</p>
          <Link 
            href="/browse"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          href="/browse"
          className="flex items-center text-primary hover:text-primary-dark transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Browse
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-8 text-white">
          <div className="flex items-center space-x-6">
            {profile.profile_photo_url ? (
              <Image
                src={profile.profile_photo_url}
                alt={`${profile.full_name}'s profile`}
                width={120}
                height={120}
                className="rounded-full border-4 border-white object-cover"
              />
            ) : (
              <div className="w-30 h-30 rounded-full bg-white/20 border-4 border-white flex items-center justify-center">
                <span className="text-4xl font-bold">
                  {profile.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2">{profile.full_name}</h1>
              <p className="text-xl opacity-90">{profile.age} years old</p>
              <p className="text-lg opacity-80">{profile.profession}</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Basic Information</h2>
              <div className="space-y-4">
                <DetailCard
                  icon="💰"
                  label="Budget"
                  value={`€${profile.budget} per month`}
                />
                <DetailCard
                  icon="📍"
                  label="Preferred Area"
                  value={profile.area}
                />
                <DetailCard
                  icon="🗣️"
                  label="Language"
                  value={profile.language}
                />
                <DetailCard
                  icon="🕌"
                  label="Religion"
                  value={profile.religion}
                />
              </div>
            </div>

            {/* Living Preferences */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Living Preferences</h2>
              <div className="space-y-4">
                <DetailCard
                  icon="🧹"
                  label="Cleanliness Level"
                  value={`${profile.cleanliness}/5`}
                  description={getCleanlinessDescription(profile.cleanliness)}
                />
                <DetailCard
                  icon="🚭"
                  label="Smoking"
                  value={profile.smoker ? 'Smoker' : 'Non-smoker'}
                  valueColor={profile.smoker ? 'text-orange-600' : 'text-green-600'}
                />
                <DetailCard
                  icon="🐕"
                  label="Pets"
                  value={profile.pets ? 'Pet-friendly' : 'No pets'}
                  valueColor={profile.pets ? 'text-blue-600' : 'text-gray-600'}
                />
                <DetailCard
                  icon="👤"
                  label="Gender"
                  value={profile.gender}
                />
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {profile.bio && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">About Me</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            </div>
          )}

          {/* Member Since */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Member since {new Date(profile.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-8 border-t border-gray-200 flex space-x-4">
            <button
              onClick={handleContactInterest}
              className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition font-medium"
            >
              Express Interest
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
const DetailCard = ({ 
  icon, 
  label, 
  value, 
  description, 
  valueColor = 'text-gray-800' 
}: {
  icon: string;
  label: string;
  value: string;
  description?: string;
  valueColor?: string;
}) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
    <div className="flex items-start space-x-3">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className={`text-lg font-semibold ${valueColor}`}>{value}</p>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  </div>
);

// Helper Functions
const getCleanlinessDescription = (level: number): string => {
  const descriptions = {
    1: 'Very relaxed about cleanliness',
    2: 'Somewhat relaxed about cleanliness',
    3: 'Average cleanliness expectations',
    4: 'Quite tidy and organized',
    5: 'Very neat and clean'
  };
  return descriptions[level as keyof typeof descriptions] || 'Average cleanliness expectations';
};
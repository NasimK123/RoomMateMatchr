import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';
import LogoutButton from '../components/LogoutButton';
import Image from 'next/image';

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
}

interface Filters {
  budget: string;
  area: string;
  language: string;
  religion: string;
  profession: string;
  smoker: boolean;
  pets: boolean;
  cleanliness: string;
}

const initialFilters: Filters = {
  budget: '',
  area: '',
  language: '',
  religion: '',
  profession: '',
  smoker: false,
  pets: false,
  cleanliness: '3', // Default to average cleanliness
};

export default function BrowsePage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [currentUserGender, setCurrentUserGender] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Check profile and auth status
  useEffect(() => {
    const checkProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth');
        return;
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !profile?.full_name) {
        router.push('/profile');
        return;
      }

      setCurrentUserGender(profile.gender);
      setCurrentUserId(session.user.id);
      setCheckingProfile(false);
    };

    checkProfile();
  }, []);

  // Debounced user fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentUserGender && currentUserId) fetchFilteredUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, page, currentUserGender, currentUserId]);

  const fetchFilteredUsers = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push('/auth');
      return;
    }

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .neq('id', currentUserId)
      .eq('gender', currentUserGender)
      .range((page - 1) * perPage, page * perPage - 1);

    // Apply filters
    if (filters.budget) query = query.lte('budget', Number(filters.budget));
    if (filters.area) query = query.ilike('area', `%${filters.area}%`);
    if (filters.language) query = query.eq('language', filters.language);
    if (filters.religion) query = query.eq('religion', filters.religion);
    if (filters.profession) query = query.ilike('profession', `%${filters.profession}%`);
    if (filters.smoker) query = query.eq('smoker', false);
    if (filters.pets) query = query.eq('pets', true);
    if (filters.cleanliness) query = query.gte('cleanliness', Number(filters.cleanliness));

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
      setTotalUsers(count || 0);
    }

    setLoading(false);
  }, [filters, page, currentUserGender, currentUserId, router]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setPage(1); // Reset to first page on filter change

    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  const handleUserCardClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  if (checkingProfile) {
    return <div className="p-8 text-center">Verifying your profile...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Browse Roommates</h1>
        <LogoutButton />
      </header>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FilterInput
            label="Max Budget"
            name="budget"
            type="number"
            value={filters.budget}
            onChange={handleFilterChange}
            placeholder="€1500"
          />
          
          <FilterInput
            label="Area"
            name="area"
            type="text"
            value={filters.area}
            onChange={handleFilterChange}
            placeholder="Downtown"
          />
          
          <FilterSelect
            label="Language"
            name="language"
            value={filters.language}
            onChange={handleFilterChange}
            options={[
              { value: '', label: 'All Languages' },
              { value: 'English', label: 'English' },
              { value: 'Spanish', label: 'Spanish' },
              { value: 'French', label: 'French' },
              { value: 'German', label: 'German' },
              { value: 'Italian', label: 'Italian' },
              { value: 'Portuguese', label: 'Portuguese' },
              { value: 'Dutch', label: 'Dutch' },
              { value: 'Polish', label: 'Polish' },
              { value: 'Arabic', label: 'Arabic' },
              { value: 'Chinese', label: 'Chinese' },
              { value: 'Other', label: 'Other' },
            ]}
          />

          <FilterSelect
            label="Religion"
            name="religion"
            value={filters.religion}
            onChange={handleFilterChange}
            options={[
              { value: '', label: 'All Religions' },
              { value: 'Christianity', label: 'Christianity' },
              { value: 'Islam', label: 'Islam' },
              { value: 'Judaism', label: 'Judaism' },
              { value: 'Hinduism', label: 'Hinduism' },
              { value: 'Buddhism', label: 'Buddhism' },
              { value: 'Other', label: 'Other' },
              { value: 'None', label: 'None' },
            ]}
          />
          
          <FilterInput
            label="Profession"
            name="profession"
            type="text"
            value={filters.profession}
            onChange={handleFilterChange}
            placeholder="Software Engineer"
          />
          
          <FilterCheckbox
            label="No Smokers"
            name="smoker"
            checked={filters.smoker}
            onChange={handleFilterChange}
          />
          
          <FilterCheckbox
            label="Pet Friendly"
            name="pets"
            checked={filters.pets}
            onChange={handleFilterChange}
          />
          
          <FilterRange
            label={`Min Cleanliness: ${filters.cleanliness}/5`}
            name="cleanliness"
            min={1}
            max={5}
            value={filters.cleanliness}
            onChange={handleFilterChange}
          />
        </div>
        
        <div className="flex justify-between mt-4">
          <button
            onClick={resetFilters}
            className="text-primary underline hover:text-primary-dark transition"
          >
            Reset Filters
          </button>
          <div className="text-sm text-gray-500">
            Showing {users.length} of {totalUsers} roommates
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading roommates...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500 mb-4">No matching roommates found</p>
          <p className="text-gray-400 mb-6">Try adjusting your filters to see more results</p>
          <button
            onClick={resetFilters}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <UserCard 
              key={user.id} 
              user={user} 
              onClick={() => handleUserCardClick(user.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalUsers > perPage && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            Previous
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, Math.ceil(totalUsers / perPage)) }, (_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === page;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 rounded-lg transition ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(totalUsers / perPage)}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// Componentized UI Elements
const FilterInput = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition"
      {...props}
    />
  </div>
);

const FilterSelect = ({ label, options, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition"
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const FilterCheckbox = ({ label, ...props }) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
      {...props}
    />
    <label className="ml-2 text-sm text-gray-700">{label}</label>
  </div>
);

const FilterRange = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type="range"
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      {...props}
    />
  </div>
);

const UserCard = ({ user, onClick }: { user: UserProfile; onClick: () => void }) => (
  <div 
    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1"
    onClick={onClick}
  >
    <div className="p-4">
      <div className="flex items-center space-x-4 mb-4">
        {user.profile_photo_url ? (
          <Image
            src={user.profile_photo_url}
            alt={`${user.full_name}'s profile`}
            width={64}
            height={64}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {user.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h3 className="font-bold text-lg text-gray-800 hover:text-primary transition">
            {user.full_name}
          </h3>
          <p className="text-gray-600">{user.age} years old</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <DetailItem label="Budget" value={`€${user.budget}`} />
        <DetailItem label="Area" value={user.area} />
        <DetailItem label="Profession" value={user.profession} />
        <DetailItem label="Religion" value={user.religion} />
        <DetailItem label="Language" value={user.language} />
        <DetailItem label="Cleanliness" value={`${user.cleanliness}/5`} />
        <DetailItem label="Smoker" value={user.smoker ? 'Yes' : 'No'} />
        <DetailItem label="Pets" value={user.pets ? 'Yes' : 'No'} />
      </div>
      
      {user.bio && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-gray-700 text-sm line-clamp-3">{user.bio}</p>
        </div>
      )}

      <div className="mt-4 text-center">
        <span className="text-primary text-sm font-medium">Click to view full profile →</span>
      </div>
    </div>
  </div>
);

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gray-50 p-2 rounded">
    <span className="font-medium text-gray-700 text-xs block">{label}</span>
    <span className="text-sm text-gray-900">{value}</span>
  </div>
);
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
      setCheckingProfile(false);
    };

    checkProfile();
  }, []);

  // Debounced user fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentUserGender) fetchFilteredUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, page, currentUserGender]);

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
      .neq('id', session.user.id)
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
  }, [filters, page, currentUserGender, router]);

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
              // Add other languages
            ]}
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
            label={`Cleanliness: ${filters.cleanliness}/5`}
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
            className="text-primary underline"
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
        <div className="text-center py-12">Loading...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No matching roommates found</p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalUsers > perPage && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 mx-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {Math.ceil(totalUsers / perPage)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(totalUsers / perPage)}
            className="px-4 py-2 mx-1 border rounded disabled:opacity-50"
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
      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
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
      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
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
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      {...props}
    />
  </div>
);

const UserCard = ({ user }: { user: UserProfile }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
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
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Photo</span>
          </div>
        )}
        <div>
          <h3 className="font-bold text-lg">{user.full_name}</h3>
          <p className="text-gray-600">{user.age} years</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
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
        <div className="mt-4">
          <p className="text-gray-700 text-sm">{user.bio}</p>
        </div>
      )}
    </div>
  </div>
);

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span className="font-medium text-gray-700">{label}:</span> {value}
  </div>
);
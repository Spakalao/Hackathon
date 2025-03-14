import ProfileForm from '../components/UserProfile/ProfileForm';

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Profile</h1>
      <ProfileForm />
    </div>
  );
} 
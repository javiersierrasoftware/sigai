import { getUserProfile } from "@/lib/actions/user-actions";
import { getFaculties, getResearchLines, getResearchGroups, getAllPrograms } from "@/lib/actions/admin-actions";
import ProfileEditClient from "./ProfileEditClient";
import { getSession } from "@/lib/actions/auth-actions";
import { redirect } from "next/navigation";

import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const profileResult = await getUserProfile();
  const facultiesResult = await getFaculties();
  const programsResult = await getAllPrograms();
  const researchLinesResult = await getResearchLines();
  const researchGroupsResult = await getResearchGroups();

  if (!profileResult.success) {
    return <div>Error loading profile: {profileResult.error}</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader 
        user={session.user} 
        breadcrumbs={[{ label: 'Mi Perfil', active: true }]} 
      />
      <div className="py-4">
        <ProfileEditClient 
          user={profileResult.data}
          faculties={facultiesResult.data || []}
          allPrograms={programsResult.data || []}
          researchLines={researchLinesResult.data || []}
          researchGroups={researchGroupsResult.data || []}
        />
      </div>
    </div>
  );
}

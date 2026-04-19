import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findUserById } from "@/repositories/user.repository";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  const user = await findUserById(session.userId);
  if (!user) redirect("/signin");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Hồ sơ</h2>
        <p className="text-sm text-muted-foreground">
          Quản lý thông tin cá nhân và bảo mật
        </p>
      </div>

      <ProfileForm initialName={user.name} email={user.email} />
    </div>
  );
}

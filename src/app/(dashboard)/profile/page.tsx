import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findUserById } from "@/repositories/user.repository";
import { ProfileForm } from "@/components/profile/profile-form";
import { getLocale, getDictionary } from "@/i18n";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  const [user, locale] = await Promise.all([
    findUserById(session.userId),
    getLocale(),
  ]);
  if (!user) redirect("/signin");

  const dict = await getDictionary(locale);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{dict.profile.title}</h2>
        <p className="text-sm text-muted-foreground">{dict.profile.subtitle}</p>
      </div>

      <ProfileForm initialName={user.name} email={user.email} />
    </div>
  );
}

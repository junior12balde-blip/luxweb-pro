import { requireUser } from "@/lib/auth";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from "@/lib/validations/profile";
import { AvatarUploader } from "@/components/settings/AvatarUploader";
import { ProfileForm } from "@/components/settings/ProfileForm";

export default async function ProfilePage() {
  const { user } = await requireUser();
  const notificationPrefs =
    (user.notificationPrefs as NotificationPreferences | null) ??
    DEFAULT_NOTIFICATION_PREFERENCES;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Foto de perfil</h2>
        <div className="mt-4">
          <AvatarUploader currentAvatarUrl={user.avatarUrl} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Datos personales</h2>
        <div className="mt-4">
          <ProfileForm
            fullName={user.fullName ?? ""}
            locale={user.locale}
            timezone={user.timezone}
            notificationPrefs={notificationPrefs}
          />
        </div>
      </div>
    </div>
  );
}

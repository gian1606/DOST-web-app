import SettingsPage from "../../../components/ui/Settings";
import { useAuth } from "../../../context/AuthContext.jsx";

export default function SuperAdminSettings() {
  const { user } = useAuth();

  return (
    <SettingsPage
      profile={{
        name:       user?.name  || "Super Admin",
        email:      user?.email || "",
        role:       "Super Administrator",
        scope:      "Batangas City",
        scopeLabel: "Jurisdiction",
      }}
    />
  );
}

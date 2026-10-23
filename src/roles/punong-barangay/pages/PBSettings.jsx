import SettingsPage from "../../../components/ui/Settings";
import { useAuth } from "../../../context/AuthContext.jsx";

export default function PBSettings() {
  const { user } = useAuth();

  return (
    <SettingsPage
      profile={{
        name:       user?.name      || "Punong Barangay",
        email:      user?.email     || "",
        role:       "Punong Barangay",
        scope:      user?.barangay  || "",
        scopeLabel: "Barangay",
      }}
    />
  );
}

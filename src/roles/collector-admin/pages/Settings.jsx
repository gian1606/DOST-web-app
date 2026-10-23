import SettingsPage from "../../../components/ui/Settings";
import { useAuth } from "../../../context/AuthContext.jsx";

export default function CollectorAdminSettings() {
  const { user } = useAuth();

  return (
    <SettingsPage
      profile={{
        name:       user?.name     || "Collector Admin",
        email:      user?.email    || "",
        role:       "Collector Administrator",
        scope:      "Cluster 1",
        scopeLabel: "Assigned Cluster",
      }}
    />
  );
}

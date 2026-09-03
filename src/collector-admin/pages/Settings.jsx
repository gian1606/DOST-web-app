import SettingsPage from "../../components/ui/Settings";

export default function CollectorAdminSettings() {
  const user = JSON.parse(sessionStorage.getItem("bs_user") || "{}");

  return (
    <SettingsPage
      profile={{
        name:       user.name  || "Collector Admin",
        email:      user.email || "",
        role:       "Collector Administrator",
        scope:      "Cluster 1",
        scopeLabel: "Assigned Cluster",
      }}
      logoutKey="bs_token"
      logoutPath="/login"
    />
  );
}

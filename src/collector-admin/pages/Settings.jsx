import SettingsPage from "../../components/ui/Settings";
import { CA_CREDENTIALS } from "../../mock/data";

export default function CollectorAdminSettings() {
  return (
    <SettingsPage
      profile={{
        name:       CA_CREDENTIALS.name,
        email:      CA_CREDENTIALS.email,
        role:       "Collector Administrator",
        scope:      `Cluster ${CA_CREDENTIALS.assignedCluster.replace("c", "")}`,
        scopeLabel: "Assigned Cluster",
      }}
      logoutKey="bs_ca_auth"
      logoutPath="/login"
    />
  );
}

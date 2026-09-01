import SettingsPage from "../../components/ui/Settings";
import { CLUSTER_INFO } from "../mock/data";

export default function ClusterAdminSettings() {
  return (
    <SettingsPage
      profile={{
        name:       CLUSTER_INFO.adminName,
        email:      CLUSTER_INFO.adminEmail,
        role:       "Cluster Administrator",
        scope:      `${CLUSTER_INFO.label} — ${CLUSTER_INFO.zone}`,
        scopeLabel: "Assigned Cluster",
      }}
      logoutKey="bs_auth"
      logoutPath="/login"
    />
  );
}

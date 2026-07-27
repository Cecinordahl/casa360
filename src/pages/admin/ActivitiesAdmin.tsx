import { ItemList } from "../../components/admin/ItemList";
import { activityFields } from "../../components/admin/fieldConfig";

export function ActivitiesAdmin() {
  return <ItemList collectionName="activities" fields={activityFields} titleKey="admin.manageActivities" />;
}

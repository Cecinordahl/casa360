import { ItemList } from "../../components/admin/ItemList";
import { practicalFields } from "../../components/admin/fieldConfig";

export function PracticalAdmin() {
  return <ItemList collectionName="practicalInfo" fields={practicalFields} titleKey="admin.managePractical" />;
}

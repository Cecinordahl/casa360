import { ItemList } from "../../components/admin/ItemList";
import { groceryFields } from "../../components/admin/fieldConfig";

export function GroceriesAdmin() {
  return <ItemList collectionName="groceries" fields={groceryFields} titleKey="admin.manageGroceries" />;
}

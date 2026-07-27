import { ItemList } from "../../components/admin/ItemList";
import { restaurantFields } from "../../components/admin/fieldConfig";

export function RestaurantsAdmin() {
  return <ItemList collectionName="restaurants" fields={restaurantFields} titleKey="admin.manageRestaurants" />;
}

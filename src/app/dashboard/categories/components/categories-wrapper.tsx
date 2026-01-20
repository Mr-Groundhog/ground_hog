import { getCategories } from "../actions";
import { CategoryList } from "./category-list";

export async function CategoriesWrapper() {
  const categories = await getCategories();

  return <CategoryList data={categories} />;
}

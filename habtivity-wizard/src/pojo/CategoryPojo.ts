// Categories live within an Area. So no separate store for them.
export default interface Category {
  id: string;
  name: string;
  icon: string;

  // Optional
  imageUrl?: string;
}

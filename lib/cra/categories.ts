export type CraCategoryDefinition = {
  slug: string;
  name: string;
  description: string;
};

export const CRA_ORGANIZATION_ROUTE = "/resolutions/cra";
export const CRA_ALL_RESOLUTIONS_ROUTE = `${CRA_ORGANIZATION_ROUTE}/all`;

export const craCategories: CraCategoryDefinition[] = [
  {
    slug: "fixed-services",
    name: "خدمات ثابت",
    description: "مصوبات ثبت‌شده در پوشه خدمات ثابت سامانه اسناد سازمان تنظیم مقررات",
  },
  {
    slug: "mobile-services",
    name: "خدمات همراه",
    description: "مصوبات ثبت‌شده در پوشه خدمات همراه سامانه اسناد سازمان تنظیم مقررات",
  },
  {
    slug: "fixed-mobile-convergence",
    name: "همگرایی خدمات ثابت و همراه",
    description: "مصوبات ثبت‌شده در پوشه همگرایی خدمات ثابت و همراه سامانه اسناد سازمان تنظیم مقررات",
  },
  {
    slug: "radio-communications",
    name: "ارتباطات رادیویی",
    description: "مصوبات ثبت‌شده در پوشه ارتباطات رادیویی سامانه اسناد سازمان تنظیم مقررات",
  },
  {
    slug: "postal-services",
    name: "پست",
    description: "مصوبات ثبت‌شده در پوشه پست سامانه اسناد سازمان تنظیم مقررات",
  },
  {
    slug: "general-regulations",
    name: "مقررات عمومی",
    description: "مصوبات ثبت‌شده در پوشه مقررات عمومی سامانه اسناد سازمان تنظیم مقررات",
  },
  {
    slug: "specific-regulations",
    name: "مقررات اختصاصی",
    description: "مصوبات ثبت‌شده در پوشه مقررات اختصاصی سامانه اسناد سازمان تنظیم مقررات",
  },
];

const craCategoryBySlug = new Map(craCategories.map((category) => [category.slug, category]));
const craCategoryByName = new Map(craCategories.map((category) => [category.name, category]));

export function craCategoryForSlug(slug: string) {
  return craCategoryBySlug.get(slug);
}

export function craCategoryForName(name: string) {
  return craCategoryByName.get(name);
}

export function craCategoryRoute(category: CraCategoryDefinition | string) {
  const slug = typeof category === "string" ? category : category.slug;
  return `${CRA_ORGANIZATION_ROUTE}/categories/${slug}`;
}

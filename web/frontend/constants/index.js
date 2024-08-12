const plansCardData = [
  {
    name: "Essential",
    price: 7,
    features: [
      "Payment Modification",
      "Shipping Modification",
      "7 Days free trial",
    ],
  },
  {
    name: "Advance",
    price: 39,
    features: [
      "Payment Modification",
      "Shipping Modification",
      "Discounts (Product, Order and Shipping)",
      "7 Days free trial",
    ],
  },
  {
    name: "Professional",
    price: 99,
    features: [
      "Payment Modification",
      "Shipping Modification",
      "Field Validation",
      "City Dropdown",
      "Checkout Banners",
      "Custom Fields",
      "Fraudulant Module",
      "Discounts (Product, Order and Shipping)",
      "7 Days free trial",
    ],
    shopifyPlus: true,
  },
  {
    name: "Premium",
    price: 299,
    features: [
      "Payment Modification",
      "Shipping Modification",
      "Field Validation",
      "Advance City Dropdown",
      "Checkout Banners",
      "Custom Fields",
      "Advance Checkout Styling",
      "Fraudulant Module",
      "Discounts (Product, Order and Shipping)",
      "7 Days free trial",
    ],
    shopifyPlus: true,
    comingSoon: ["UpSell/CrossSell", "Gift Messages"],
  },
];

export const customizationRuleForPayment = [
  {
    label: "Equal to ",
    value: "equal-to",
  },
  {
    label: "Greater than ",
    value: "greater-than",
  },
  {
    label: "Less than ",
    value: "less-than",
  },
];

export const customizationRuleForCountry = [
  {
    label: "Contains",
    value: "contains",
  },
  {
    label: "Does Not Contains",
    value: "does-not-contains",
  },
];

export {
  plansCardData,
  // customizationRuleForCountry,
  // customizationRuleForPayment,
};

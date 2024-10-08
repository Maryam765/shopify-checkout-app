export const getCorrectDate = (value) => {
  const s = new Date(value);
  const timezoneOffset = s.getTimezoneOffset() * 60000;
  const localISOTime = new Date(s.getTime() - timezoneOffset)
    .toISOString()
    .slice(0, 10);

  const final = new Date(localISOTime).toISOString();
  return final;
};

export const getCountryName = (code, countries) => {
  const country = countries.find((country) => country.value === code);
  return country ? country.label : "Country not found";
};

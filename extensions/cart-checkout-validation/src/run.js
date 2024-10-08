// Use JSDoc annotations for type safety
/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

// The configured entrypoint for the 'purchase.validation.run' extension target
/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */

export function run(input) {
  const { cart, validation } = input;

  const setting = JSON.parse(validation?.metafield?.value ?? "{}").setting;
  const errors = [];
  const obj = JSON.stringify(setting, null, 2);
  console.log("metafields", obj);

  const deliveryAddress = cart?.deliveryGroups[0]?.deliveryAddress || {};
  const phone = deliveryAddress.phone || "";
  const firstName = deliveryAddress.firstName || "";
  const lastName = deliveryAddress.lastName || "";
  const address1 = deliveryAddress.address1 || "";

  const countryCode = input.cart.deliveryGroups.map(
    (group) => group?.deliveryAddress?.countryCode
  );
  const isCountryMatch = countryCode.some(
    (code) => setting.country_name === code
  );

  if (setting && isCountryMatch) {
    const validateField = (fieldValue, fieldSetting, fieldName, fieldTitle) => {
      if (fieldSetting.limit_type) {
        const wordCount = fieldValue.trim().split(/\s+/).length;
        if (
          wordCount < fieldSetting.min_length ||
          wordCount > fieldSetting.max_length
        ) {
          errors.push({
            localizedMessage: `${fieldTitle}     must have between ${fieldSetting.min_length} and ${fieldSetting.max_length} words.`,
            target: `$.cart.deliveryGroups[0].deliveryAddress.${fieldName}`,
          });
        }
      } else {
        if (
          fieldValue.length < fieldSetting.min_length ||
          fieldValue.length > fieldSetting.max_length
        ) {
          errors.push({
            localizedMessage: `${fieldTitle}  must have between ${fieldSetting.min_length} and ${fieldSetting.max_length} characters.`,
            target: `$.cart.deliveryGroups[0].deliveryAddress.${fieldName}`,
          });
        }
      }
      if (fieldSetting.block_digits && /\d/.test(fieldValue)) {
        errors.push({
          localizedMessage: `${fieldTitle}  cannot contain digits.`,
          target: `$.cart.deliveryGroups[0].deliveryAddress.${fieldName}`,
        });
      }
      if (
        fieldSetting.block_sequential_character &&
        /(.)\1{2,}/.test(fieldValue)
      ) {
        errors.push({
          localizedMessage: `${fieldTitle} cannot contain sequential characters.`,
          target: `$.cart.deliveryGroups[0].deliveryAddress.${fieldName}`,
        });
      }
      if (
        fieldSetting.special_character === "block-all" &&
        /[^a-zA-Z\s]/.test(fieldValue)
      ) {
        errors.push({
          localizedMessage: `${fieldTitle} cannot contain special characters.`,
          target: `$.cart.deliveryGroups[0].deliveryAddress.${fieldName}`,
        });
      } else if (fieldSetting.special_character === "block-selective") {
        const regex = new RegExp(
          `[${fieldSetting.if_block_selected.join("")}]`
        );
        if (regex.test(fieldValue)) {
          errors.push({
            localizedMessage: `${fieldTitle} cannot contain the following characters: ${fieldSetting.if_block_selected.join(
              ", "
            )}`,
            target: `$.cart.deliveryGroups[0].deliveryAddress.${fieldName}`,
          });
        }
      }
    };

    // Validate first name
    if (setting.first_name_validation) {
      validateField(
        firstName,
        setting.first_name_validation,
        "firstName",
        "First Name"
      );
    }

    // Validate last name
    if (setting.last_name_validation) {
      validateField(
        lastName,
        setting.last_name_validation,
        "lastName",
        "Last Name"
      );
    }

    // Validate address
    if (setting.address_validation) {
      validateField(
        address1,
        setting.address_validation,
        "address1",
        "Address"
      );
    }

    // Phone validation
    if (setting.phone_validation) {
      const phoneValidation = setting.phone_validation;

      const isCountryCodeValid = phoneValidation.country_code.some((code) =>
        phone.startsWith(code)
      );
      if (!isCountryCodeValid) {
        errors.push({
          localizedMessage: phoneValidation.error_message,
          target: "$.cart.deliveryGroups[0].deliveryAddress.phone",
        });
      } else {
        const matchedCountryCode = phoneValidation.country_code.find((code) =>
          phone.startsWith(code)
        );
        const startOfNetworkCode = matchedCountryCode.length;
        const networkCodeLength = Number(phoneValidation.network_code);
        const phoneNoLength = Number(phoneValidation.phone_no_length);
        const networkCode = phone.slice(
          startOfNetworkCode,
          startOfNetworkCode + networkCodeLength
        );
        if (networkCode.length !== networkCodeLength) {
          errors.push({
            localizedMessage: phoneValidation.error_message,
            target: "$.cart.deliveryGroups[0].deliveryAddress.phone",
          });
        }
        const startOfPhoneNo = startOfNetworkCode + networkCodeLength;
        const actualPhoneNoLength = phone.slice(startOfPhoneNo).length;
        if (actualPhoneNoLength !== phoneNoLength) {
          errors.push({
            localizedMessage: phoneValidation.error_message,
            target: "$.cart.deliveryGroups[0].deliveryAddress.phone",
          });
        }
      }
    }
  }

  return { errors };
}

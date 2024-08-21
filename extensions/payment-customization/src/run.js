/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  /**
   * @type {{
   *   payment_rule: boolean,
   *   conditions: {
   *     type: string,
   *     rule: string,
   *  value: string | string[]
   *   }[],
   *   payment_name: {
   *     match: string,
   *     title: string[]
   *   },
   *   type: string,
   *   paymentMethodName: string,
   *   cartTotal: number,
   *   codAtTop: boolean
   * }}
   */
  const PAYMENT_TYPE = {
    RE_ORDER: "re-order",
    RENAME: "rename",
    HIDE: "hide",
  };
  const CONDITION = {
    COUNTRY: "country",
    TITLE: "title",
    TOTAL_AMOUNT: "total-amount",
  };
  const RULES = {
    CONTAINS: "contains",
    DOES_NOT_CONTAINS: "does-not-contains",
    TOTAL_AMOUNT: "total-amount",
    GREATER_THAN: "greater-than",
    LESS_THAN: "less-than",
    EQUALS_TO: "equals-to",
  };

  const configuration = JSON.parse(
    input?.paymentCustomization?.metafield?.value ?? "{}"
  );
  const obj = JSON.stringify(configuration, null, 2);
  console.log("metafields", obj);

  let operations = [];
  if (configuration.type === PAYMENT_TYPE.RE_ORDER) {
    if (!configuration.payment_rule && configuration.conditions) {
      const countryCodes = input.cart.deliveryGroups.map((group) => {
        return group?.deliveryAddress?.countryCode;
      });
      const deliveryTitles = input.cart.deliveryGroups
        .map((group) => {
          return group?.deliveryOptions?.map((option) => option?.title);
        })
        .flat();
      const totalAmount = parseFloat(input.cart.cost.totalAmount.amount); // Convert amount to number

      const conditionsMet = configuration.conditions.every((condition) => {
        if (
          condition.type === CONDITION.COUNTRY &&
          condition.rule === RULES.CONTAINS
        ) {
          return countryCodes.some((code) => condition.value.includes(code));
        }
        if (
          condition.type === CONDITION.COUNTRY &&
          condition.rule === RULES.DOES_NOT_CONTAINS
        ) {
          return !countryCodes.some((code) => condition.value.includes(code));
        }
        if (
          condition.type === CONDITION.TITLE &&
          condition.rule === RULES.CONTAINS
        ) {
          return deliveryTitles.some((title) =>
            condition.value.includes(title)
          );
        }
        if (
          condition.type === CONDITION.TITLE &&
          condition.rule === RULES.DOES_NOT_CONTAINS
        ) {
          return !deliveryTitles.some((name) => condition.value.includes(name));
        }
        if (condition.type === CONDITION.TOTAL_AMOUNT) {
          const value = parseFloat(condition.value);
          if (condition.rule === RULES.GREATER_THAN) {
            return totalAmount > value;
          }
          if (condition.rule === RULES.LESS_THAN) {
            return totalAmount < value;
          }
          if (condition.rule === RULES.EQUALS_TO) {
            return totalAmount === value;
          }
        } else {
          return false;
        }
      });

      if (conditionsMet) {
        console.log("CONDITION MET ");
        const paymentNames = configuration.payment_name.title;
        paymentNames.forEach((name, index) => {
          let paymentMethod;

          paymentMethod = input.paymentMethods.find((method) =>
            method.name.includes(name)
          );
          if (paymentMethod) {
            operations.push({
              move: {
                paymentMethodId: paymentMethod.id,
                index: index,
              },
            });
          }
        });
      }
    } else {
      console.log("WITHOUT CONDITION");
      const paymentNames = configuration.payment_name.title;
      paymentNames.forEach((name, index) => {
        let paymentMethod;

        paymentMethod = input.paymentMethods.find(
          (method) => method.name === name
        );

        if (paymentMethod) {
          operations.push({
            move: {
              paymentMethodId: paymentMethod.id,
              index: index,
            },
          });
        }
      });
    }
  }

  if (configuration.type === PAYMENT_TYPE.RENAME) {
    const countryCodes = input.cart.deliveryGroups.map((group) => {
      return group?.deliveryAddress?.countryCode;
    });
    const deliveryTitles = input.cart.deliveryGroups
      .map((group) => {
        return group?.deliveryOptions?.map((option) => option?.title);
      })
      .flat();
    const totalAmount = parseFloat(input.cart.cost.totalAmount.amount);

    const checkConditions = configuration.payment_rule
      ? (callback) => configuration.conditions.every(callback)
      : (callback) => configuration.conditions.some(callback);
    const conditionsMet = checkConditions((condition) => {
      if (
        condition.type === CONDITION.COUNTRY &&
        condition.rule === RULES.CONTAINS
      ) {
        return countryCodes.some((code) => condition.value.includes(code));
      }
      if (
        condition.type === CONDITION.COUNTRY &&
        condition.rule === RULES.DOES_NOT_CONTAINS
      ) {
        return !countryCodes.some((code) => condition.value.includes(code));
      }
      if (
        condition.type === CONDITION.TITLE &&
        condition.rule === RULES.CONTAINS
      ) {
        return deliveryTitles.some((title) => condition.value.includes(title));
      }
      if (
        condition.type === CONDITION.TITLE &&
        condition.rule === RULES.DOES_NOT_CONTAINS
      ) {
        return !deliveryTitles.some((name) => condition.value.includes(name));
      }
      if (condition.type === CONDITION.TOTAL_AMOUNT) {
        const value = parseFloat(condition.value);
        if (condition.rule === RULES.GREATER_THAN) {
          return totalAmount > value;
        }
        if (condition.rule === RULES.LESS_THAN) {
          return totalAmount < value;
        }
        if (condition.rule === RULES.EQUALS_TO) {
          return totalAmount === value;
        }
      }
      return false;
    });

    if (conditionsMet) {
      console.log("CONDITION MET");
      configuration.payment_name.forEach((name) => {
        const renamePaymentMethod = input.paymentMethods.find(
          (method) => method.name === name.old
        );

        if (renamePaymentMethod) {
          operations.push({
            rename: {
              paymentMethodId: renamePaymentMethod.id,
              name: name.new,
            },
          });
        }
      });
    } else {
      console.log("NO CONDITION: no change ");
    }
  }

  if (configuration.type === PAYMENT_TYPE.HIDE) {
    const countryCodes = input.cart.deliveryGroups.map((group) => {
      return group?.deliveryAddress?.countryCode;
    });
    const deliveryTitles = input.cart.deliveryGroups
      .map((group) => {
        return group?.deliveryOptions?.map((option) => option?.title);
      })
      .flat();
    const totalAmount = parseFloat(input.cart.cost.totalAmount.amount);

    const checkConditions = configuration.payment_rule
      ? (callback) => configuration.conditions.every(callback)
      : (callback) => configuration.conditions.some(callback);

    const conditionsMet = checkConditions((condition) => {
      if (
        condition.type === CONDITION.COUNTRY &&
        condition.rule === RULES.CONTAINS
      ) {
        return countryCodes.some((code) => condition.value.includes(code));
      }
      if (
        condition.type === CONDITION.COUNTRY &&
        condition.rule === RULES.DOES_NOT_CONTAINS
      ) {
        return !countryCodes.some((code) => condition.value.includes(code));
      }
      if (
        condition.type === CONDITION.TITLE &&
        condition.rule === RULES.CONTAINS
      ) {
        return deliveryTitles.some((title) => condition.value.includes(title));
      }
      if (
        condition.type === CONDITION.TITLE &&
        condition.rule === RULES.DOES_NOT_CONTAINS
      ) {
        return !deliveryTitles.some((name) => condition.value.includes(name));
      }
      if (condition.type === CONDITION.TOTAL_AMOUNT) {
        const value = parseFloat(condition.value);
        if (condition.rule === RULES.GREATER_THAN) {
          return totalAmount > value;
        }
        if (condition.rule === RULES.LESS_THAN) {
          return totalAmount < value;
        }
        if (condition.rule === RULES.EQUALS_TO) {
          return totalAmount === value;
        }
      }
      return false;
    });
    if (conditionsMet) {
      const paymentNames = configuration.payment_name.title;
      paymentNames.forEach((name) => {
        let hidePaymentMethod;

        hidePaymentMethod = input.paymentMethods.find((method) =>
          method.name.includes(name)
        );
        if (hidePaymentMethod) {
          operations.push({
            hide: {
              paymentMethodId: hidePaymentMethod.id,
            },
          });
        }
      });
    } else {
      console.log("no condition");
    }
  }

  console.log("operation  ", operations);

  // If no operations were added, return NO_CHANGES
  if (operations.length === 0) {
    return NO_CHANGES;
  }

  return {
    operations,
  };
}

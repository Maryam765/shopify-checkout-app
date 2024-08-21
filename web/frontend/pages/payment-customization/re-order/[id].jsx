import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  BlockStack,
  Box,
  Button,
  Card,
  ChoiceList,
  Divider,
  Icon,
  InlineGrid,
  InlineStack,
  List,
  Page,
  Select,
  Spinner,
  Text,
  TextField,
  useBreakpoints,
} from "@shopify/polaris";
import { AddTag, SearchAndSelect } from "../../../components";
import { PlusCircleIcon, DeleteIcon } from "@shopify/polaris-icons";
import {} from "@shopify/polaris-icons";
import { useAuthenticatedFetch } from "../../../hooks";
import { useNavigate, useToast } from "@shopify/app-bridge-react";
import { paymentMethods } from "../../../constants";

const ReOrder = () => {
  const shopifyFetch = useAuthenticatedFetch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { show } = useToast();
  const { smUp } = useBreakpoints();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [countries, setCountries] = useState("");
  const [paymentTitles, setPaymentTitles] = useState([]);
  const [formError, setFormError] = useState({
    title: false,
    paymentMethodTitles: false,
  });
  const [formData, setFormData] = useState({
    title: "",
    type: "re-order",
    status: true,
    paymentRule: ["always"],
    paymentRuleConditions: [
      {
        type: "country",
        rule: "contains",
        value: [],
      },
    ],
    paymentName: {
      match: "contain",
      title: paymentTitles,
    },
  });

  const getCountries = async () => {
    try {
      const resp = await fetch("https://countriesnow.space/api/v0.1/countries");
      const data = await resp.json();
      if (resp.ok) {
        const countryArr = [];
        data.data?.forEach((country) => {
          countryArr.push({
            label: country.country,
            value: country.iso2,
          });
        });
        setCountries(countryArr);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateCustomization = async () => {
    try {
      setLoading(true);
      const resp = await shopifyFetch("/api/v1/payment-customization/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          rule_status: formData.status,
          payment_rule: formData.paymentRule[0] === "condition" ? true : false,
          conditions: formData.paymentRuleConditions,
          payment_name: {
            match: "contain",
            title: paymentTitles,
          },
        }),
      });
      const data = await resp.json();
      if (resp.ok) {
        show("Added Successfully!", {
          duration: 2000,
        });
        navigate("/payment-customization");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTitle = (index) => {
    setFormData((prev) => {
      const newArr = [...prev.paymentName.title];
      return {
        ...prev,
        paymentName: {
          ...prev.paymentName,
          title: newArr.filter((_, tempIndex) => tempIndex !== index),
        },
      };
    });
  };

  const handleSortingRuleChange = (index, name, value) => {
    setFormData((prev) => {
      const newRules = prev.paymentRuleConditions;
      newRules[index] = {
        ...newRules[index],
        [name]: value,
      };
      return {
        ...prev,
        paymentRuleConditions: newRules,
      };
    });
  };

  const handlePaymentRuleChange = (name, value) => {
    setFormData((prev) => {
      const newRules = { ...prev.paymentName };
      newRules[name].push(value);
      return {
        ...prev,
        paymentName: newRules,
      };
    });
  };

  const handleFormDataChange = (name, value) => {
    setFormData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const getCustomizationData = async () => {
    try {
      setPageLoading(true);
      const resp = await shopifyFetch(`/api/v1/payment-customization/${id}`);
      const data = await resp.json();
      if (resp.ok) {
        const { getByID } = data;
        setFormData({
          title: getByID.title,
          type: getByID.type,
          status: getByID.rule_status ? ["active"] : ["inactive"],
          paymentRule: getByID.payment_rule ? ["condition"] : ["always"],
          paymentRuleConditions: getByID.conditions,
          paymentName: getByID.payment_name,
        });
        setPaymentTitles(getByID.payment_name.title);

        setPageLoading(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateCustomizationData = async () => {
    setLoading(true);
    const resp = await shopifyFetch(`/api/v1/payment-customization/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: formData.title,
        type: formData.type,
        rule_status: formData.status,
        payment_rule: formData.paymentRule[0] === "condition" ? true : false,
        conditions: formData.paymentRuleConditions,
        payment_name: {
          match: "contain",
          title: paymentTitles,
        },
      }),
    });

    const data = await resp.json();
    if (resp.ok) {
      show("Updated Successfully!", {
        duration: 2000,
      });
      setLoading(false);
      navigate("/payment");
    }
  };

  useEffect(() => {
    if (id !== "create") {
      getCustomizationData();
    }
    getCountries();
  }, []);

  return (
    <>
      {pageLoading ? (
        <div className="loading">
          <Spinner />
        </div>
      ) : (
        <Page
          backAction={{
            content: "",
            onAction: () => navigate("/payment-customization"),
          }}
          title="Re-order Payment Methods"
          // primaryAction={{
          //   loading: loading,
          //   disabled: paymentTitles.length === 0 || formData.title === "",
          //   content: id !== "create" ? "Update" : "Create",
          //   onAction: () => {
          //     id !== "create"
          //       ? updateCustomizationData()
          //       : handleCreateCustomization();
          //   },
          // }}
          primaryAction={{
            content: formData.status === true ? "Turn off" : "Turn on",
            destructive: formData.status === true,
            onAction: () => {
              handleFormDataChange("status", !formData.status);
            },
          }}
        >
          <BlockStack gap={{ xs: "800", sm: "400" }}>
            <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
              <Box
                as="section"
                paddingInlineStart={{ xs: 400, sm: 0 }}
                paddingInlineEnd={{ xs: 400, sm: 0 }}
              >
                <BlockStack gap="100">
                  <Text as="h3" variant="headingMd">
                    Customization Title
                  </Text>
                  <Text as="p" variant="bodyMd">
                    The title for this customization (only view by admin )
                  </Text>
                </BlockStack>
              </Box>
              <Card padding="400" roundedAbove="sm">
                <Box>
                  <TextField
                    onBlur={() =>
                      !formData.title
                        ? setFormError((prev) => {
                            return {
                              ...prev,
                              title: true,
                            };
                          })
                        : null
                    }
                    onFocus={() => {
                      setFormError((prev) => {
                        return {
                          ...prev,
                          title: false,
                        };
                      });
                    }}
                    error={formError.title && "This field is required"}
                    value={formData.title}
                    onChange={(value) => handleFormDataChange("title", value)}
                    placeholder="Ex. Hide COD when total cart price is 1000$ "
                  />
                </Box>
              </Card>
            </InlineGrid>

            {smUp ? <Divider /> : null}
            <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
              <Box
                as="section"
                paddingInlineStart={{ xs: 400, sm: 0 }}
                paddingInlineEnd={{ xs: 400, sm: 0 }}
              >
                <BlockStack gap="100">
                  <Text as="h3" variant="headingMd">
                    Payment Rule
                  </Text>
                </BlockStack>
              </Box>
              <Card roundedAbove="sm">
                <BlockStack gap="400">
                  <Box width="50%">
                    <InlineStack align="space-between">
                      <ChoiceList
                        choices={[
                          {
                            label: "Sort Always",
                            value: "always",
                          },
                        ]}
                        selected={formData.paymentRule}
                        onChange={(value) => {
                          handleFormDataChange("paymentRule", value);
                        }}
                      />
                      <ChoiceList
                        choices={[
                          {
                            label: " Conditionally",
                            value: "condition",
                          },
                        ]}
                        selected={formData.paymentRule}
                        onChange={(value) => {
                          handleFormDataChange("paymentRule", value);
                        }}
                      />
                    </InlineStack>
                  </Box>
                  {formData.paymentRule[0] === "condition" && (
                    <BlockStack gap="200">
                      {formData.paymentRuleConditions.map(
                        (condition, index) => {
                          return (
                            <>
                              <Select
                                value={condition.type}
                                options={[
                                  {
                                    label: "Shipping Title",
                                    value: "title",
                                  },
                                  {
                                    label: "Country",
                                    value: "country",
                                  },
                                ]}
                                onChange={(value) => {
                                  handleSortingRuleChange(index, "type", value);
                                }}
                              />
                              <Select
                                value={condition.rule}
                                options={[
                                  {
                                    label: "Contain",
                                    value: "contain",
                                  },
                                  {
                                    label: "Does not contain",
                                    value: "does-not-contains",
                                  },
                                ]}
                                onChange={(value) => {
                                  handleSortingRuleChange(index, "rule", value);
                                }}
                              />
                              {condition.type === "title" ? (
                                <AddTag
                                  setTags={(value) =>
                                    handleSortingRuleChange(
                                      index,
                                      "value",
                                      value
                                    )
                                  }
                                  tags={condition.value}
                                />
                              ) : (
                                <>
                                  {countries.length > 0 ? (
                                    <SearchAndSelect
                                      allowMultiple={true}
                                      selectedOptions={condition.value}
                                      setSelectedOptions={(value) => {
                                        handleSortingRuleChange(
                                          index,
                                          "value",
                                          value
                                        );
                                      }}
                                      placeholder="Search Country"
                                      selectionOption={countries}
                                    />
                                  ) : (
                                    <BlockStack
                                      align="center"
                                      inlineAlign="center"
                                    >
                                      <Spinner size="small" />
                                    </BlockStack>
                                  )}
                                </>
                              )}
                            </>
                          );
                        }
                      )}
                    </BlockStack>
                  )}
                </BlockStack>
              </Card>
            </InlineGrid>

            {smUp ? <Divider /> : null}
            <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
              <Box
                as="section"
                paddingInlineStart={{ xs: 400, sm: 0 }}
                paddingInlineEnd={{ xs: 400, sm: 0 }}
              >
                <BlockStack gap="100">
                  <Text as="h3" variant="headingMd">
                    Payment Methods
                  </Text>
                </BlockStack>
              </Box>

              <Card roundedAbove="sm">
                <BlockStack gap="400">
                  <BlockStack gap="200">
                    <Box paddingBlockStart="200">
                      <SearchAndSelect
                        hideTags={true}
                        allowMultiple={true}
                        selectionOption={paymentMethods}
                        selectedOptions={paymentTitles}
                        setSelectedOptions={(value) => {
                          setPaymentTitles(value);
                        }}
                        placeholder="Search Methods"
                      />

                      <Box paddingBlockStart="400">
                        <BlockStack gap="200">
                          {paymentTitles.length !== 0 && (
                            <Text variant="headingMd">
                              Reordering Payment Methods
                            </Text>
                          )}
                          <List type="number">
                            {paymentTitles.map((title, index) => {
                              return (
                                <List.Item key={index}>
                                  <div
                                    style={{
                                      width: "200px",
                                    }}
                                  >
                                    <InlineStack align="space-between">
                                      <div
                                        style={{
                                          flexGrow: "1",
                                        }}
                                      >
                                        <Text variant="bodyMd">{title}</Text>
                                      </div>
                                      <Button
                                        icon={DeleteIcon}
                                        onClick={() => {
                                          setPaymentTitles((prev) => {
                                            const newArr = [...prev];
                                            newArr.splice(index, 1);
                                            return newArr;
                                          });
                                        }}
                                      />
                                    </InlineStack>
                                  </div>
                                </List.Item>
                              );
                            })}
                          </List>
                        </BlockStack>
                      </Box>
                    </Box>
                  </BlockStack>
                </BlockStack>
              </Card>
            </InlineGrid>
            <Box
              style={{
                display: "flex",
                justifyContent: "end",
              }}
            >
              <Button
                loading={loading}
                disabled={paymentTitles.length === 0 || formData.title === ""}
                onClick={() => {
                  id !== "create"
                    ? updateCustomizationData()
                    : handleCreateCustomization();
                }}
              >
                {id !== "create" ? "Update" : "Create"}
              </Button>
            </Box>
          </BlockStack>
        </Page>
      )}
    </>
  );
};

export default ReOrder;

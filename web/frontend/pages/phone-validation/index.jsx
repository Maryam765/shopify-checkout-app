import React, { useEffect, useState } from "react";
import {
  Badge,
  Banner,
  Box,
  Button,
  ButtonGroup,
  Card,
  DataTable,
  EmptyState,
  InlineStack,
  Layout,
  Page,
  Spinner,
  Text,
} from "@shopify/polaris";
import { PhoneValidationModal, PlanUpgradeWarning } from "../../components";
import { useAuthenticatedFetch } from "../../hooks";
import { useNavigate, useToast } from "@shopify/app-bridge-react";
import { useAppContext } from "../../context";

const PhoneValidation = () => {
  const { shop, setDisabledCountriesField, setDisabledCountriesPhone } =
    useAppContext();
  const isSubscribed = shop.plan_status === "active";
  const shopifyFetch = useAuthenticatedFetch();
  const { show } = useToast();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingID, setEditingID] = useState("");
  const [editingIndex, setEditingIndex] = useState("");
  const [loading, setLoading] = useState(false);
  const [btnLoadingIndex, setBtnLoadingIndex] = useState(-1);
  const [validations, setValidations] = useState([]);

  const getPhoneValidations = async () => {
    try {
      setLoading(true);
      const resp = await shopifyFetch("api/v1/validation");
      const data = await resp.json();
      if (resp.ok) {
        setValidations(data.phoneValidations);
        setDisabledCountriesPhone(data.usedCountriesForPhoneValidations);
        setDisabledCountriesField(data.usedCountriesForFieldValidations);
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteValidation = async (id, index) => {
    try {
      setBtnLoadingIndex(index);
      const resp = await shopifyFetch(`api/v1/validation/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await resp.json();
      if (resp.ok) {
        show("Validation Deleted!");
        setValidations((prev) => {
          prev.splice(index, 1);
          return prev;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBtnLoadingIndex(-1);
    }
  };

  const tableRows = validations?.map((data, index) => {
    const { phone_validation } = data;
    return [
      data.title,
      phone_validation.country_name,
      phone_validation.country_code.join(","),
      phone_validation.network_code,
      phone_validation.phone_no_length,
      phone_validation.error_message,
      data.enabled ? (
        <Badge tone="success">Active</Badge>
      ) : (
        <Badge tone="attention">Inactive</Badge>
      ),
      <ButtonGroup variant="segmented">
        <Button
          disabled={btnLoadingIndex > -1}
          // onClick={() => {
          //   setModalOpen(true);
          //   setEditingID(data.id);
          //   setEditingIndex(index);
          // }}
          onClick={() => {
            navigate(`/phone-validation/${data.id}`);
          }}
        >
          Edit
        </Button>
        <Button
          disabled={btnLoadingIndex > -1}
          loading={btnLoadingIndex === index}
          variant="primary"
          onClick={() => handleDeleteValidation(data.id, index)}
        >
          Delete
        </Button>
      </ButtonGroup>,
    ];
  });

  const tableHeadings = [
    <Text variant="headingMd">Title</Text>,
    <Text variant="headingMd">Country</Text>,
    <Text variant="headingMd">Country Code</Text>,
    <Text variant="headingMd">Network Code</Text>,
    <Text variant="headingMd">Phone No. Length</Text>,
    <Text variant="headingMd">Error Message</Text>,
    <Text variant="headingMd">Status</Text>,
    <Text variant="headingMd">Actions</Text>,
  ];

  useEffect(() => {
    isSubscribed && getPhoneValidations();
  }, [isSubscribed]);

  return (
    <>
      {!isSubscribed ? (
        <Page>
          <PlanUpgradeWarning />
        </Page>
      ) : (
        <>
          {loading ? (
            <div className="loading">
              <Spinner />
            </div>
          ) : (
            <Page
              title={
                <InlineStack gap="200">
                  <Text variant="headingLg">Phone Validation</Text>
                </InlineStack>
              }
              primaryAction={{
                content: "Add validation",
                onAction: () => navigate("/phone-validation/create"),
              }}
            >
              <Layout>
                <Layout.Section>
                  {validations.length > 0 ? (
                    <>
                      <DataTable
                        columnContentTypes={["text", "text", "text", "text"]}
                        headings={tableHeadings}
                        rows={tableRows}
                      />
                    </>
                  ) : (
                    <Card>
                      <EmptyState
                        heading="Add a phone validation to get started"
                        action={{
                          content: "Add validation",
                          onAction: () => setModalOpen(true),
                          // onAction: () => navigate("/payment-customization"),
                        }}
                        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                      >
                        <p>
                          It looks like you haven't created any validation yet.
                          Click the "Add validation" button to create your own
                          customization
                        </p>
                      </EmptyState>
                    </Card>
                  )}
                </Layout.Section>
              </Layout>
            </Page>
          )}
        </>
      )}
    </>
  );
};

export default PhoneValidation;

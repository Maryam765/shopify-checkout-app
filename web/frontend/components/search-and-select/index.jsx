import React from "react";
import { LegacyStack, Tag, Autocomplete, InlineStack } from "@shopify/polaris";
import { useState, useCallback, useMemo } from "react";

const SearchAndSelect = ({
  placeholder,
  label,
  selectionOption,
  selectedOptions,
  setSelectedOptions,
  allowMultiple,
  hideTags,
}) => {
  const deselectedOptions = useMemo(() => selectionOption, []);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState(deselectedOptions);

  const updateText = useCallback(
    (value) => {
      setInputValue(value);

      if (value === "") {
        setOptions(deselectedOptions);
        return;
      }

      const filterRegex = new RegExp(value, "i");
      const resultOptions = deselectedOptions.filter((option) =>
        option.label.match(filterRegex)
      );

      setOptions(resultOptions);
    },
    [deselectedOptions]
  );

  // const removeTag = useCallback(
  //   (tag) => () => {
  //     const options = [...selectedOptions];
  //     options.splice(options.indexOf(tag), 1);
  //     setSelectedOptions(options);
  //   },
  //   [selectedOptions]
  // );

  const removeTag = useCallback(
    (tagValue) => () => {
      const updatedOptions = selectedOptions.filter(
        (option) => option !== tagValue
      );
      setSelectedOptions(updatedOptions);
    },
    [selectedOptions, setSelectedOptions]
  );

  const tagContent = "";

  const verticalContentMarkup =
    selectedOptions?.length > 0 ? (
      <InlineStack gap="100" alignment="center">
        {selectedOptions.map((selectedValue) => {
          const option = deselectedOptions.find(
            (option) => option.value === selectedValue
          );
          const tagLabel = option ? option.label : selectedValue;
          return (
            <Tag
              key={`option${selectedValue}`}
              onRemove={removeTag(selectedValue)}
            >
              {tagLabel}
            </Tag>
          );
        })}
      </InlineStack>
    ) : null;

  // const verticalContentMarkup =
  //   selectedOptions?.length > 0 ? (
  //     <InlineStack gap="100" alignment="center">
  //       {selectedOptions.map((option) => {
  //         let tagLabel = "";
  //         tagLabel = option?.replace("_", " ");
  //         tagLabel = titleCase(tagLabel);
  //         return (
  //           <Tag key={`option${option}`} onRemove={removeTag(option)}>
  //             {tagLabel}
  //           </Tag>
  //         );
  //       })}
  //     </InlineStack>
  //   ) : null;

  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      label={label}
      value={inputValue}
      placeholder={placeholder}
      verticalContent={!hideTags && verticalContentMarkup}
      autoComplete="off"
    />
  );

  return (
    <Autocomplete
      allowMultiple={allowMultiple}
      options={options}
      selected={selectedOptions}
      textField={textField}
      onSelect={(value) => {
        setSelectedOptions(value);
      }}
      listTitle="Suggested Tags"
    />
  );

  function titleCase(string) {
    return string
      .toLowerCase()
      .split(" ")
      .map((word) => word.replace(word[0], word[0].toUpperCase()))
      .join("");
  }
};

export default SearchAndSelect;

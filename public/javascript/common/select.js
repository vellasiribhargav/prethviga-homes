import TomSelect from "./tomselect.js"; // Update the path based on your file structure
function isTomSelectInitialized(element) {
  return (
    element.hasAttribute("data-tom-select-initialized") ||
    element.classList.contains("ts-wrapper")
  );
}
// Function to get the 'multiple' attribute value and convert it to an integer
function getMultiple(element) {
  const multipleAttr = element.getAttribute("tommultiple");
  return multipleAttr ? parseInt(multipleAttr, 10) : null;
}

// Function to generate options, including handling empty value
function generateOptions(startValue) {
  const options = [
    {
      value: "",
      text: `e.g. ${startValue}`,
      disabled: true,
      className: "select-placeholder", // Custom class for placeholder
    },
  ];
  // Ensure startValue is a number
  const start = Number(startValue);

  // Loop from the startValue up to 100, but only for multiples of 5
  for (let i = start; i <= 100; i += 5) {
    if (i >= start) {
      options.push({ value: i.toString(), text: `${i}` });
    }
  }
  return options;
}

// Function to handle empty selection
function handleEmptyValue(tomSelectInstance) {
  if (!tomSelectInstance.getValue().length) {
    // Select the empty value if no other value is selected
    tomSelectInstance.setValue("");
  }
}

const select = (setSelect) => {
  const selectQuery = setSelect ? setSelect : ".select";
  //console.log('selectQuery :12', selectQuery);
  const selectBoxes = document.querySelectorAll(selectQuery);

  const settings = {
    plugins: ["caret_position", "input_autogrow"],
    controlInput: false,
    allowEmptyOption: true, // Ensure TomSelect allows empty options
    onInitialize: function (select) {
      // Access the initial selected value indirectly
      const selectedOption = this.input.querySelector("option:checked");
      const initialValue = selectedOption ? selectedOption.value : "";

      // Add class to control container if initial value is empty
      if (initialValue === "") {
        const inputContainer = this.control;
        inputContainer.classList.add("select-placeholder");
      }
    },
    onChange: function (value, item, state) {
      const inputContainer = this.control;

      if (value === "") {
        inputContainer.classList.add("select-placeholder");
      } else {
        inputContainer.classList.remove("select-placeholder");
      }
    },
  };

  selectBoxes.forEach((element) => {
    //console.log(isTomSelectInitialized(element),element,getMultiple(element),"select")
    let elementInstance;
    if (!isTomSelectInitialized(element)) {
      elementInstance = new TomSelect(element, settings);
      element.setAttribute("data-tom-select-initialized", "true");
      // Get the 'multiple' attribute value
      const startValue = getMultiple(element);

      // Generate options and update existing options
      if (startValue !== null) {
        const newOptions = generateOptions(startValue);
        // if (optionsToAdd.length > 0) {
        elementInstance.addOption(newOptions);
        // Handle empty value selection
        handleEmptyValue(elementInstance);
      } else {
        //console.log("No valid 'multiple' attribute found for this element.");
      }
    }
  });
};

export default select;

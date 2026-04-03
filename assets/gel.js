class GelDrawer extends HTMLElement {
  constructor() {
    super();
    this.triggerEl = document.querySelector("[data-trigger]");
    this.drawerEl = this.querySelector("[data-drawer]");
    this.closeEl = this.querySelector("[data-close]");
    this.priceEl = this.querySelector("[data-total-price]");
    this.comparePriceEl = this.querySelector("[data-total-compare-price]");
    this.switcherEl = this.querySelector("#subscribe-switch");
    this.nextStepEl = this.querySelector("[data-next-step]");
    this.checkoutEl = this.querySelector("[data-checkout]");
    this.servingEl = this.querySelector("[data-default]");
    this.freeProductEls = [...this.querySelectorAll("[data-free-product]")];
    this.bundlesEl = this.querySelectorAll("[data-bundle-quantity]");
    this.quantityHeadingEls = this.querySelectorAll("[data-quantity-heading]");
    this.flavourHeadingEls = this.querySelectorAll("[data-flavour-heading]");
    this.defaultBundle = this.querySelector("[data-bundle-quantity] input:checked")?.closest("[data-bundle-quantity]")?.getAttribute("data-bundle-quantity");

    this.stepProgressEls = this.querySelectorAll("[data-step-progress]");
    this.stepProgressBarEls = this.querySelectorAll("[data-step-progress-bar]");

    // Notification errors
    this.quantityExceededErrorEl = this.querySelector(
      "[data-quantity-exceeded-error]"
    );
    this.quantityLowErrorEl = this.querySelector("[data-quantity-low-error]");

    // Local state
    this.currentBundle = 0;
    this.isSubscription = true;

    // Event names
    this.clarityTryItNowId = this.getAttribute("data-clarity-try-it-now-id");
    this.clarityTryItNowTheme = this.getAttribute("data-clarity-try-it-now-theme");
    this.clarityChooseFlavorId = this.getAttribute("data-clarity-choose-flavor-id");
    this.clarityChooseFlavorTheme = this.getAttribute("data-clarity-choose-flavor-theme");
    this.clarityAddToCartFirstId = this.getAttribute("data-clarity-add-to-cart-first-id");
    this.clarityAddToCartFirstTheme = this.getAttribute("data-clarity-add-to-cart-first-theme");
    this.clarityAddToCartId = this.getAttribute("data-clarity-add-to-cart-id");
    this.clarityAddToCartTheme = this.getAttribute("data-clarity-add-to-cart-theme");
    this.clarityShowCartId = this.getAttribute("data-clarity-show-cart-id");
    this.clarityShowCartTheme = this.getAttribute("data-clarity-show-cart-theme");
    this.datalayerTryItNow = this.getAttribute("data-datalayer-try-it-now");
    this.datalayerChooseFlavor = this.getAttribute("data-datalayer-choose-flavor");
    this.datalayerAddToCartFirst = this.getAttribute("data-datalayer-add-to-cart-first");
    this.datalayerAddToCart = this.getAttribute("data-datalayer-add-to-cart");
    this.datalayerShowCart = this.getAttribute("data-datalayer-show-cart");
  }

  connectedCallback() {
    this.init();
  }

  // If no duration, error is persistent
  showQuantityExceededError(duration = 0) {
    this.quantityExceededErrorEl?.classList.add("active");
    if (duration > 0) {
      setTimeout(() => {
        this.quantityExceededErrorEl?.classList.remove("active");
      }, duration);
    }
  }

  // If no duration, error is persistent
  showQuantityLowError(duration = 0) {
    this.quantityLowErrorEl?.classList.add("active");
    if (duration > 0) {
      setTimeout(() => {
        this.quantityLowErrorEl?.classList.remove("active");
      }, duration);
    }
  }

  removeAllErrors() {
    this.quantityExceededErrorEl?.classList.remove("active");
    this.quantityLowErrorEl?.classList.remove("active");
  }

  setupErrorListener() {
    window.addEventListener("drawer::error", (event) => {
      const { type, duration } = event.detail;
      this.removeAllErrors();
      if (type === "quantity-exceeded") {
        this.showQuantityExceededError(duration);
      } else if (type === "quantity-low") {
        this.showQuantityLowError(duration);
      }
    });
  }

  updateDynamicInformation() {
    if (!this.drawerEl) return;

    const allFlavors = Array.from(
      this.drawerEl.querySelectorAll("[data-quantity]")
    );

    const maxQuantity = this.drawerEl?.querySelector(`[data-bundle-quantity="${this.currentBundle}"]`)?.getAttribute("data-bundle-quantity");

    const dataFlavorTextDefault =
      this.servingEl?.getAttribute("data-default") || "Choose | more";
    const dataFlavorTextFinal =
      this.servingEl?.getAttribute("data-final") || "Good choice!";

    const actualQuantity = allFlavors.reduce((sum, element) => {
      return sum + (parseInt(element.value, 10) || 0);
    }, 0);

    if (maxQuantity > actualQuantity) {
      if (this.servingEl) {
        this.servingEl.textContent = `${dataFlavorTextDefault.replace(
          "|",
          maxQuantity - actualQuantity
        )}`
      };
      this.checkoutEl?.setAttribute("data-available", "false");
      this.drawerEl.classList.remove("quantity--reached");
    } else if (maxQuantity == actualQuantity) {
      if (this.servingEl) {
        this.servingEl.textContent = `${dataFlavorTextFinal}`
      };
      this.checkoutEl?.setAttribute("data-available", "true");
      this.drawerEl.classList.add("quantity--reached");
    }
  }

  updateDefaultImages() {
    const quantity = this.currentBundle;
    const images = this.querySelectorAll("[data-preview-image]");
    images.forEach((el) => {
      el.classList.remove("available");
      el.classList.remove("active");
      const variantImage = el.querySelector(".variant-image");
      if (variantImage) {
        variantImage.src = "";
        variantImage.dataset.name = "";
      }
    });
    for (let i = 0; i < quantity; i++) {
      images[i]?.classList.add("available");
    }
  }

  updateVariantPrice() {
    if (!this.priceEl || !this.comparePriceEl) return;

    const currentPriceEl = this.querySelector(
    `[data-bundle-quantity="${this.currentBundle}"] [data-bundle-price]`
    );
    const comparePriceEl = this.querySelector(
    `[data-bundle-quantity="${this.currentBundle}"] [data-bundle-compare-price]`
    );

    if (!currentPriceEl || !comparePriceEl) return;

    this.priceEl.innerHTML = currentPriceEl.innerHTML;
    this.comparePriceEl.innerHTML = comparePriceEl.innerHTML;
 }

  onBundleChange() {
    //Remove active class from all bundles
    this.bundlesEl?.forEach((el) => {
      el.classList.remove("active");
    });
    this.querySelector(
      `[data-bundle-quantity="${this.currentBundle}"]`
    )?.classList.add("active");

    this.updateDefaultImages();
    this.updateVariantPrice();
  }

  setupCheckoutListener() {
    this.checkoutEl?.addEventListener("click", () => {
      this.pushClarityEvent(
        "set",
        this.clarityAddToCartFirstTheme,
        `id_${window.Shopify.theme.id}`
      );
      this.pushClarityEvent(
        "event",
        this.clarityAddToCartFirstId + " " + window.Shopify.theme.id
      );
      this.pushDataLayerEvent({
        event: this.datalayerAddToCartFirst + " " + window.Shopify.theme.id,
      });

      if (!this.drawerEl) return;
      const variantItems = this.drawerEl.querySelectorAll("variant-item");
      let totalQuantity = 0;

      variantItems.forEach((item) => {
        totalQuantity += parseInt(item.getQuantity() || 0);
      });

      console.log(totalQuantity, this.currentBundle);

      if (totalQuantity > this.currentBundle) {
        this.showQuantityExceededError(3000);
        return;
      }

      if (totalQuantity < this.currentBundle) {
        this.showQuantityLowError(3000);
        return;
      }

      this.addItemsToCart();
    });
  }

  setupBundleChangeListener() {
    this.bundlesEl?.forEach((el) => {
      el.addEventListener("click", () => {
        this.currentBundle = +el.getAttribute("data-bundle-quantity");

        this.onBundleChange();
        this.resetAllVariants();
      });
    });

    this.currentBundle = this.querySelector("[data-bundle-quantity] input:checked")?.closest("[data-bundle-quantity]")?.getAttribute("data-bundle-quantity");
    this.onBundleChange();
  }

  handlePlanChange() {
    document
      .querySelector(".recharge-subscription-widget .subscription-radio input")
      ?.dispatchEvent(new Event("change"));

    if (!this.drawerEl) return;

    if (this.isSubscription) {
      this.drawerEl.classList.remove("onetime-plan");
    } else {
      this.drawerEl.classList.add("onetime-plan");
    }

    const variantItems = this.drawerEl.querySelectorAll("variant-item");
    variantItems.forEach((item) => {
      console.log("item", this.isSubscription);
      if (item && typeof item.addSellingPlan === 'function') {
        item.addSellingPlan(this.isSubscription);
      }
    });
  }

  setupPlanSwitcherListener() {
    this.switcherEl?.addEventListener("click", () => {
      this.switcherEl.classList.toggle("active");

      this.isSubscription = !this.isSubscription;
      this.handlePlanChange();
    });
  }

  // 0 for quantity step, 1 for flavor step
  onStepChange(step) {
    if (!this.drawerEl) return;

    switch (step) {
      case 0:
        this.drawerEl.classList.remove("flavor-step");
        this.quantityHeadingEls?.forEach((el) => el?.classList.add("active"));
        this.flavourHeadingEls?.forEach((el) => el?.classList.remove("active"));
        this.stepProgressBarEls?.forEach((el) => el?.classList.remove("full"));
        this.stepProgressEls?.forEach((el) => el && (el.innerHTML = "1 of 2"));
        break;
      case 1:
        this.drawerEl.classList.add("flavor-step");
        this.quantityHeadingEls?.forEach((el) => el?.classList.remove("active"));
        this.flavourHeadingEls?.forEach((el) => el?.classList.add("active"));
        this.stepProgressBarEls?.forEach((el) => el?.classList.add("full"));
        this.stepProgressEls?.forEach((el) => el && (el.innerHTML = "2 of 2"));
        break;
      default:
        break;
    }
  }

  pushClarityEvent(...args) {
    window.clarity && window.clarity(...args);
  }

  pushDataLayerEvent(event) {
    window.dataLayer && window.dataLayer.push(event);
  }

  setupNextStepListener() {
    if (!this.nextStepEl) return;
    this.nextStepEl.addEventListener("click", () => {
      this.pushClarityEvent(
        "set",
        this.clarityChooseFlavorTheme,
        `id_${window.Shopify.theme.id}`
      );
      this.pushClarityEvent(
        "event",
        this.clarityChooseFlavorId + " " + window.Shopify.theme.id
      );
      this.pushDataLayerEvent({
        event: this.datalayerChooseFlavor + " " + window.Shopify.theme.id,
      });

      this.onStepChange(1);
      this.resetAllVariants();
      this.updateDynamicInformation();
    });
  }

  resetAllVariants() {
    if (!this.drawerEl) return;
    const variantsItems = this.drawerEl.querySelectorAll("variant-item");

    for (const el of variantsItems) {
      el?.setQuantity(0);
      el?.toggleQuantityField(0);
      el?.addEventListener("click", el.showSelectorAndSetFitstValue);
      el?.classList.remove("active-card");
      el?.classList.remove("_not-active-item");
    }
  }

  resetAll() {
    this.currentBundle = this.defaultBundle;
    // Set default bundle as checked
    const dataBundleQuantity = this.querySelector(`[data-bundle-quantity="${this.defaultBundle || ''}"] input[type="radio"]`);

    if (dataBundleQuantity instanceof HTMLInputElement) {
      dataBundleQuantity.checked = true;
    }

    // Default to subscription enabled
    this.isSubscription = true;
    this.switcherEl?.classList.remove("active");
    this.handlePlanChange();

    this.resetAllVariants();
    this.onBundleChange();
    this.updateDynamicInformation();
  }

  formDataToItems(formData) {
    const items = {};

    for (const [key, value] of formData.entries()) {
      const match = key.match(/^items\[(\d+)\]\[(.+)\]$/);
      if (!match) continue;

      const [, index, rest] = match;

      if (!items[index]) {
        items[index] = {};
      }

      const nestedMatch = rest.match(/^(\w+)\]\[(.+)$/);
      if (nestedMatch) {
        const [, parent, child] = nestedMatch;
        if (!items[index][parent]) {
          items[index][parent] = {};
        }
        items[index][parent][child] = value;
      } else {
        items[index][rest] = value;
      }
    }

    return Object.values(items)
      .filter(item => Number(item.quantity) > 0)
      .map(item => ({
        id: Number(item.id),
        quantity: Number(item.quantity),
        ...(item.selling_plan ? { selling_plan: Number(item.selling_plan) } : {}),
        ...(item.properties && Object.keys(item.properties).length ? { properties: item.properties } : {})
      }));
  }


  setupVariantListener() {
    window.addEventListener("update::value", (event) => {
      let { name, type, image } = event.detail;
      const images = this.querySelectorAll("[data-preview-image]");

      const availableImages = Array.from(images).filter((img) =>
        img.classList.contains("available")
      );

      switch (type) {
        case "add": {
          const targetElement = availableImages.find(
            (img) => {
              const variantImg = img.querySelector(".variant-image");
              return variantImg && !variantImg.dataset.name;
            }
          );

          if (targetElement) {
            const variantElement =
              targetElement.querySelector(".variant-image");
            if (variantElement) {
              console.log("variant element", variantElement);
              console.log("image", image);
              console.log("name", name);
              variantElement.src = image;
              variantElement.dataset.name = name;
              targetElement.classList.add("active");
              console.log(variantElement.src, variantElement.dataset.name);
            }
          }
          break;
        }
        case "remove": {
          const targetElement = [...availableImages]
            .reverse()
            .find(
              (img) => {
                const variantImg = img.querySelector(".variant-image");
                return variantImg && variantImg.dataset.name === name;
              }
            );

          if (targetElement) {
            let variantElement = targetElement.querySelector(".variant-image");
            if (variantElement) {
              variantElement.src = "";
              variantElement.dataset.name = "";
              targetElement.classList.remove("active");
            }
          }
          break;
        }
        default:
          break;
      }

      const filledImages = availableImages.filter(
        (img) => {
          const variantImg = img.querySelector(".variant-image");
          return variantImg && variantImg.dataset.name;
        }
      );
      const emptyImages = availableImages.filter(
        (img) => {
          const variantImg = img.querySelector(".variant-image");
          return !variantImg || !variantImg.dataset.name;
        }
      );

      filledImages.forEach((img, index) => {
        const targetVariant =
          availableImages[index]?.querySelector(".variant-image");
        const sourceVariant = img.querySelector(".variant-image");
        if (targetVariant && sourceVariant) {
          targetVariant.src = sourceVariant.src;
          targetVariant.dataset.name = sourceVariant.dataset.name;
          availableImages[index].classList.add("active");
        }
      });

      emptyImages.forEach((img, index) => {
        const targetVariant =
          availableImages[filledImages.length + index]?.querySelector(
            ".variant-image"
          );
        if (targetVariant) {
          targetVariant.src = "";
          targetVariant.dataset.name = "";
          availableImages[filledImages.length + index].classList.remove("active");
        }
      });

      this.updateDynamicInformation();
    });
  }

  async getCartItems() {
    try {
      const cart = await fetch("/cart.js");
      const cartItems = await cart.json();
      return cartItems.items;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async addItemsToCart() {
    try {
      const formEl = this.querySelector("form");
      let formData = new FormData(formEl);
      // formData = new URLSearchParams(formData).toString();

      const cartDrawer = document.querySelector("cart-drawer");

      const cartItems = await this.getCartItems();

      const formItems = this.formDataToItems(formData);
      const unifiedItems = [...formItems];

      for (const freeProductEl of this.freeProductEls) {
        // Check if eligible for free product
        const freeProduct = freeProductEl?.value;
        const freeProductQuantity = freeProductEl?.dataset.quantity;

        const freeProductInCart = cartItems.find(
          (item) => item.variant_id == freeProduct
        );
        const shouldAddFreeProduct =
          freeProduct &&
          this.isSubscription &&
          freeProductQuantity !== "0" &&
          !freeProductInCart;

        // Add it first so that it shows up below the actual products
        if (shouldAddFreeProduct) {
          unifiedItems.unshift({
            id: freeProduct,
            quantity: +freeProductQuantity
          });

          // await cartDrawer.addToCart(
          //   JSON.stringify({
          //     items: [
          //       {
          //         id: freeProduct,
          //         quantity: +freeProductQuantity 
          //       },
          //     ],
          //   }),
          //   {
          //     "Content-Type": "application/json",
          //   }
          // );
        }
      }

      this.closeDrawer();


      this.pushClarityEvent(
        "set",
        this.clarityAddToCartTheme,
        `id_${window.Shopify.theme.id}`
      );
      this.pushClarityEvent(
        "event",
        this.clarityAddToCartId + " " + window.Shopify.theme.id
      );
      this.pushDataLayerEvent({
        event: this.datalayerAddToCart + " " + window.Shopify.theme.id,
      });

      // function cleanAndRenumberItems(formData) {
      //   const itemIndexes = new Set();

      //   // STEP 1: Determine which item indexes have quantity > 0
      //   for (const [key, value] of formData.entries()) {
      //     const match = key.match(/^items\[(\d+)\]\[quantity\]$/);
      //     if (match && Number(value) > 0) {
      //       itemIndexes.add(match[1]);
      //     }
      //   }

      //   // STEP 2: Rebuild FormData with only kept items, renumbered
      //   const newFormData = new FormData();
      //   let newIndex = 1;

      //   for (const oldIndex of Array.from(itemIndexes).sort((a, b) => a - b)) {
      //     // Append all fields for this old index
      //     for (const [key, value] of formData.entries()) {
      //       if (key.startsWith(`items[${oldIndex}]`)) {
      //         const newKey = key.replace(`items[${oldIndex}]`, `items[${newIndex}]`);
      //         newFormData.append(newKey, value);
      //       }
      //     }
      //     newIndex++;
      //   }

      //   // STEP 3: Copy over non-item fields
      //   for (const [key, value] of formData.entries()) {
      //     if (!key.startsWith("items[")) {
      //       newFormData.append(key, value);
      //     }
      //   }

      //   return newFormData;
      // }

      const config = fetchConfig('javascript');
      // config.headers['X-Requested-With'] = 'XMLHttpRequest';
      // delete config.headers['Content-Type'];

      // const response = await cartDrawer.addToCart(cleanAndRenumberItems(formData), config.headers);
      const response = await cartDrawer.addToCart(JSON.stringify({ items: unifiedItems }), config.headers);

      // Assume successful ATC event and cart drawer is opened
      this.pushClarityEvent(
        "set",
        this.clarityShowCartTheme,
        `id_${window.Shopify.theme.id}`
      );
      this.pushClarityEvent("event", this.clarityShowCartId + " " + window.Shopify.theme.id);
      this.pushDataLayerEvent({
        event: this.datalayerShowCart + " " + window.Shopify.theme.id,
      });
    } catch (error) {
      console.log(error);
    }
  }

  init() {
    this.triggerEl?.addEventListener("click", () => this.handleOpen());
    this.closeEl?.addEventListener("click", () => this.handleClose());
    this.setupErrorListener();
    this.setupBundleChangeListener();
    this.setupPlanSwitcherListener();
    this.setupNextStepListener();
    this.setupVariantListener();
    this.setupCheckoutListener();
    this.resetAll();
  }

  handleOpen() {
    this.pushClarityEvent(
      "set",
      this.clarityTryItNowTheme,
      `id_${window.Shopify.theme.id}`
    );
    this.pushClarityEvent("event", this.clarityTryItNowId + " " + window.Shopify.theme.id);
    this.pushDataLayerEvent({
      event: this.datalayerTryItNow + " " + window.Shopify.theme.id,
    });

    this.drawerEl?.classList.add("drawer-open");
    document.body.classList.add("overflow-hidden");
    document.body.classList.add("body-fixed");

    this.onStepChange(0);
  }

  closeDrawer() {
    this.resetAll();

    this.drawerEl?.classList.remove("drawer-open");
    this.drawerEl?.classList.remove("flavor-step");
    document.body.classList.remove("overflow-hidden");
    document.body.classList.remove("body-fixed");
  }

  handleClose() {
    if (this.drawerEl?.classList.contains("flavor-step")) {
      this.onStepChange(0);
      this.resetAllVariants();
      this.updateDefaultImages();
    } else {
      this.closeDrawer();
    }
  }
}

class VariantItem extends HTMLElement {
  // Constructor to initialize the element

  constructor() {
    super();

    this._active = false;

    // Parse the JSON data from the element with the attribute 'data-json'
    const jsonEl = this.querySelector('[data-json]');
    if (jsonEl) {
      this.json = JSON.parse(jsonEl.textContent);
    }

    this.buttonAdd = this.querySelector('.gel-bf-drawer__pick--flavour--add');

    // don`t remove

    // Initialize various input and field elements

    this.wrapperList = this.closest("[data-list-variant]");
    this.allVariants = this.wrapperList?.querySelectorAll("variant-item") || [];
    this.buttons = this.querySelectorAll("button");

    this.inputQuantity = this.querySelector("[data-quantity]");
    this.inputSelling = this.querySelector("[data-selling]");
    this.inputPrice = this?.querySelector?.('[data-price]') || null;

    this.fieldQuntity = this.querySelector(
      ".gel-bf-drawer__pick--flavour--quantity"
    );
    this.fieldQuntityValue = this.fieldQuntity?.querySelector("input") || null;
    this.fieldQuntityPlus = this.fieldQuntity?.querySelector("[name='plus']") || null;
    this.fieldQuntityMinus = this.fieldQuntity?.querySelector("[name='minus']") || null;
    this.widget = null;

    // Find the element with the class 'list_variants-quantity' to scroll to it
    this.variantPicker = document.querySelector(
      ".gel-bf--drawer__list--quantity-header"
    );

    // Initialize the element

    this.textBadgeCounter = document.querySelector(
      ".gel-bf-drawer__list--flavour-title .small-badge"
    );

    this.init();
  }

  // Setter for the 'active' property

  set active(value) {
    this._active = value;
    this.checkActive();
  }
  // Getter for the 'active' property

  get active() {
    return this._active;
  }

  // Toggle the 'active' class based on the 'active' property

  checkActive() {
    this.classList.toggle("active-card", this._active);

    return this.classList.contains("active-card");
  }

  // Initialize the element with event listeners and necessary checks

  init() {
    if (!this.inputQuantity || !this.inputSelling || !this.buttonAdd) {
      console.error("Required elements not found.");
      return;
    }

    // Add click event listener to the element to show the selector and set the first value
    this.addEventListener("click", this.showSelectorAndSetFitstValue);

    // Add click event listeners to various elements for quantity change and prevent default behavior

    [this.fieldQuntityPlus, this.fieldQuntityMinus, this.buttonAdd].forEach(
      (el) => {
        if (el) {
          el.addEventListener("click", (e) => {
            console.log("Clicked");
            this.changeQuantity(e);
          });
        }
      }
    );

    // Delete default behavior for certain elements
    this.deleteDefault(
      this.fieldQuntityPlus,
      this.fieldQuntityMinus,
      this.buttonAdd
    );
    this.findWidget();
    this.setPrice(this.getQuantity());
  }

  // Scroll to the picker element and show the notification
  scrollToPicker() {
    this.variantPicker?.scrollIntoView({ behavior: "smooth", block: "center" });
    console.log("called");
    window.dispatchEvent(
      new CustomEvent("drawer::error", {
        detail: {
          type: "quantity-exceeded",
          duration: 2500,
        },
      })
    );
  }

  // Show the selector and set the first value
  showSelectorAndSetFitstValue() {
    if (this.getQuantity() === 0) {
      this.buttonAdd?.dispatchEvent(new Event("click", { cancelable: true }));
      //remove duplicate event by Sviridov
      // this.buttonAdd.click();
    }

    // fix remove event listener for non-active button by Sviridov
    if (this.classList.contains("_not-active-item")) return;

    this.removeEventListener("click", this.showSelectorAndSetFitstValue);
  }

  // Delete default behavior for specified elements
  deleteDefault(...rest) {
    [...rest].forEach((el) => {
      el?.addEventListener("click", (e) => e.preventDefault());
    });
  }

  // Toggle the quantity field visibility based on the quantity value

  toggleQuantityField(quantity) {
    // don`t remove
    if (this.buttonAdd) {
      this.buttonAdd.style.display = quantity <= 0 ? "flex" : "none";
    }
    if (this.fieldQuntity) {
      this.fieldQuntity.style.display = quantity <= 0 ? "none" : "flex";
    }
  }

  // Change the quantity based on the clicked button
  changeQuantity(event) {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target;

    // Total amount of items you can select (hardcoded)
    // const globalQuantity = document
    //   .querySelector("[data-global-quantity]")
    //   .getAttribute("data-global-quantity");

    // Current active variants
    const currentActive = [...document.querySelectorAll("variant-item")].filter(
      (e) => e.active
    );

    // Current total value of active variants
    const currentValue = currentActive.reduce(
      (acc, e) => acc + e.getQuantity(),
      0
    );

    // Maximum value of items you can select
    const maxValue = document
      .querySelector(`[data-bundle-quantity] :checked`)?.closest("[data-bundle-quantity]")?.getAttribute("data-bundle-quantity");

    console.log("maxValue", maxValue, currentValue);

    //check if the variant select is not able to click then scroll to the picker end show message
    if (this.classList.contains("_not-active-item")) {
      //   if (maxValue < globalQuantity) {
      this.scrollToPicker();
      //   }
      return;
    }

    let count = Number(
      this.textBadgeCounter?.getAttribute("data-selected") ?? "0"
    );
    let itemName = this.querySelector("[data-quantity]").getAttribute("name");
    let itemImage =
      this.querySelector("[data-quantity]").getAttribute("data-image");

    console.log(target.name);
    switch (target.name) {
      case "button":
        if (currentValue < maxValue) {
          this.setQuantity(1);
          this.textBadgeCounter &&
            this.textBadgeCounter.setAttribute("data-selected", `${count + 1}`);

          window.dispatchEvent(
            new CustomEvent("update::value", {
              bubbles: true,
              detail: { name: itemName, type: "add", image: itemImage },
            })
          );
        } else {
          this.scrollToPicker();
        }
        break;
      case "plus":
        if (currentValue < maxValue) {
          this.setQuantity(Number(this.getQuantity()) + 1);
          this.textBadgeCounter &&
            this.textBadgeCounter.setAttribute("data-selected", `${count + 1}`);
          window.dispatchEvent(
            new CustomEvent("update::value", {
              bubbles: true,
              detail: { name: itemName, type: "add", image: itemImage },
            })
          );
        } else {
          console.log("exceeded");
          //   console.log(maxValue, globalQuantity);
          //   if (maxValue < globalQuantity) {
          this.scrollToPicker();
          //   }
        }
        break;
      case "minus":
        this.setQuantity(Number(this.getQuantity()) - 1);
        this.textBadgeCounter &&
          this.textBadgeCounter.setAttribute("data-selected", `${count - 1}`);
        window.dispatchEvent(
          new CustomEvent("update::value", {
            bubbles: true,
            detail: { name: itemName, type: "remove", image: itemImage },
          })
        );
        break;
      default:
        break;
    }

    // Get total quantity across all variants
    const allVariantItems = document.querySelectorAll("variant-item");
    const newTotal = [...allVariantItems].reduce(
      (acc, e) => acc + e.getQuantity(),
      0
    );

    console.log("newTotal", newTotal, maxValue);
    // If total matches/exceeds bundle quantity, add _not-active-item class to other variants
    if (newTotal >= maxValue) {
      allVariantItems.forEach((item) => {
        if (item !== this && item.getQuantity() === 0) {
          item.classList.add("_not-active-item");
        }
      });
    } else {
      // Remove _not-active-item class if total is less than bundle quantity
      allVariantItems.forEach((item) => {
        item.classList.remove("_not-active-item");
      });
    }

    document.dispatchEvent(new Event("change::value", { bubbles: true }));

    const quantity = this.getQuantity();
    this.toggleQuantityField(quantity);

    this.setPrice(quantity);
    if (quantity === 0) {
      setTimeout(() => {
        this.addEventListener("click", this.showSelectorAndSetFitstValue);
      }, 0);
    }
    const fullPriceEl = this.wrapperList?.querySelector("[data-full-price]");
    if (fullPriceEl) {
      fullPriceEl.dispatchEvent(new Event("change"));
    }
  }

  // Get the quantity value

  getQuantity() {
    return Number(this.inputQuantity.value);
  }

  // Set the quantity value

  setQuantity(quantity) {
    if (this.inputQuantity) {
      this.inputQuantity.value = quantity;
    }
    if (this.fieldQuntityValue) {
      this.fieldQuntityValue.value = quantity;
    }
  }

  // Set the price based on the quantity

  setPrice(quantity) {
    if (!this.inputPrice) return;

    const baseValue = Number(this.inputPrice.getAttribute('data-value')) || 0;
    const finalPrice = (baseValue * quantity).toFixed(2);

    this.inputPrice.value = finalPrice;

    this.setFullPrice?.();

    this.active = Number(finalPrice) !== 0;
  }


  // Calculate and set the full price for all variants

  setFullPrice() {
    if (!this.wrapperList) return;

    const arrayVariants = this.allVariants;
    const fullPriceEl = this.wrapperList.querySelector("[data-full-price]");
    if (!fullPriceEl) return;

    const firstPrice = fullPriceEl.getAttribute("data-value");
    let fullPrice = 0;
    for (let variant of arrayVariants) {
      const priceEl = variant.querySelector("[data-price]");
      if (priceEl) {
        let currentValuePrice = Number(priceEl.value);
        fullPrice += currentValuePrice;
      }
    }
    fullPriceEl.value =
      fullPrice != 0
        ? fullPrice.toFixed(2)
        : (Number(firstPrice) / 100).toFixed(2);
    fullPriceEl.setAttribute("data-select-variant", fullPrice != 0 ? "true" : "false");
  }

  // Find the widget
  findWidget() {
    const timerfindWidget = setInterval(checkWidget.bind(this), 100);
    function checkWidget() {
      if (document.querySelector(".rc-widget")) {
        clearInterval(timerfindWidget);
        this.widget = document.querySelector(".rc-widget");
        this.observeTheWidget(this.widget.querySelector(".subscription-radio"));
        this.checkSubscribeAfterLoad(
          this.widget.querySelector(".subscription-radio")
        );
      }
    }
  }

  // Observe changes in the widget and add selling plan
  observeTheWidget(element) {
    if (!element) return;
    let activeSubscribe;
    let observer = new MutationObserver((mutations) => {
      activeSubscribe =
        mutations[0].target.classList.contains("rc-radio--active");
      this.addSellingPlan(activeSubscribe);
    });
    observer.observe(element, { attributes: true, subtree: true });
  }

  // Check for the active subscription after the widget is loaded
  checkSubscribeAfterLoad(element) {
    if (!element) return;
    let activeSubscribe = element.classList.contains("rc-radio--active");
    this.addSellingPlan(activeSubscribe);
    const fullPriceEl = this.wrapperList?.querySelector("[data-full-price]");
    if (fullPriceEl) {
      fullPriceEl.setAttribute("data-subscribe", activeSubscribe);
    }
  }

  // Add selling plan based on the subscription flag
  addSellingPlan(flag) {
    if (!this.json || !this.json.selling_plan_allocations || !this.json.selling_plan_allocations[0]) return;
    const sellingPlanId = this.json.selling_plan_allocations[0].selling_plan_id;
    if (this.inputSelling) {
      this.inputSelling.value = flag ? sellingPlanId : "";
    }
    const fullPriceEl = this.wrapperList?.querySelector("[data-full-price]");
    if (fullPriceEl) {
      fullPriceEl.setAttribute("data-subscribe", flag);
    }
  }
}

if (!customElements.get("variant-item")) {
  customElements.define("variant-item", VariantItem);
}
if (!customElements.get("gel-drawer")) {
  customElements.define("gel-drawer", GelDrawer);
}